import React, { useState, useEffect } from "react";
import RecruiterView from "./RecruiterView";
import LandingPage from "./LandingPage";
import Login from "./Login";
import { auth } from "./firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "dashboard">("landing");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentPage === "landing") {
      // Landing page is natively dark, so remove the invert filter
      document.documentElement.classList.remove("dark");
    } else {
      // Login and Dashboard respect user theme
      if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentPage === "landing") {
    return <LandingPage onLaunch={() => setCurrentPage("dashboard")} />;
  }

  if (!user && !guestMode) {
    return <Login onBack={() => setCurrentPage("landing")} onGuestLogin={() => setGuestMode(true)} />;
  }

  return (
    <RecruiterView
      onNavigateHome={() => setCurrentPage("landing")}
      isGuest={guestMode}
      onRequireLogin={() => setGuestMode(false)}
      onSignOut={async () => {
        if (!guestMode) {
          await signOut(auth);
        }
        setGuestMode(false);
        setCurrentPage("landing");
      }}
    />
  );
}
