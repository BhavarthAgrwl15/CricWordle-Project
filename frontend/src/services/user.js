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

/**
 * Fetch current user's profile using token.
 * Backend expected response: { user: {...}, recentSessions: [...] }
 * We return a flattened object: { ...user, recentSessions: [...] }
 * @param {string} [token]
 * @returns {Promise<Object>} user object (with recentSessions field if provided)
 */
export async function fetchProfile(token) {
  const t = token || localStorage.getItem("token");
  if (!t) throw new Error("No auth token available");
  console.log(PROFILE_API.ME,token);
  try {
    const res = await axios.get(PROFILE_API.ME, {
      headers: {
        Authorization: `Bearer ${t}`,
        Accept: "application/json",
      },
    });

    // res.data expected to be { user, recentSessions }
    const payload = res.data ?? {};
    const userObj = payload.user ?? payload;
    const recentSessions = payload.recentSessions ?? [];

    // Flatten so caller gets user fields directly and can access recentSessions via user.recentSessions
    if (typeof userObj === "object" && userObj !== null) {
      return { ...userObj, recentSessions };
    }

    // fallback: return what backend returned
    return payload;
  } catch (err) {
    throw axiosErrorToError(err);
  }
}

// LOGIN
export const loginUser = async ({ emailOrUsername, password }) => {
  try {
    const res = await axios.post(AUTH_API.LOGIN, { emailOrUsername, password });
    return res.data; // expected { token, user } or { token }
  } catch (err) {
    throw axiosErrorToError(err);
  }
};

// SIGNUP
export const signupUser = async ({ name, username, email, password }) => {
  try {
    const res = await axios.post(AUTH_API.REGISTER, { name, username, email, password });
    return res.data; // expected { token, user } or { msg }
  } catch (err) {
    throw axiosErrorToError(err);
  }
};

// LOGOUT (optional)
export const logoutUser = async () => {
  try {
    const res = await axios.post(AUTH_API.LOGOUT);
    return res.data;
  } catch (err) {
    throw axiosErrorToError(err);
  }
};
