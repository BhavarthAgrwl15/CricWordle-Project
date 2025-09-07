// src/services/user.js
import axios from "axios";
import { AUTH_API, PROFILE_API } from "./api"; // must include AUTH_API.ME, AUTH_API.LOGIN, AUTH_API.REGISTER, AUTH_API.LOGOUT

// Helper to normalize axios errors into Error with message
function axiosErrorToError(err) {
  if (!err) return new Error("Unknown error");
  const r = err.response;
  const msg =
    r?.data?.error ||
    r?.data?.message ||
    r?.data?.msg ||
    err.message ||
    r?.statusText ||
    "Request failed";
  return new Error(msg);
}

// Auth header helper
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Fetch current user's profile
export const fetchProfile = async () => {
  try {
    const res = await axios.get(PROFILE_API.ME, getAuthHeader());
    // backend expected: { user: {...}, recentSessions: [...] }
    return res.data; // includes user.isAdmin
  } catch (err) {
    throw axiosErrorToError(err);
  }
};

// LOGIN
export const loginUser = async ({ emailOrUsername, password }) => {
  try {
    const res = await axios.post(AUTH_API.LOGIN, { emailOrUsername, password });
    // backend expected: { token, user: { ..., isAdmin: true/false } }
    return res.data;
  } catch (err) {
    throw axiosErrorToError(err);
  }
};

// SIGNUP
export const signupUser = async ({ name, username, email, password, isAdmin }) => {
  try {
    const res = await axios.post(AUTH_API.REGISTER, {
      name,
      username,
      email,
      password,
      isAdmin, // <-- send isAdmin flag
    });
    // backend expected: { token, user: { ..., isAdmin: true/false } }
    return res.data;
  } catch (err) {
    throw axiosErrorToError(err);
  }
};

// LOGOUT
export const logoutUser = async () => {
  try {
    const res = await axios.post(AUTH_API.LOGOUT, {}, getAuthHeader());
    return res.data;
  } catch (err) {
    throw axiosErrorToError(err);
  }
};
