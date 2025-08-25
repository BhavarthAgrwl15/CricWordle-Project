export const API_BASE = "http://localhost:5000/api";

export const AUTH_API = {
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  LOGOUT: `${API_BASE}/auth/logout` // optional if you add logout backend route
};