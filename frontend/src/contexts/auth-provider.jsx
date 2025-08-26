// src/contexts/auth-provider.jsx
import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./auth-context";
import { loginUser, signupUser, fetchProfile } from "../services/user"; // fetchProfile is optional

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false); // true after we've tried to restore from storage/token

  // Restore user from localStorage or from token (optional)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          // user object found in localStorage
          if (!mounted) return;
          setUser(JSON.parse(raw));
        } else {
          // no user in storage — try to restore from token if available and fetchProfile is implemented
          const token = localStorage.getItem("token");
          if (token && typeof fetchProfile === "function") {
            try {
              const profile = await fetchProfile(token);
              if (profile && mounted) {
                setUser(profile);
                localStorage.setItem("user", JSON.stringify(profile));
              }
            } catch (err) {
              // token invalid or network error — clear stored auth
              console.warn("restore profile failed", err);
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            }
          }
        }
      } catch (e) {
        console.error("auth hydrate error", e);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Login helper
  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    // server expected to return { token, user } but handle token-only responses too
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else if (data?.token && typeof fetchProfile === "function") {
      // try to fetch user profile using token if user not returned directly
      try {
        const profile = await fetchProfile(data.token);
        if (profile) {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        }
      } catch (err) {
        console.warn("fetchProfile after login failed", err);
      }
    }
    return data;
  }, []);

  // Signup helper (same pattern)
  const signup = useCallback(async (userData) => {
    const data = await signupUser(userData);
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else if (data?.token && typeof fetchProfile === "function") {
      try {
        const profile = await fetchProfile(data.token);
        if (profile) {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        }
      } catch (err) {
        console.warn("fetchProfile after signup failed", err);
      }
    }
    return data;
  }, []);

  // Logout helper
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, hydrated }}>
      {children}
    </AuthContext.Provider>
  );
};
