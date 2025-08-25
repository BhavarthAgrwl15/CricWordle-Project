import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-black/70 backdrop-blur sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          🏏 <span>Cricket Wordle</span>
        </Link>

        {/* Menu */}
        <ul className="hidden md:flex space-x-8 text-gray-300 font-medium">
          <li>
            <Link to="/" className="hover:text-white transition">Home</Link>
          </li>
          <li>
            <Link to="/categories" className="hover:text-white transition">Categories</Link>
          </li>
          <li>
            <Link to="/leaderboard" className="hover:text-white transition">Leaderboard</Link>
          </li>
          <li>
            <Link to="/profile" className="hover:text-white transition">Profile</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-white transition">About</Link>
          </li>
        </ul>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition"
          >
            Login
          </Link>
          <Link 
            to="/signup"
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-400 text-gray-200 hover:bg-gray-200/10 transition shadow-md"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
