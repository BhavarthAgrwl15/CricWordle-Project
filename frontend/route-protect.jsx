import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./src/contexts/auth-context";

// Only allow logged-in users, optionally check for admin
export const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, hydrated } = useContext(AuthContext);
   console.log(user);
  if (!hydrated) return null; // wait for auth context to load

  if (!user) return <Navigate to="/login" replace />;
     console.log("admin",user);
  // Only admin route
  if (requireAdmin && !user.isAdmin) return <Navigate to="/" replace />;

  // Normal user routes: block admin users
  if (!requireAdmin && user.isAdmin) return <Navigate to="/admin" replace />;

  return children;
};

export const GuestRoute = ({ children }) => {
  const { user, hydrated } = useContext(AuthContext);

  if (!hydrated) return null; // wait for auth context to load

  // If user is logged in, redirect based on role
  if (user) {
    return <Navigate to={user.isAdmin ? "/admin" : "/"} replace />;
  }

  // Otherwise, render guest page
  return children;
};
