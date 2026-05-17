import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import DashboardAppComponent from "../components/DashboardApp";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) {
          router.replace("/");
        } else {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.replace("/");
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        height: "100vh", background: "#0a0a0a", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Orbitron', sans-serif", color: "rgba(255,255,255,0.4)",
        fontSize: 14, letterSpacing: 2,
      }}>
        LOADING...
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Dashboard - LIVEFAST ACO</title>
      </Head>
      <DashboardAppComponent user={user} />
    </>
  );
}
