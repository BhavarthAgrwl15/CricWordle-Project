import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar";
import Home from "./pages/home";
import LoginPage from "./pages/login";
import './App.css';
import './index.css';
import SignupPage from "./pages/signup";
import AboutPage from "./pages/about";
export default function App() {
  return (
    
    <BrowserRouter>
       <div className="font-bold text-2xl font-bold ">hello</div>
       <div className="min-h-screen flex flex-col">
         <NavBar />
         <main className="flex-grow">
           <Routes>
             <Route path="/" element={<Home />} />
               <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
     </BrowserRouter>
  );
}