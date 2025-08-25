import React, { useState, useEffect } from "react";
import { AuthContext } from "./auth-context";
import { loginUser, signupUser } from "../services/user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore parse errors
      console.log(e);
        }
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    // data: { token, user }
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  };

  const signup = async (userData) => {
    const data = await signupUser(userData);
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};