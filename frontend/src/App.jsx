import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/home";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import AboutPage from "./pages/about";
import CategoriesPage from "./pages/categories";
import ScoreboardCard from "./pages/scoreboard";
import { PrivateRoute, GuestRoute } from "../route-protect";
import { AuthProvider } from "./contexts/auth-provider";
import './index.css';
import Matrix from "./components/matrix";
import Leaderboard from "./pages/leaderboard";
import Profile from "./pages/profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div
          className="min-h-screen bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/ground.jpg')" }}
        >
          <div className="min-h-screen bg-black/60">
            <NavBar />
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
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                {/* Optional: redirect "/" to categories if logged in */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
          </Routes>
        </main>
      </div>
    </div>
     </BrowserRouter>
    </AuthProvider>
  );
}
