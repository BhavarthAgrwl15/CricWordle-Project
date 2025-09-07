// src/contexts/auth-provider.jsx
import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./auth-context";
import { loginUser, signupUser, fetchProfile } from "../services/user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore user from localStorage or from token
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          if (!mounted) return;
          setUser(JSON.parse(raw));
        } else {
          const token = localStorage.getItem("token");
          if (token && typeof fetchProfile === "function") {
            try {
              const profile = await fetchProfile(token);
              if (profile && mounted) {
                setUser(profile);
                localStorage.setItem("user", JSON.stringify(profile));
              }
            } catch (err) {
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

    return () => {
      mounted = false;
    };
  }, []);

  // Helper to normalize and save user
  const saveAuthData = (data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    if (data?.user) {
      // ensure isAdmin is preserved
      const userWithRole = { ...data.user, isAdmin: !!data.user.isAdmin };
      setUser(userWithRole);
      localStorage.setItem("user", JSON.stringify(userWithRole));
    }
  };

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    saveAuthData(data);

    if (!data?.user && data?.token && typeof fetchProfile === "function") {
      try {
        const profile = await fetchProfile(data.token);
        if (profile) {
          const profileWithRole = { ...profile, isAdmin: !!profile.isAdmin };
          setUser(profileWithRole);
          localStorage.setItem("user", JSON.stringify(profileWithRole));
        }
      } catch (err) {
        console.warn("fetchProfile after login failed", err);
      }
    }
    return data;
  }, []);

  const signup = useCallback(async (userData) => {
    const data = await signupUser(userData);
    saveAuthData(data);

    if (!data?.user && data?.token && typeof fetchProfile === "function") {
      try {
        const profile = await fetchProfile(data.token);
        if (profile) {
          const profileWithRole = { ...profile, isAdmin: !!profile.isAdmin };
          setUser(profileWithRole);
          localStorage.setItem("user", JSON.stringify(profileWithRole));
        }
      } catch (err) {
        console.warn("fetchProfile after signup failed", err);
      }
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,          // contains isAdmin
        setUser,
        login,
        signup,
        logout,
        hydrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
