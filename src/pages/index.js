import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import LandingPageComponent from "../components/LandingPage";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {});

    // Handle error params from OAuth
    if (router.query.error) {
      const errors = {
        no_code: "Discord authorization was cancelled.",
        no_role: "You need the LIVEFAST ACO role in Discord to access the dashboard.",
        auth_failed: "Authentication failed. Please try again.",
      };
      setError(errors[router.query.error] || "An error occurred.");
    }
  }, [router.query.error]);

  const handleDiscordAuth = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <>
      <Head>
        <title>LIVEFAST ACO - Automated Checkout Services</title>
      </Head>
      <LandingPageComponent onAuth={handleDiscordAuth} error={error} />
    </>
  );
}
