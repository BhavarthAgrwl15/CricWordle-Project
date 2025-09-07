// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../contexts/auth-context";
import Papa from "papaparse";

// services - adjust path if needed
import {
  fetchCategories,
  deleteCategory,
  seedDailyWords,
  fetchWordsByCategory,
} from "../services/game-api";

/* ----------------- Small UI helpers ----------------- */
const HowToPlayCard = ({ title, tiles = [], text }) => (
  <div className="rounded-2xl border border-gray-700/60 bg-black/40 p-4 text-center">
    <h4 className="font-semibold text-sm text-white mb-3">{title}</h4>
    <div className="flex justify-center gap-1 mb-3">
      {tiles.map((t, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm ${
            t.state === "correct"
              ? "bg-green-500 text-white"
              : t.state === "present"
              ? "bg-yellow-500 text-white"
              : t.state === "incorrect"
              ? "bg-gray-700 text-white"
              : "bg-gray-600 text-white"
          }`}
        >
          {t.ch}
        </div>
      ))}
    </div>
    <p className="text-xs text-gray-300">{text}</p>
  </div>
);

const StatCard = ({ label, value, subtitle }) => (
  <div className="rounded-lg bg-gray-800/60 p-4 text-center">
    <div className="text-xs text-gray-300">{label}</div>
    <div className="text-2xl font-bold text-white mt-1">{value}</div>
    {subtitle && <div className="text-[11px] text-gray-400 mt-1">{subtitle}</div>}
  </div>
);

/* ----------------- CategoriesPanel ----------------- */
function CategoriesPanel({ onDone }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // words for a selected category
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchCategories();
      const cats = Array.isArray(res) ? res : res?.categories ?? [];
      setCategories(cats);
    } catch (err) {
      console.error(err);
      toast.error(err?.msg || err?.error || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadWords = async (category) => {
    if (!category) return;
    setSelectedCategory(category);
    setLoadingWords(true);
    try {
      const res = await fetchWordsByCategory(category);
      // res expected { category, words } or [] 
      const w = res?.words ?? res ?? [];
      setWords(Array.isArray(w) ? w : []);
    } catch (err) {
      console.error(err);
      toast.error(err?.msg || err?.error || "Failed to load words");
      setWords([]);
    } finally {
      setLoadingWords(false);
    }
  };

  const handleDeleteCategory = async (c) => {
    const ok = window.confirm(`Delete ALL words in category "${c}"? This is destructive.`);
    if (!ok) return;
    setDeletingCategory(c);
    try {
      const res = await deleteCategory(c);
      toast.success(`Deleted ${res.deletedCount ?? 0} entries from "${c}"`);
      if (selectedCategory === c) {
        setSelectedCategory(null);
        setWords([]);
      }
      await loadCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.msg || err?.error || "Delete failed");
    } finally {
      setDeletingCategory(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Manage Categories</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onDone}
            className="px-3 py-1 rounded-md border border-gray-600 text-sm text-gray-200 hover:bg-gray-700/30"
          >
            Back to Overview
          </button>
          <button onClick={loadCategories} className="px-3 py-1 rounded-md border border-gray-600 text-sm text-gray-200">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* categories list */}
        <div>
          <div className="text-sm text-gray-400 mb-2">Categories</div>
          <div className="bg-gray-800/40 p-3 rounded-md max-h-72 overflow-auto space-y-2">
            {loading ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-gray-400">No categories found.</div>
            ) : (
              categories.map((c) => (
                <div key={c} className="flex items-center justify-between p-2 bg-gray-900/40 rounded">
                  <button
                    onClick={() => loadWords(c)}
                    className="text-sm text-left text-gray-100 hover:underline flex-1 text-left"
                    title={`View words in ${c}`}
                  >
                    {c}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigator.clipboard?.writeText(c) && toast.success("Copied")}
                      className="px-2 py-1 text-xs rounded bg-gray-700/60"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c)}
                      disabled={deletingCategory === c}
                      className="px-2 py-1 text-xs rounded bg-rose-600 text-white"
                    >
                      {deletingCategory === c ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* words list for selected category */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-gray-400">Words{selectedCategory ? ` — ${selectedCategory}` : ""}</div>
              <div className="text-xs text-gray-500">Click a category on the left to view words</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (selectedCategory) loadWords(selectedCategory); else toast.error("Select category first"); }}
                className="px-2 py-1 rounded-md border border-gray-600 text-xs text-gray-200"
              >
                Refresh
              </button>
              <button
                onClick={() => { setSelectedCategory(null); setWords([]); }}
                className="px-2 py-1 rounded-md border border-gray-600 text-xs text-gray-200"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="bg-gray-800/40 p-3 rounded-md max-h-72 overflow-auto">
            {loadingWords ? (
              <div className="text-sm text-gray-400">Loading words...</div>
            ) : !selectedCategory ? (
              <div className="text-sm text-gray-400">No category selected.</div>
            ) : words.length === 0 ? (
              <div className="text-sm text-gray-400">No words in this category.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-300">
                  <tr>
                    <th className="py-1">#</th>
                    <th className="py-1">Word</th>
                    <th className="py-1">Date</th>
                    <th className="py-1">Level</th>
                    <th className="py-1">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((w, i) => (
                    <tr key={w._id ?? i} className="odd:bg-gray-900/20">
                      <td className="py-1 text-xs text-gray-200">{i + 1}</td>
                      <td className="py-1 text-gray-100">{w.word}</td>
                      <td className="py-1 text-gray-200">{w.date}</td>
                      <td className="py-1 text-gray-200">{w.level}</td>
                      <td className="py-1 text-gray-200">{w.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- SeedPanel ----------------- */
function SeedPanel({ onDone, availableCategories = [] }) {
  const [categoryMode, setCategoryMode] = useState("select"); // 'select' or 'new'
  const [selectedCategory, setSelectedCategory] = useState(availableCategories[0] || "");
  const [newCategory, setNewCategory] = useState("");
  const [inlineRow, setInlineRow] = useState({ word: "", date: "", level: "1", points: "" });
  const [rows, setRows] = useState([]); // buffered rows to send
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCategory && availableCategories.length) setSelectedCategory(availableCategories[0]);
  }, [availableCategories]);

  const addInlineRow = () => {
    const { word, date, level, points } = inlineRow;
    if (!word || !date || !level || points === "") {
      return toast.error("Please fill all fields for the word");
    }
    const cat = categoryMode === "select" ? selectedCategory : newCategory.trim();
    if (!cat) return toast.error("Please select or enter a category");

    const obj = {
      date: date.trim(),
      category: cat.toLowerCase().trim(),
      level: level.trim(),
      points: Number(points), // convert here
      word: word.trim().toLowerCase(),
    };
    setRows((r) => [...r, obj]);
    setInlineRow({ word: "", date: "", level: "1", points: "" });
    toast.success("Added row to buffer");
  };

  const removeInlineRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));

  const handleCsvFile = (file) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const data = results.data.map((r) => ({
          date: (r.date || r.Date || "").trim(),
          category: (r.category || r.Category || "").toLowerCase().trim(),
          level: (r.level || r.Level || "").trim(),
          points: r.points != null ? Number(r.points) : Number(r.Points || 0),
          word: (r.word || r.Word || "").toLowerCase().trim(),
        }));
        setRows((prev) => [...prev, ...data]);
        toast.success(`Parsed ${data.length} rows into buffer`);
      },
      error: (err) => {
        toast.error("CSV parse error: " + err.message);
      },
    });
  };

  const handleSeedNow = async () => {
    if (!rows.length) return toast.error("No rows to seed. Add inline or upload CSV.");
    setLoading(true);
    try {
      const res = await seedDailyWords(rows);
      toast.success(`Inserted: ${res.inserted ?? res.insertedCount ?? 0}`);
      setRows([]);
    } catch (err) {
      console.error(err);
      toast.error(err?.msg || err?.error || "Seed failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Seed Daily Words</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onDone}
            className="px-3 py-1 rounded-md border border-gray-600 text-sm text-gray-200 hover:bg-gray-700/30"
          >
            Back to Overview
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* left: category + inline add */}
        <div>
          <div className="mb-2 text-xs text-gray-400">Choose category (select or create new)</div>

          <div className="flex gap-2 items-center mb-3">
            <label className="text-sm text-gray-200">
              <input
                type="radio"
                name="catMode"
                checked={categoryMode === "select"}
                onChange={() => setCategoryMode("select")}
                className="mr-2"
              />
              Select
            </label>
            <label className="text-sm text-gray-200">
              <input
                type="radio"
                name="catMode"
                checked={categoryMode === "new"}
                onChange={() => setCategoryMode("new")}
                className="mr-2"
              />
              New
            </label>
          </div>

          {categoryMode === "select" ? (
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded bg-gray-900/40 border border-gray-700 text-gray-100"
            >
              <option value="">-- select category --</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category"
              className="w-full p-2 rounded bg-gray-900/40 border border-gray-700 text-gray-100"
            />
          )}

          <div className="mt-4 text-xs text-gray-400">Add word (click + to append to buffer)</div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              value={inlineRow.word}
              onChange={(e) => setInlineRow({ ...inlineRow, word: e.target.value })}
              placeholder="Word (e.g., apple)"
              className="p-2 rounded bg-gray-900/30 border border-gray-700 text-gray-100"
            />
            <input
              type="date"
              value={inlineRow.date}
              onChange={(e) => setInlineRow({ ...inlineRow, date: e.target.value })}
              className="p-2 rounded bg-gray-900/30 border border-gray-700 text-gray-100"
            />
            <input
              value={inlineRow.level}
              onChange={(e) => setInlineRow({ ...inlineRow, level: e.target.value })}
              placeholder="Level (e.g., 1)"
              className="p-2 rounded bg-gray-900/30 border border-gray-700 text-gray-100"
            />
            <input
              type="number"
              value={inlineRow.points}
              onChange={(e) => setInlineRow({ ...inlineRow, points: e.target.value })}
              placeholder="Points (e.g., 1)"
              className="p-2 rounded bg-gray-900/30 border border-gray-700 text-gray-100"
            />
          </div>

          <div className="mt-3 flex gap-2 items-center">
            <button onClick={addInlineRow} className="px-3 py-1 rounded bg-green-600 text-white">
              + Add
            </button>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleCsvFile(e.target.files?.[0])}
              className="ml-auto text-sm text-gray-400"
            />
          </div>

          <div className="mt-3 bg-gray-800/30 p-2 rounded max-h-48 overflow-auto">
            {rows.length === 0 ? (
              <div className="text-xs text-gray-400">
                No buffered rows. Add inline rows or upload CSV to buffer.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="text-xs text-gray-300">
                  <tr>
                    <th>#</th>
                    <th>Word</th>
                    <th>Date</th>
                    <th>Level</th>
                    <th>Pts</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="odd:bg-gray-900/20">
                      <td className="p-1 text-xs">{i + 1}</td>
                      <td className="p-1 text-xs">{r.word}</td>
                      <td className="p-1 text-xs">{r.date}</td>
                      <td className="p-1 text-xs">{r.level}</td>
                      <td className="p-1 text-xs">{r.points}</td>
                      <td className="p-1">
                        <button onClick={() => removeInlineRow(i)} className="text-rose-400 text-xs">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* right: seed controls */}
        <div>
          <div className="text-xs text-gray-400 mb-2">Seed controls (buffered rows will be sent directly)</div>
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-sm text-gray-200">
                Buffered rows: <span className="font-semibold text-white">{rows.length}</span>
              </div>
              <div className="text-xs text-gray-400">
                When ready click <b>Seed Now</b> to send them to the backend.
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSeedNow}
                disabled={loading || rows.length === 0}
                className={`px-4 py-2 rounded ${rows.length === 0 ? "bg-gray-600/40 text-gray-300" : "bg-green-600 text-white"}`}
              >
                {loading ? "Seeding..." : "Seed Now"}
              </button>

              <button
                onClick={() => {
                  setRows([]);
                  toast.success("Cleared buffer");
                }}
                className="px-4 py-2 rounded border"
              >
                Clear Buffer
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Tip: Use the category selector at left. If you chose "new" category, each added inline row will use that new name.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
/* ----------------- Main Admin Dashboard ----------------- */

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [selected, setSelected] = useState(null); // null = overview, 'categories', 'seed'
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);

  // load categories for summary and seed select
  const loadSummary = async () => {
    setLoadingCats(true);
    try {
      const res = await fetchCategories();
      const cats = Array.isArray(res) ? res : res?.categories ?? [];
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const totalCategories = categories.length;

  return (
    <div className="min-h-screen w-full text-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <header className="text-center mb-8">
          <div className="text-4xl ">🏏</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent drop-shadow-lg">
            Admin · Cric-Wordle
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl mx-auto mt-2">
            Manage categories, seed daily words and maintain the platform.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <button onClick={() => setSelected("categories")} className="px-6 py-3 rounded-2xl bg-black-800 backdrop-blur-xl border border-gray-700/70 text-gray-100 font-semibold shadow-lg hover:bg-white/15 transition">
              Manage Categories
            </button>

            <button onClick={() => setSelected("seed")} className="px-6 py-3 rounded-2xl border border-gray-400 text-gray-300 hover:bg-gray-200/10 font-semibold shadow-md">
              Seed Daily Words
            </button>
          </div>
        </header>

        {/* Central area */}
        <div className="rounded-2xl border border-gray-700/70 bg-white/10 backdrop-blur-xl p-6 shadow mb-6">
          {!selected && (
            <>
              <h3 className="text-lg font-semibold text-white text-center">How the Admin Tools Work</h3>
              <p className="text-sm text-gray-300 mt-1 text-center">
                Seed words in bulk or inline, remove entire categories, and inspect category words.
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <HowToPlayCard title="Seed" tiles={[{ ch: "S" }, { ch: "E" }, { ch: "E" }, { ch: "D" }]} text="Add inline rows or upload CSV, then 'Seed Now' to send rows directly." />
                <HowToPlayCard title="Categories" tiles={[{ ch: "C" }, { ch: "A" }, { ch: "T" }]} text="Click a category to view its words, or delete entire category." />
                <HowToPlayCard title="Safety" tiles={[{ ch: "A" }, { ch: "U" }, { ch: "D" }]} text="Deletes are destructive — confirm before removing a category." />
              </div>

              <p className="mt-3 text-xs text-gray-400 text-center">
                Actions are admin-only. Keep seed data correct to avoid duplicates (unique index enforced).
              </p>
            </>
          )}

          {selected === "categories" && <CategoriesPanel onDone={() => { setSelected(null); loadSummary(); }} />}

          {selected === "seed" && <SeedPanel onDone={() => { setSelected(null); loadSummary(); }} availableCategories={categories} />}
        </div>

    
       

        {/* Footer */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
          <span className="flex items-center gap-2">⚡ Admin Tools</span>
          <span className="flex items-center gap-2">🛡️ Destructive ops need care</span>
          <span className="flex items-center gap-2">📦 Seed with valid data</span>
        </div>
      </div>
    </div>
  );
}
