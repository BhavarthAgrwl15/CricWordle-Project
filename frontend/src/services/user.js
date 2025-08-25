import axios from "axios";
import { AUTH_API } from "./api";

// LOGIN
export const loginUser = async ({ emailOrUsername, password }) => {
  const res = await axios.post(AUTH_API.LOGIN, { emailOrUsername, password });
  return res.data; // contains { token, user }
};

// SIGNUP
export const signupUser = async ({ name, username, email, password }) => {
  console.log("api",AUTH_API.REGISTER);
  const res = await axios.post(AUTH_API.REGISTER, { name, username, email, password });
  return res.data; // { msg } or { token, user } if you later return token
};

// LOGOUT (optional if backend supports it)
export const logoutUser = async () => {
  const res = await axios.post(AUTH_API.LOGOUT);
  return res.data;
};