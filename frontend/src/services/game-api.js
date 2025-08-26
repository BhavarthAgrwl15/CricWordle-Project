import axios from "axios";
import { GAME_API } from "./api";

export const fetchCategories = async () => {
  try {
    const res = await axios.get(GAME_API.CATEGORY);
    return res.data; // array of categories: ["cricket", "fruits", "countries", ...]
  } catch (err) {
    console.error("Error fetching categories:", err);
    throw err.response?.data || { msg: "Network Error" };
  }
};

export const gameInit = async ({ category, level, date }) => {
  try {
    const res = await axios.post(GAME_API.INIT, { category, level, date });
    return res.data;
    /**
     * {
     *   puzzleId: "...",
     *   maxAttempts: 6,
     *   wordLength: 5,
     *   expiresAt: "2025-08-25T23:59:59.999Z"
     * }
     */
  } catch (err) {
    throw err.response?.data || { msg: "Failed to init game" };
  }
};