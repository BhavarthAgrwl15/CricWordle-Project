import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar";
import Home from "./pages/home";
import LoginPage from "./pages/login";
import './index.css';
import SignupPage from "./pages/signup";
import AboutPage from "./pages/about";
import CategoriesPage from "./pages/categories";
export default function App() {
  return (
    
    <BrowserRouter>
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/ground.jpg')" }}
    >
      {/* Dark overlay for readability */}
      <div className="min-h-screen bg-black/60">
         <NavBar />
         <main className="flex-grow">
           <Routes>
             <Route path="/" element={<Home />} />
               <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/categories" element={<CategoriesPage />} />

          </Routes>
        </main>
      </div>
    </div>
     </BrowserRouter>
  );
}