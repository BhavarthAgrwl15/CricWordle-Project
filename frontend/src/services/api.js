export const API_BASE = "http://localhost:5000/api";

export const AUTH_API = {
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  LOGOUT: `${API_BASE}/auth/logout` // optional if you add logout backend route
};

export const GAME_API = {
  CATEGORY: `${API_BASE}/categories`,
  INIT: `${API_BASE}/categories/init`,
  GUESS:`${API_BASE}/categories/guess`,
  FINISH:`${API_BASE}/categories/finish`,
  LOGOUT: `${API_BASE}/auth/logout` // optional if you add logout backend route
};

export const PROFILE_API={
   ME: `${API_BASE}/profile/me`,
  LEADERBOARD: `${API_BASE}/profile/leaderboard`  //new

}
