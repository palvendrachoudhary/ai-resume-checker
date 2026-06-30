import React, { useState, useEffect } from "react";
import RecruiterView from "./RecruiterView";
import LandingPage from "./LandingPage";
import Login from "./Login";
import { auth } from "./firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "dashboard">(
    "landing",
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentPage === "landing" || !user) {
      document.documentElement.classList.remove("dark");
    }
  }, [currentPage, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00f2fe] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentPage === "landing") {
    return <LandingPage onLaunch={() => setCurrentPage("dashboard")} />;
  }

  if (!user) {
    return <Login onBack={() => setCurrentPage("landing")} />;
  }

  return (
    <RecruiterView
      onNavigateHome={() => setCurrentPage("landing")}
      onSignOut={async () => {
        await signOut(auth);
        setCurrentPage("landing");
      }}
    />
  );
}
