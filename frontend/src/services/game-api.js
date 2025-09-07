import axios from "axios";
import { GAME_API, PROFILE_API , ADMIN_API} from "./api";


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

export const fetchAdminCategories = async () => {
  try {
    const res = await axios.get(ADMIN_API.CATEGORY, getAuthHeader());
    return res.data; // expected { categories: [...] }
  } catch (err) {
    throw err.response?.data || { msg: "Network Error" };
  }
};


export const deleteCategory = async (category) => {
  try {
    const res = await axios.delete(`${ADMIN_API.DEL_CATEGORY}/${category}`, getAuthHeader());
    return res.data; // expected { success: true, deletedCount: n }
  } catch (err) {
    throw err.response?.data || { msg: "Network Error" };
  }
};

// 3️⃣ Seed new words
export const seedDailyWords = async (wordSets) => {
  try {
    const res = await axios.post(ADMIN_API.SEED, wordSets, getAuthHeader());
    return res.data; // expected { success: true, inserted: n }
  } catch (err) {
    throw err.response?.data || { msg: "Network Error" };
  }
};

export const fetchWordsByCategory = async (category) => {
  if (!category) throw { msg: "Category required" };
  try {
    const res = await axios.get(`${ADMIN_API.DAILY_WORDS_LIST}/${category}/words`, getAuthHeader());
    return res.data; // expected { category, words: [...] }
  } catch (err) {
    throw err.response?.data || { msg: "Network Error" };
  }
};
// Init game session
export const gameInit = async ({ category, level, date }) => {
  try {
    const res = await axios.post(
      GAME_API.INIT,
      { category, level, date },
      getAuthHeader()
    );
    // Backend returns: { puzzleId, maxAttempts, wordLength, expiresAt, maxScore }
    return res.data;
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
export const finishPuzzle = async ({ puzzleId,result, score }) => {
  try {
    const res = await axios.post(
      GAME_API.FINISH,
      { puzzleId, result,score },  // 👈 now sending score, not result
      getAuthHeader()
    );
    // Backend returns: { success, score, maxScore }

    return res.data;
  } catch (err) {
    throw err.response?.data || { msg: "Failed to finish puzzle" };
  }
};

export const fetchGameSessions = async ({ date, category, limit = 10 }) => {
  try {
    console.log(date,category,limit);
    const res = await axios.post(PROFILE_API.LEADERBOARD, {
      date,
      category,
      limit,
    });
    console.log(res.data);
    return res.data; // [{ user, score, levelReached, ... }]
  } catch (err) {
    throw err.response?.data || { msg: "Failed to fetch game session" };
  }
};

export const fetchAllGameSessions = async () => {
  try {
    const res = await axios.get(PROFILE_API.SESSIONS);
    console.log("All sessions:", res.data);
    return res.data; // [{ user, email, category, score, levelReached, createdAt, ... }]
  } catch (err) {
    throw err.response?.data || { msg: "Failed to fetch all game sessions" };
  }
};
