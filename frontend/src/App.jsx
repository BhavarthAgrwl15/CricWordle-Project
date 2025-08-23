import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar";
import Home from "./pages/home";
export default function App() {
  return (
    
    <BrowserRouter>
       <div className="min-h-screen flex flex-col">
         <NavBar />
         <main className="flex-grow">
           <Routes>
             <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
     </BrowserRouter>
  );
}