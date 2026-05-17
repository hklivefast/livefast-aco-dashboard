import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { getSupabase } from "@/lib/supabase";
import { getSessionCookie, verifySession } from "@/lib/session";
import { decrypt } from "@/lib/crypto";
import { notifyOrderEvents } from "@/lib/notify";

/* ═══════════════════════════════════════════════════════════════
   RETAILER DEFINITIONS
   Each retailer has:
   - senders: email domains/addresses to search for
   - subjectPatterns: regexes that mark an email as order-related
   - orderNumPatterns: ordered list of regexes to extract order number
   - statusRules: subject/body keywords mapped to status
   - totalPatterns: ordered regexes to extract dollar total
   - itemPatterns: regexes to pull individual product names from HTML/text
   - trackingPatterns: regexes to extract tracking numbers
   - carrierPatterns: regexes/keywords to identify carrier
   ═══════════════════════════════════════════════════════════════ */

// Subjects that are NEVER order emails -- reject aggressively
// The scraper should ONLY find: order confirmations, thank-you-for-shopping,
// items shipped, items arriving today, items delivered, cancellations/refunds.
const REJECT_PATTERNS = [
  // Sales, promos, coupons
  /\b(?:sale|promo|coupon|deal|save|discount|% off|\$\d+ off|clearance|limited.?time|flash sale|BOGO|buy one|free shipping offer|price drop|price alert)\b/i,
  // Newsletters, digests, marketing
  /\b(?:newsletter|weekly|daily|digest|roundup|picks for you|trending|new arrivals|just dropped|check out|what's new|spotlight|highlights|wrap.?up|this week)\b/i,
  // Surveys, reviews, feedback
  /\b(?:survey|feedback|rate your|review your experience|how did we do|tell us|rate us|leave.?a.?review|share your|opinion|satisfaction)\b/i,
  // Rewards, loyalty, points
  /\b(?:reward|circle|points|bonus|earn|redeem|loyalty|member.?exclusive|wallet|cashback|cash back|level up|tier|star|badge)\b/i,
  // Account, security, passwords
  /\b(?:subscribe|unsubscribe|preferences|opt.?in|sign up|join|password|security|verify your|account.?update|two.?factor|login|reset|welcome to|activate your)\b/i,
  // Gift cards, registries, wishlists
  /\b(?:gift.?card|registry|wish.?list|gift guide|gifting|baby shower|wedding)\b/i,
  // Browse, shop, explore
  /\b(?:shop now|browse|explore|discover|featured|top picks|recommended|you might like|because you|inspired by|based on|similar|style|look)\b/i,
  // App, download, notifications prefs
  /\b(?:download.?(?:the|our).?app|app.?store|google play|notification.?settings|manage.?emails|email.?preferences|communication.?preferences)\b/i,
  // Recalls, safety alerts (not order-related)
  /\b(?:product recall|safety notice|safety alert|important safety)\b/i,
  // Community, social, contests
  /\b(?:contest|sweepstakes|giveaway|enter to win|vote|community|follow us|social|share|refer.?a.?friend)\b/i,
  // Store events, holidays
  /\b(?:store hours|holiday hours|black friday|cyber monday|memorial day|labor day|coming soon|pre.?register|waitlist|notify me|get notified)\b/i,
  // Receipts for in-store only (no order number context)
  /\b(?:in.?store receipt|store receipt|receipt for your visit)\b/i,
];

function isRejectEmail(subject) {
  return REJECT_PATTERNS.some(re => re.test(subject));
}

const RETAILERS = {
  target: {
    label: "Target",
    senders: ["target.com", "target@target.com", "no-reply@target.com"],
    subjectPatterns: [
      /your\s+(?:order|target\.com\s+order)/i,
      /order\s*#?\s*\d{3}-\d{3}-\d{4}/i,
      /order\s+(?:has been\s+)?(?:confirmed|placed|shipped|delivered|cancelled|updated)/i,
      /thank\s*(?:s|you)\s+for\s+(?:your\s+)?(?:order|shopping|purchase)/i,
      /(?:has|have)\s+(?:been\s+)?shipped/i,
      /(?:has|have)\s+(?:been\s+)?delivered/i,
      /ready\s*for\s*pickup|pickup\s*(?:is\s*)?ready/i,
      /on\s+(?:its|the)\s+way/i,
      /out\s+for\s+delivery/i,
      /arriving\s+(?:today|tomorrow|soon)/i,
      /(?:item|order)\s+(?:has been\s+)?cancel/i,
      /(?:refund|return)\s+(?:has been\s+)?(?:processed|initiated|issued|confirmed)/i,
    ],
    orderNumPatterns: [
      /order\s*#?\s*:?\s*(\d{3}-\d{3}-\d{4})/i,
      /order\s*(?:number|#|no\.?)\s*:?\s*(\d{3}-\d{3}-\d{4})/i,
      /(\d{3}-\d{3}-\d{4})/,
      /order\s*#?\s*:?\s*(\d{9,15})/i,
    ],
    statusRules: [
      { pattern: /delivered|has\s*arrived|was\s*delivered/i, status: "Delivered" },
      { pattern: /ready\s*for\s*pickup|pickup\s*(?:is\s*)?ready|available\s*for\s*pickup/i, status: "Ready for Pickup" },
      { pattern: /out\s*for\s*delivery|arriving\s*today|arriving\s*soon/i, status: "Out for Delivery" },
      { pattern: /shipped|on\s*(?:its|the)\s*way|has\s*left|in\s*transit/i, status: "Shipped" },
      { pattern: /cancel/i, status: "Cancelled" },
      { pattern: /refund/i, status: "Refunded" },
      { pattern: /return(?:ed)?/i, status: "Returned" },
      { pattern: /order\s*(?:confirmed|placed|received)|thanks?\s*for\s*(?:your\s*)?order|confirmation/i, status: "Confirmed" },
    ],
    totalPatterns: [
      /order\s*total\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /total\s*(?:charged|paid|amount)\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /(?:you\s*(?:paid|were\s*charged))\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /(?:grand\s*total|estimated\s*total)\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /(?:total)\s*\$\s*([\d,]+\.\d{2})/i,
    ],
    itemPatterns: [
      // Target emails typically have product names in structured HTML tables
      /class="[^"]*item[^"]*"[^>]*>([^<]{5,80})</i,
      /(?:item|product)\s*:?\s*([^\n<]{5,100})/gi,
    ],
    trackingPatterns: [
      /tracking\s*(?:number|#|no\.?)?\s*:?\s*\n?\s*([A-Z0-9]{12,30})/i,
      /track(?:ing)?\s*(?:your\s*)?(?:package|order|shipment)\s*:?\s*\n?\s*([A-Z0-9]{12,30})/i,
      /(?:ups|usps|fedex|ontrac|lasership)\s*(?:tracking)?\s*:?\s*#?\s*([A-Z0-9]{10,30})/i,
    ],
    carrierPatterns: [
      { pattern: /\b1Z[A-Z0-9]{16}\b/i, carrier: "UPS" },
      { pattern: /\b(?:92|94|93|95)\d{18,22}\b/, carrier: "USPS" },
      { pattern: /\b\d{12,15}\b/, carrier: "FedEx" },
      { pattern: /ups/i, carrier: "UPS" },
      { pattern: /usps|united\s*states\s*postal/i, carrier: "USPS" },
      { pattern: /fedex|federal\s*express/i, carrier: "FedEx" },
      { pattern: /ontrac/i, carrier: "OnTrac" },
      { pattern: /lasership|laser\s*ship/i, carrier: "LaserShip" },
      { pattern: /dhl/i, carrier: "DHL" },
    ],
  },

  walmart: {
    label: "Walmart",
    senders: ["walmart.com", "help@walmart.com", "no-reply@walmart.com", "orders@walmart.com"],
    subjectPatterns: [
      /your\s+(?:order|walmart(?:\.com)?\s+order)/i,
      /order\s*#?\s*\d{3}-\d{7}-\d{7}/i,
      /order\s+(?:has been\s+)?(?:confirmed|placed|shipped|delivered|cancelled|updated)/i,
      /thank\s*(?:s|you)\s+for\s+(?:your\s+)?(?:order|shopping|purchase)/i,
      /(?:has|have)\s+(?:been\s+)?shipped/i,
      /(?:has|have)\s+(?:been\s+)?delivered/i,
      /ready\s*for\s*pickup|pickup\s*(?:is\s*)?ready/i,
      /on\s+(?:its|the)\s+way/i,
      /out\s+for\s+delivery/i,
      /arriving\s+(?:today|tomorrow|soon)/i,
      /substitut(?:ed|ion)/i,
      /(?:item|order)\s+(?:has been\s+)?cancel/i,
      /(?:refund|return)\s+(?:has been\s+)?(?:processed|initiated|issued|confirmed)/i,
    ],
    orderNumPatterns: [
      /order\s*#?\s*:?\s*(\d{3}-\d{7}-\d{7})/i,
      /order\s*(?:number|#|no\.?)\s*:?\s*(\d{3}-\d{7}-\d{7})/i,
      /(\d{3}-\d{7}-\d{7})/,
      /order\s*#?\s*:?\s*(\d{13,17})/i,
    ],
    statusRules: [
      { pattern: /delivered|has\s*arrived|was\s*delivered/i, status: "Delivered" },
      { pattern: /ready\s*for\s*pickup|pickup\s*(?:is\s*)?ready/i, status: "Ready for Pickup" },
      { pattern: /out\s*for\s*delivery|arriving\s*today/i, status: "Out for Delivery" },
      { pattern: /shipped|on\s*(?:its|the)\s*way|has\s*left|in\s*transit/i, status: "Shipped" },
      { pattern: /cancel/i, status: "Cancelled" },
      { pattern: /refund/i, status: "Refunded" },
      { pattern: /substitut/i, status: "Substituted" },
      { pattern: /return(?:ed)?/i, status: "Returned" },
      { pattern: /delay/i, status: "Delayed" },
      { pattern: /order\s*(?:confirmed|placed|received)|confirmation|thanks?\s*for/i, status: "Confirmed" },
    ],
    totalPatterns: [
      /order\s*total\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /total\s*(?:charged|paid|amount)\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /(?:you\s*(?:paid|were\s*charged))\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /(?:estimated\s*total|subtotal)\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
    ],
    itemPatterns: [
      /(?:item|product)\s*:?\s*([^\n<]{5,100})/gi,
    ],
    trackingPatterns: [
      /tracking\s*(?:number|#|no\.?)?\s*:?\s*\n?\s*([A-Z0-9]{12,30})/i,
      /track(?:ing)?\s*(?:your\s*)?(?:package|order|shipment)\s*:?\s*\n?\s*([A-Z0-9]{12,30})/i,
    ],
    carrierPatterns: [
      { pattern: /\b1Z[A-Z0-9]{16}\b/i, carrier: "UPS" },
      { pattern: /\b(?:92|94|93|95)\d{18,22}\b/, carrier: "USPS" },
      { pattern: /\b\d{12,15}\b/, carrier: "FedEx" },
      { pattern: /ups/i, carrier: "UPS" },
      { pattern: /usps|united\s*states\s*postal/i, carrier: "USPS" },
      { pattern: /fedex|federal\s*express/i, carrier: "FedEx" },
      { pattern: /ontrac/i, carrier: "OnTrac" },
      { pattern: /lasership|laser\s*ship/i, carrier: "LaserShip" },
    ],
  },

  pokemonCenter: {
    label: "Pokemon Center",
    senders: [
      "pokemoncenter.com", "pokemon.com",
      "noreply@pokemoncenter.com", "orders@pokemoncenter.com",
      "support@pokemoncenter.com", "noreply@pokemon.com",
    ],
    subjectPatterns: [
      /your\s+(?:order|purchase|pokemon\s*center\s+order)/i,
      /order\s+(?:has been\s+)?(?:confirmed|placed|shipped|delivered|cancelled|updated)/i,
      /thank\s*(?:s|you)\s+for\s+(?:your\s+)?(?:order|shopping|purchase)/i,
      /(?:has|have)\s+(?:been\s+)?shipped/i,
      /(?:has|have)\s+(?:been\s+)?delivered/i,
      /on\s+(?:its|the)\s+way/i,
      /out\s+for\s+delivery/i,
      /order\s+confirmation/i,
      /(?:item|order)\s+(?:has been\s+)?cancel/i,
      /(?:refund|return)\s+(?:has been\s+)?(?:processed|initiated|issued|confirmed)/i,
      /(?:back|pre).?order\s+(?:confirmed|update|notification)/i,
    ],
    orderNumPatterns: [
      /order\s*#?\s*:?\s*(P?\d{6,12})/i,
      /order\s*(?:number|#|no\.?)\s*:?\s*(P?\d{6,12})/i,
      /(?:confirmation|order)\s*(?:number|#)\s*:?\s*([A-Z0-9]{6,15})/i,
    ],
    statusRules: [
      { pattern: /delivered|has\s*arrived|was\s*delivered/i, status: "Delivered" },
      { pattern: /out\s*for\s*delivery|arriving\s*today/i, status: "Out for Delivery" },
      { pattern: /shipped|on\s*(?:its|the)\s*way|has\s*left|in\s*transit|tracking/i, status: "Shipped" },
      { pattern: /cancel/i, status: "Cancelled" },
      { pattern: /refund/i, status: "Refunded" },
      { pattern: /(?:back|pre)\s*order/i, status: "Pre-Order" },
      { pattern: /order\s*(?:confirmed|placed|received)|confirmation|thanks?\s*for/i, status: "Confirmed" },
    ],
    totalPatterns: [
      /order\s*total\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /total\s*(?:charged|paid|amount)\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
      /(?:grand\s*total)\s*:?\s*\$\s*([\d,]+\.\d{2})/i,
    ],
    itemPatterns: [
      /(?:item|product)\s*:?\s*([^\n<]{5,100})/gi,
    ],
    trackingPatterns: [
      /tracking\s*(?:number|#|no\.?)?\s*:?\s*\n?\s*([A-Z0-9]{12,30})/i,
      /track(?:ing)?\s*(?:your\s*)?(?:package|order|shipment)\s*:?\s*\n?\s*([A-Z0-9]{12,30})/i,
    ],
    carrierPatterns: [
      { pattern: /\b1Z[A-Z0-9]{16}\b/i, carrier: "UPS" },
      { pattern: /\b(?:92|94|93|95)\d{18,22}\b/, carrier: "USPS" },
      { pattern: /\b\d{12,15}\b/, carrier: "FedEx" },
      { pattern: /ups/i, carrier: "UPS" },
      { pattern: /usps|united\s*states\s*postal/i, carrier: "USPS" },
      { pattern: /fedex|federal\s*express/i, carrier: "FedEx" },
      { pattern: /dhl/i, carrier: "DHL" },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   HTML PARSING UTILITIES
   ═══════════════════════════════════════════════════════════════ */

function htmlToText(html) {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|tr|li|h[1-6]|td|th)>/gi, "\n")
    .replace(/<(?:td|th)[^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#?\w+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Extract product names from HTML table structures common in retailer emails
function extractItemsFromHtml(html, retailerLabel) {
  if (!html) return [];
  const items = [];

  // Common patterns across retailers for product name cells
  const patterns = [
    // Table cell with product link text
    /<a[^>]*href[^>]*>([^<]{5,120})<\/a>/gi,
    // Bold product names
    /<(?:b|strong)[^>]*>([^<]{8,100})<\/(?:b|strong)>/gi,
    // Product name in specific classes
    /class="[^"]*(?:product|item|name)[^"]*"[^>]*>([^<]{5,100})</gi,
    // Structured "product-name" style divs
    /(?:product|item)[-_]?name[^>]*>([^<]{5,100})</gi,
  ];

  for (const re of patterns) {
    let match;
    while ((match = re.exec(html)) !== null) {
      let name = match[1].trim();
      // Filter out non-product strings
      if (name.length < 5 || name.length > 120) continue;
      if (/^(view|track|cancel|return|help|contact|click|sign|log|update|manage|order|shop|privacy|terms|unsubscribe)/i.test(name)) continue;
      if (/\.(com|org|net|html|php|jpg|png)/i.test(name)) continue;
      if (/@/.test(name)) continue;
      if (/^\d+$/.test(name)) continue;
      if (/^(here|more|details|now|today)$/i.test(name)) continue;

      // Clean up the name
      name = name.replace(/\s+/g, " ").trim();
      if (!items.includes(name)) {
        items.push(name);
      }
    }
  }

  return items;
}

// Extract dollar amounts from text near "subtotal", "tax", etc.
function extractFinancials(text) {
  const result = { subtotal: null, tax: null, shipping: null };

  const subtotalMatch = text.match(/subtotal\s*:?\s*\$\s*([\d,]+\.\d{2})/i);
  if (subtotalMatch) result.subtotal = parseFloat(subtotalMatch[1].replace(",", ""));

  const taxMatch = text.match(/(?:estimated\s*)?tax(?:es)?\s*:?\s*\$\s*([\d,]+\.\d{2})/i);
  if (taxMatch) result.tax = parseFloat(taxMatch[1].replace(",", ""));

  const shippingMatch = text.match(/shipping\s*(?:&\s*handling)?\s*:?\s*\$\s*([\d,]+\.\d{2})/i);
  if (shippingMatch) result.shipping = parseFloat(shippingMatch[1].replace(",", ""));

  return result;
}

// Count items in order from common patterns
function extractItemCount(text) {
  const countMatch = text.match(/(\d+)\s*item/i);
  if (countMatch) return parseInt(countMatch[1], 10);

  const qtyMatches = text.match(/qty\s*:?\s*(\d+)/gi);
  if (qtyMatches) {
    return qtyMatches.reduce((sum, m) => {
      const n = m.match(/(\d+)/);
      return sum + (n ? parseInt(n[1], 10) : 0);
    }, 0);
  }

  return 1;
}

// Extract estimated delivery date / ETA from email body
// Looks for patterns like "arriving by Jan 15", "estimated delivery: January 15, 2026",
// "get it by Friday, Jan 15", "expected delivery: 01/15/2026"
function extractETA(text, subject) {
  const combined = subject + "\n" + text;
  const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11, january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 };

  // Pattern 1: "arriving by Mon, Jan 15" or "get it by January 15, 2026"
  const p1 = combined.match(/(?:arriving|arrive|get it|delivery)\s*(?:by|on|:)\s*(?:\w+,?\s*)?(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/i);
  if (p1) {
    const mo = MONTHS[p1[1].toLowerCase()];
    if (mo !== undefined) {
      const day = parseInt(p1[2], 10);
      const year = p1[3] ? parseInt(p1[3], 10) : new Date().getFullYear();
      const d = new Date(year, mo, day);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }
  }

  // Pattern 2: "estimated delivery: 01/15/2026" or "est. delivery 1/15/26"
  const p2 = combined.match(/(?:estimated|est\.?)\s*delivery\s*(?:date)?\s*:?\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i);
  if (p2) {
    let year = parseInt(p2[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, parseInt(p2[1], 10) - 1, parseInt(p2[2], 10));
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  }

  // Pattern 3: "delivery between Jan 14 - Jan 17" (take the later date)
  const p3 = combined.match(/delivery\s*(?:between|window|:)\s*(?:\w+,?\s*)?(\w+)\s+(\d{1,2})\s*[-\u2013]\s*(?:\w+,?\s*)?(\w+)\s+(\d{1,2})/i);
  if (p3) {
    const mo = MONTHS[p3[3].toLowerCase()];
    if (mo !== undefined) {
      const day = parseInt(p3[4], 10);
      const d = new Date(new Date().getFullYear(), mo, day);
      if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    }
  }

  // Pattern 4: "arrives today" / "arriving today"
  if (/arriv(?:es?|ing)\s*today/i.test(combined)) {
    return new Date().toISOString().split("T")[0];
  }

  // Pattern 5: "arrives tomorrow"
  if (/arriv(?:es?|ing)\s*tomorrow/i.test(combined)) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   CORE PARSER
   Takes a parsed email + retailer config, returns a structured order object.
   Uses multi-pass extraction: subject first, then body, then HTML structure.
   ═══════════════════════════════════════════════════════════════ */

function parseOrderEmail(parsed, retailer) {
  const subject = parsed.subject || "";
  const date = parsed.date ? parsed.date.toISOString().split("T")[0] : null;
  const text = parsed.text || htmlToText(parsed.html || "");
  const html = parsed.html || "";
  const combined = subject + "\n" + text;

  // ---- ORDER NUMBER (try subject first, then body) ----
  let orderNumber = null;
  for (const re of retailer.orderNumPatterns) {
    const m = subject.match(re) || text.match(re);
    if (m) { orderNumber = m[1]; break; }
  }

  // ---- STATUS (check subject first for most reliable signal, then body) ----
  let status = "Confirmed";
  let statusSource = "default";
  for (const rule of retailer.statusRules) {
    if (rule.pattern.test(subject)) {
      status = rule.status;
      statusSource = "subject";
      break;
    }
  }
  // If only default from subject, check body for better signal
  if (statusSource === "default") {
    for (const rule of retailer.statusRules) {
      if (rule.pattern.test(text.substring(0, 500))) {
        status = rule.status;
        statusSource = "body";
        break;
      }
    }
  }

  // ---- TOTAL ----
  let total = null;
  for (const re of retailer.totalPatterns) {
    const m = text.match(re);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      // Sanity check: order totals between $1 and $10,000
      if (val >= 1 && val <= 10000) { total = val; break; }
    }
  }

  // ---- TRACKING NUMBER ----
  let trackingNumber = null;
  for (const re of retailer.trackingPatterns) {
    const m = combined.match(re);
    if (m) {
      const candidate = m[1].trim();
      // Validate: must be alphanumeric, 10-30 chars, not just digits under 12 chars
      if (/^[A-Z0-9]{10,30}$/i.test(candidate)) {
        // Make sure it's not an order number we already found
        if (candidate !== orderNumber) {
          trackingNumber = candidate;
          break;
        }
      }
    }
  }

  // ---- CARRIER ----
  let carrier = null;
  // First try to match tracking number format
  if (trackingNumber) {
    for (const rule of retailer.carrierPatterns) {
      if (rule.pattern.test(trackingNumber)) {
        carrier = rule.carrier;
        break;
      }
    }
  }
  // Then try text-based carrier detection
  if (!carrier) {
    // Look near the tracking number or in shipment sections
    const shipSection = combined.match(/(?:ship|track|carrier|deliver)[\s\S]{0,200}/gi);
    const searchText = shipSection ? shipSection.join(" ") : combined.substring(0, 1500);
    for (const rule of retailer.carrierPatterns) {
      if (rule.pattern.test(searchText)) {
        carrier = rule.carrier;
        break;
      }
    }
  }

  // ---- ITEM NAMES ----
  // Priority: extract from HTML structure, fall back to subject line cleaning
  let items = extractItemsFromHtml(html, retailer.label);
  let itemName;

  if (items.length > 0) {
    // Filter to likely product names (Pokemon/TCG/collectibles keywords help)
    const productKeywords = /pokemon|poke|tcg|card|booster|etb|pack|box|collection|tin|bundle|deck|blister|trainer|elite|premium|charizard|pikachu|eevee|sleeve|binder|figure|plush|game|controller/i;
    const productItems = items.filter(i => productKeywords.test(i));
    if (productItems.length > 0) items = productItems;
    itemName = items[0];
  } else {
    // Fall back to cleaning the subject line
    itemName = subject
      .replace(/^(?:re|fw|fwd):\s*/gi, "")
      .replace(/your\s+(?:order|purchase)\s+(?:has\s+)?(?:been\s+)?(?:confirmed|shipped|delivered|placed|cancelled|is\s+on)/gi, "")
      .replace(/(?:order|purchase)\s*(?:confirmation|update|notification|details)/gi, "")
      .replace(/order\s*#?\s*\S+/gi, "")
      .replace(new RegExp(retailer.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "")
      .replace(/[!.,:]+$/g, "")
      .replace(/^\s*[-:,]\s*/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (!itemName || itemName.length < 3) {
    itemName = `${retailer.label} Order`;
  }

  // ---- FINANCIALS ----
  const financials = extractFinancials(text);

  // ---- ITEM COUNT ----
  const itemCount = extractItemCount(text);

  // ---- ESTIMATED DELIVERY DATE (ETA) ----
  const estimatedDelivery = extractETA(text, subject);

  // ---- DATES ----
  let shippedDate = null;
  let deliveredDate = null;
  if (status === "Shipped" || status === "Out for Delivery") shippedDate = date;
  if (status === "Delivered") { deliveredDate = date; if (!shippedDate) shippedDate = date; }

  return {
    orderNumber,
    item: itemName,
    items: items.length > 0 ? items : [itemName],
    date,
    status,
    total,
    retailer: retailer.label,
    trackingNumber,
    carrier,
    subtotal: financials.subtotal,
    tax: financials.tax,
    itemCount,
    shippedDate,
    deliveredDate,
    estimatedDelivery,
    pickupReady: status === "Ready for Pickup",
    rawSubject: subject,
    emailType: statusSource === "default" ? "confirmation" : status.toLowerCase().replace(/\s+/g, "_"),
  };
}

/* ═══════════════════════════════════════════════════════════════
   SMART DEDUPLICATION & STATUS MERGING
   When multiple emails reference the same order number, we keep the
   most advanced status and merge data from all emails.
   ═══════════════════════════════════════════════════════════════ */

const STATUS_PRIORITY = {
  "Confirmed": 1,
  "Pre-Order": 2,
  "Shipped": 3,
  "Out for Delivery": 4,
  "Ready for Pickup": 4,
  "Delivered": 5,
  "Substituted": 3,
  "Delayed": 2,
  "Cancelled": 6,
  "Refunded": 7,
  "Returned": 8,
};

function mergeOrders(ordersList) {
  const byOrderNum = {};
  const noOrderNum = [];

  for (const order of ordersList) {
    if (!order.orderNumber) {
      noOrderNum.push(order);
      continue;
    }

    const key = `${order.retailer}:${order.orderNumber}`;
    if (!byOrderNum[key]) {
      byOrderNum[key] = { ...order };
    } else {
      const existing = byOrderNum[key];
      const existingPri = STATUS_PRIORITY[existing.status] || 0;
      const newPri = STATUS_PRIORITY[order.status] || 0;

      // Take the more advanced status
      if (newPri > existingPri) {
        existing.status = order.status;
        existing.emailType = order.emailType;
      }

      // Merge in any data the earlier email didn't have
      if (!existing.trackingNumber && order.trackingNumber) {
        existing.trackingNumber = order.trackingNumber;
      }
      if (!existing.carrier && order.carrier) {
        existing.carrier = order.carrier;
      }
      if (!existing.total && order.total) {
        existing.total = order.total;
      }
      if (!existing.subtotal && order.subtotal) {
        existing.subtotal = order.subtotal;
      }
      if (!existing.tax && order.tax) {
        existing.tax = order.tax;
      }
      if (order.shippedDate && !existing.shippedDate) {
        existing.shippedDate = order.shippedDate;
      }
      if (order.deliveredDate && !existing.deliveredDate) {
        existing.deliveredDate = order.deliveredDate;
      }
      if (order.estimatedDelivery && !existing.estimatedDelivery) {
        existing.estimatedDelivery = order.estimatedDelivery;
      }
      if (order.pickupReady) {
        existing.pickupReady = true;
      }
      // Prefer the more specific item name
      if (existing.item === `${existing.retailer} Order` && order.item !== `${order.retailer} Order`) {
        existing.item = order.item;
        existing.items = order.items;
      }
      // Merge item lists
      if (order.items && order.items.length > 0) {
        const merged = [...new Set([...(existing.items || []), ...order.items])];
        if (merged.length > existing.items?.length) {
          existing.items = merged;
        }
      }
    }
  }

  // Combine and sort by date descending
  const merged = [...Object.values(byOrderNum), ...noOrderNum];
  merged.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  return merged;
}

/* ═══════════════════════════════════════════════════════════════
   IMAP SCANNING ENGINE
   Connects to an email account and scans for order emails
   from all configured retailers.
   ═══════════════════════════════════════════════════════════════ */

async function scanEmailAccount(account, password, daysBack, selectedRetailers) {
  const orders = [];
  let client;

  try {
    client = new ImapFlow({
      host: account.imap_server,
      port: 993,
      secure: true,
      auth: { user: account.email, pass: password },
      logger: false,
      greetTimeout: 10000,
      socketTimeout: 20000,
    });

    await client.connect();

    // Scan INBOX and common folders
    const foldersToScan = ["INBOX"];

    // Try to also scan common shipping/order folders
    const mailboxes = await client.list();
    for (const mb of mailboxes) {
      const name = mb.path.toLowerCase();
      if (name.includes("purchase") || name.includes("order") || name.includes("receipt") || name.includes("shopping")) {
        if (!foldersToScan.includes(mb.path)) {
          foldersToScan.push(mb.path);
        }
      }
    }

    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    for (const folder of foldersToScan) {
      let lock;
      try {
        lock = await client.getMailboxLock(folder);
      } catch {
        continue; // Skip folders we can't access
      }

      try {
        for (const retailerKey of selectedRetailers) {
          const retailer = RETAILERS[retailerKey];
          if (!retailer) continue;

          for (const sender of retailer.senders) {
            try {
              // Fetch with source for full parsing
              const messages = client.fetch(
                { from: sender, since },
                { envelope: true, source: true }
              );

              let count = 0;
              for await (const msg of messages) {
                if (count >= 60) break; // Per-sender cap
                count++;

                try {
                  const parsed = await simpleParser(msg.source);
                  const subjectLower = (parsed.subject || "").toLowerCase();

                  // Check if this email matches any of the retailer's subject patterns
                  // AND is not a newsletter/promo/non-order email
                  if (isRejectEmail(parsed.subject || "")) continue;
                  const isOrderEmail = retailer.subjectPatterns.some(p => p.test(parsed.subject || ""));
                  if (!isOrderEmail) continue;

                  const order = parseOrderEmail(parsed, retailer);
                  if (order) {
                    order.emailAccountId = account.id;
                    order.sourceEmail = account.email;
                    order.folder = folder;
                    orders.push(order);
                  }
                } catch (parseErr) {
                  // Individual email parse failure, continue with others
                  console.error(`Parse error for email from ${sender}:`, parseErr.message);
                }
              }
            } catch (fetchErr) {
              // IMAP fetch error for this sender, continue with others
              console.error(`Fetch error for ${sender} in ${folder}:`, fetchErr.message);
            }
          }
        }
      } finally {
        lock.release();
      }
    }

    await client.logout();
    return { orders, error: null };
  } catch (err) {
    if (client) try { await client.logout(); } catch (_) {}

    let errMsg = "Connection failed";
    if (err.message?.includes("AUTHENTICATIONFAILED") || err.message?.includes("Invalid credentials")) {
      errMsg = "Authentication failed. Check your app password.";
    } else if (err.message?.includes("ENOTFOUND") || err.message?.includes("ECONNREFUSED")) {
      errMsg = "Could not reach email server. Check the IMAP server address.";
    } else if (err.message?.includes("ETIMEDOUT") || err.message?.includes("timeout")) {
      errMsg = "Connection timed out. Server may be temporarily unavailable.";
    }

    return { orders: [], error: errMsg };
  }
}

/* ═══════════════════════════════════════════════════════════════
   API HANDLER
   POST /api/emails/scan
   Body: { daysBack: number, retailers: string[] }
   ═══════════════════════════════════════════════════════════════ */

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = getSessionCookie(req);
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const session = await verifySession(token);
  if (!session) return res.status(401).json({ error: "Invalid session" });

  const {
    daysBack = 7,
    retailers: selectedRetailers = ["target", "walmart", "pokemonCenter"],
  } = req.body;

  const supabase = getSupabase();
  const userId = session.id;

  // Fetch all linked email accounts
  const { data: accounts, error: accErr } = await supabase
    .from("email_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (accErr || !accounts || accounts.length === 0) {
    return res.status(400).json({ error: "No email accounts linked. Add one in Settings." });
  }

  const allRawOrders = [];
  const accountResults = [];

  // Scan each email account
  for (const account of accounts) {
    let password;
    try {
      password = decrypt(account.encrypted_password);
    } catch {
      accountResults.push({ email: account.email, status: "error", error: "Failed to decrypt credentials. Re-link this account in Settings." });
      await supabase.from("email_accounts").update({ status: "error", last_error: "Decryption failed" }).eq("id", account.id);
      continue;
    }

    const result = await scanEmailAccount(account, password, daysBack, selectedRetailers);

    if (result.error) {
      await supabase.from("email_accounts").update({ status: "error", last_error: result.error }).eq("id", account.id);
      accountResults.push({ email: account.email, status: "error", error: result.error, orders: 0 });
    } else {
      await supabase.from("email_accounts").update({
        last_scanned: new Date().toISOString(),
        status: "active",
        last_error: null,
      }).eq("id", account.id);
      accountResults.push({ email: account.email, status: "success", orders: result.orders.length });
      allRawOrders.push(...result.orders);
    }
  }

  // Deduplicate and merge statuses across emails for same order
  const orders = mergeOrders(allRawOrders);

  // Save to Supabase with upsert logic
  let savedCount = 0;
  let updatedCount = 0;
  const notificationEvents = [];

  for (const order of orders) {
    try {
      const record = {
        user_id: userId,
        retailer: order.retailer,
        order_number: order.orderNumber,
        item: order.item,
        order_date: order.date,
        status: order.status,
        total: order.total,
        email_account_id: order.emailAccountId,
        last_scanned: new Date().toISOString(),
        // v3 columns
        tracking_number: order.trackingNumber || null,
        carrier: order.carrier || null,
        items_json: order.items?.length > 0 ? JSON.stringify(order.items) : null,
        email_type: order.emailType || null,
        raw_subject: order.rawSubject || null,
        shipped_date: order.shippedDate || null,
        delivered_date: order.deliveredDate || null,
        pickup_ready: order.pickupReady || false,
        subtotal: order.subtotal || null,
        tax: order.tax || null,
        item_count: order.itemCount || 1,
        estimated_delivery: order.estimatedDelivery || null,
      };

      if (order.orderNumber) {
        // Check if order exists and if we should update status
        const { data: existing } = await supabase
          .from("orders")
          .select("id, status, tracking_number")
          .eq("user_id", userId)
          .eq("order_number", order.orderNumber)
          .limit(1);

        if (existing && existing.length > 0) {
          // Update only if status advanced or we have new tracking info
          const existingPri = STATUS_PRIORITY[existing[0].status] || 0;
          const newPri = STATUS_PRIORITY[order.status] || 0;
          const hasNewTracking = !existing[0].tracking_number && order.trackingNumber;

          if (newPri > existingPri || hasNewTracking) {
            const updateData = { ...record };
            delete updateData.user_id;
            delete updateData.order_number;
            // Don't overwrite total if existing has it and new doesn't
            if (!record.total && existing[0].total) delete updateData.total;

            await supabase.from("orders").update(updateData).eq("id", existing[0].id);
            updatedCount++;
            notificationEvents.push({ order: { ...record, ...updateData }, isNew: false });
          }
        } else {
          const { error } = await supabase.from("orders").insert(record);
          if (!error) { savedCount++; notificationEvents.push({ order: record, isNew: true }); }
        }
      } else {
        // No order number, check for duplicate by item+date+retailer
        const { data: existing } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .eq("item", order.item)
          .eq("order_date", order.date)
          .eq("retailer", order.retailer)
          .limit(1);

        if (!existing || existing.length === 0) {
          const { error } = await supabase.from("orders").insert(record);
          if (!error) { savedCount++; notificationEvents.push({ order: record, isNew: true }); }
        }
      }
    } catch (saveErr) {
      console.error("Save error:", saveErr.message);
    }
  }

  // Fire webhook notifications (non-blocking)
  if (notificationEvents.length > 0) {
    notifyOrderEvents(userId, notificationEvents).catch((err) =>
      console.error("Notification error:", err.message)
    );
  }

  return res.json({
    success: true,
    orders,
    count: orders.length,
    saved: savedCount,
    updated: updatedCount,
    accounts: accountResults,
    retailers: selectedRetailers.map(k => RETAILERS[k]?.label).filter(Boolean),
  });
}

export const config = {
  api: { bodyParser: { sizeLimit: "1mb" }, responseLimit: false },
  maxDuration: 60,
};
