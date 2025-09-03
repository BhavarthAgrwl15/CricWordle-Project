import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GameContext } from "./game-context";
import { fetchProfile } from "../services/user";

/**
 * GameProvider
 * - hydrates profile from localStorage or from server token
 * - exposes setProfile, loadProfile, clearProfile, hydrated, isAuthenticated
 */
export const GameProvider = ({ children }) => {
  const [profile, setProfileState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Helper: write profile to localStorage and update state
  const setProfile = useCallback((p) => {
    setProfileState(p);
    try {
      if (p) {
        localStorage.setItem("profile", JSON.stringify(p));
      } else {
        localStorage.removeItem("profile");
      }
    } catch (e) {
      console.warn("Failed to persist profile to localStorage", e);
    }
  }, []);

  // Hydrate on mount: prefer localStorage, fall back to token+fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = localStorage.getItem("profile");
        if (raw) {
          if (!mounted) return;
          try {
            const p = JSON.parse(raw);
            setProfileState(p);
          } catch (err) {
            console.warn("Invalid profile in localStorage, removing", err);
            localStorage.removeItem("profile");
          }
        } else {
          const token = localStorage.getItem("token");
          if (token) {
            try {
              const userProfile = await fetchProfile(token);
              if (mounted && userProfile) {
                setProfileState(userProfile);
                try {
                  localStorage.setItem("profile", JSON.stringify(userProfile));
                } catch (e) {
                  console.warn("persist profile failed", e);
                }
              }
            } catch (err) {
              console.warn("restore profile from token failed", err);
              // ensure localStorage doesn't hold stale profile
              localStorage.removeItem("profile");
            }
          }
        }
      } catch (e) {
        console.error("game hydrate error", e);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * loadProfile(token?)
   * - fetches profile from server (using fetchProfile service)
   * - stores it in state + localStorage
   * - returns the profile or throws error from fetchProfile
   */
  const loadProfile = useCallback(async () => {
    try {
      const userProfile = await fetchProfile();
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // no profile returned -> clear
        setProfile(null);
        localStorage.removeItem("profile");
      }
      return userProfile;
    } catch (err) {
      // clear on failure
      setProfile(null);
      localStorage.removeItem("profile");
      throw err;
    }
  }, [setProfile]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    localStorage.removeItem("profile");
  }, [setProfile]);

  // convenience boolean
  const isAuthenticated = useMemo(() => {
    if (!profile) return false;
    // adapt to your profile shape (id / _id / email)
    return Boolean(profile.id || profile._id || profile.email);
  }, [profile]);

  return (
    <GameContext.Provider
      value={{
        profile,
        setProfile,
        loadProfile,
        clearProfile,
        hydrated,
        isAuthenticated,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
