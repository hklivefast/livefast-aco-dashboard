// DashboardApp - Wraps the existing dashboard UI with real API data
// For now, imports the full FullApp component and passes the user prop
// The FullApp component will be incrementally migrated to use real API calls

import { ThemeProvider } from "./ThemeContext";
import FullAppDashboard from "./FullApp";

export default function DashboardApp({ user }) {
  // The FullApp.jsx contains the complete dashboard with mock data
  // It exports the default App which includes both landing and dashboard
  // We need to render only the dashboard portion
  // For MVP, we render the full app in dashboard mode
  return (
    <ThemeProvider>
      <DashboardShell user={user} />
    </ThemeProvider>
  );
}

// Thin shell that renders the dashboard directly
// Uses the same components from FullApp but starts in dashboard mode
function DashboardShell({ user }) {
  // Import everything from FullApp but skip the landing page router
  // The FullApp default export handles its own routing
  // We just need to tell it to start in dashboard mode
  return <FullAppDashboard startPage="dashboard" user={user} />;
}
