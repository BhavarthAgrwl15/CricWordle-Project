import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/home";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import AboutPage from "./pages/about";
import CategoriesPage from "./pages/categories";
import ScoreboardCard from "./pages/scoreboard";
import { PrivateRoute, GuestRoute } from "../route-protect";
import { AuthProvider } from "./contexts/auth-provider";
import "./index.css";
import Matrix from "./components/matrix";
import Leaderboard from "./pages/leaderboard";
import Profile from "./pages/profile";
import Start from "./pages/game";
import { Toaster } from "react-hot-toast"; // ✅ import Toaster

function Layout() {
  const location = useLocation();
  const hideNavOn = ["/play"]; // 👈 all routes where NavBar should be hidden

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/lords.jpg')" }}
    >
      <div className="min-h-screen bg-black/60 flex flex-col">
        {!hideNavOn.includes(location.pathname) && <NavBar />}
        <main className="flex-grow">
          <Routes>
            {/* Public pages */}
            <Route path="/about" element={<AboutPage />} />

            {/* Guest-only */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignupPage />
                </GuestRoute>
              }
            />

            {/* Private pages */}
            <Route
              path="/play"
              element={
                <PrivateRoute>
                  <Matrix />
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute>
                  <CategoriesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/start"
              element={
                <PrivateRoute>
                  <Start />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Home */}
            <Route
              path="/"
              element={
                <GuestRoute>
                  <Home />
                </GuestRoute>
              }
            />
          </Routes>
        </main>
      </div>

      {/* ✅ Global toaster (mounted once) */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
