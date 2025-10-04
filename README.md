# CRICWORDLE

**CricWordle** — a cricket-themed Wordle clone where players guess words from different categories. The app supports player and admin roles: players can sign up/login, pick categories, play games, see their last played game and leaderboard; admins can login and add new words for players to play.

---

## 🚀 Live preview

*(If you have deployed this, paste the URL here.)*

---

## ✨ Features

* Player & Admin authentication (signup/login)
* Multiple categories for word selection
* Cricket-themed Wordle gameplay (guess the daily/selected word)
* Player profile: view last played game and stats
* Leaderboard showing top players
* Admin dashboard: add / manage words so players can play
* RESTful backend API (Express + MongoDB)
* React frontend with Context API & hooks

---

## 🧩 Tech stack

* Frontend: React (JSX), Context API, custom hooks
* Backend: Node.js, Express
* Database: MongoDB (Mongoose)
* Auth: JWT
* Dev tools: VS Code, npm

---

## 📁 Project structure (high level)

```
CRICWORDLE/
├─ backend/
│  ├─ middleware/         # auth, admin checks
│  ├─ models/             # mongoose models: user, game-session, daily-word
│  ├─ routes/             # api routes: admin-routes, user-routes, profile-routes, word-route
│  ├─ server.js           # express app entry
│  ├─ package.json
│  └─ .env                # local env (not committed)

├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ assets/
│  │  ├─ components/      # board, navbar, timer, result-model
│  │  ├─ contexts/        # game-context, auth-context (providers)
│  │  ├─ hooks/           # use-auth, use-timer
│  │  ├─ pages/           # home, game, profile, admin-dashboard, scoreboard, etc.
│  │  ├─ services/        # api wrapper: api.js, game-api.js, user.js
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  └─ package.json

└─ README.md
```

> The screenshots you provided show the frontend `src` layout and backend `middleware`, `models`, and `routes` — the README above matches that structure.

---

## 🔧 Prerequisites

* Node.js (v16+ recommended)
* npm (v8+)
* MongoDB (local or Atlas)

---

## ⚙️ Getting started (local development)

1. **Clone the repository**

```bash
git clone https://github.com/<your-username>/cricwordle.git
cd cricwordle
```

2. **Backend**

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the variables below (example):

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/cricwordle?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
# development
npm run dev   # if you use nodemon, or
node server.js
```

3. **Frontend**

```bash
cd ../frontend
npm install
npm start
```

By default, React runs on `http://localhost:3000` and your backend on `http://localhost:5000`.

> If you want to run both concurrently, you can open two terminals or add a root-level script using `concurrently`.

---

## 🧾 Example API (common endpoints)

> Update the paths below to match the actual routes in your `routes/` folder.

* `POST /api/auth/signup` — create player account
* `POST /api/auth/login` — login (player / admin)
* `GET  /api/user/profile` — get logged-in player's profile (auth required)
* `GET  /api/words/categories` — list categories
* `GET  /api/words/category/:id/daily` — get daily word / random word for category
* `POST /api/game/session` — save a played game session
* `GET  /api/leaderboard` — get leaderboard

**Admin-only**

* `POST /api/admin/words` — add a new word (admin auth required)
* `PUT  /api/admin/words/:id` — update word
* `DELETE /api/admin/words/:id` — delete word

---

## 🔐 Auth & Roles

* The app supports two roles: `player` and `admin`.
* Use JWT tokens to authenticate requests to protected endpoints. The backend middleware (`middleware/auth.js` or `middleware/admin.js`) should verify tokens and role.

**Admin flow:**

* Admins sign in via the same auth endpoint (role set to `admin` in the user model).
* After signing in, admin can use dashboard routes or API endpoints to add/manage words.

---

## 🧪 Testing & Debugging tips

* Check network requests in browser devtools to ensure frontend-to-backend calls match the endpoints and include the `Authorization: Bearer <token>` header for protected routes.
* Use tools like Postman / Insomnia to test backend APIs independently.
* Add `console.log()` in backend route handlers while developing, and use `nodemon` for auto-reload.

---

## ✅ Deployment notes

* Build frontend: `npm run build` in `frontend/`
* Serve the `build/` folder statically from Express or deploy frontend separately (Netlify / Vercel) and backend to Heroku / Render / Railway.
* Keep `.env` secrets in the deployment platform's secret manager (do not commit `.env`).

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feat/some-feature`
3. Commit changes: `git commit -m "feat: add ..."`
4. Push branch and open a pull request

Please follow the exist
