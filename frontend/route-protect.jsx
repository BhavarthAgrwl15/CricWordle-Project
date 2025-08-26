// src/components/RouteGuards.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./src/contexts/auth-context";

// Only allow logged-in users
export const PrivateRoute = ({ children }) => {
  const { user, hydrated } = useContext(AuthContext);

  // Wait until hydration is done
  if (!hydrated) return null;

  return user ? children : <Navigate to="/login" replace />;
};

// Only allow guests (not logged-in)
export const GuestRoute = ({ children }) => {
  const { user, hydrated } = useContext(AuthContext);

  if (!hydrated) return null;

  return !user ? children : <Navigate to="/categories" replace />;
};
