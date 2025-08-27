import axios from "axios";
import { GAME_API } from "./api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Fetch categories
export const fetchCategories = async () => {
  try {
    const res = await axios.get(GAME_API.CATEGORY, getAuthHeader());
    return res.data;
  } catch (err) {
    throw err.response?.data || { msg: "Network Error" };
  }
};

// Init game session
export const gameInit = async ({ category, level, date }) => {
  try {
    const res = await axios.post(
      GAME_API.INIT,
      { category, level, date }, // ❌ no userId here
      getAuthHeader()
    );
    return res.data; // { puzzleId, maxAttempts, wordLength, word, expiresAt }
  } catch (err) {
    throw err.response?.data || { msg: "Failed to init game" };
  }
};

// Send guess
export const sendGuess = async ({ puzzleId, guess }) => {
  try {
    const res = await axios.post(
      GAME_API.GUESS,
      { puzzleId, guess },
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { msg: "Failed to submit guess" };
  }
};

// Finish puzzle
export const finishPuzzle = async ({ puzzleId, result }) => {
  try {
    const res = await axios.post(
      GAME_API.FINISH,
      { puzzleId, result },
      getAuthHeader()
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { msg: "Failed to finish puzzle" };
  }
};

export const fetchGameSessions = async ({ date, category, limit = 10 }) => {
  try {
    const res = await axios.get(GAME_API.LIST, {
      params: { date, category, limit }, // query params
    });
    console.log(res.data);
    return res.data; // [{ user, score, levelReached, ... }]
  } catch (err) {
    throw err.response?.data || { msg: "Failed to fetch game session" };
  }
};