export default function NavBar() {
  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">MyGame</h1>
      <ul className="flex space-x-6">
        <li className="hover:text-gray-200 cursor-pointer">Home</li>
        <li className="hover:text-gray-200 cursor-pointer">Categories</li>
        <li className="hover:text-gray-200 cursor-pointer">Leaderboard</li>
        <li className="hover:text-gray-200 cursor-pointer">Profile</li>
      </ul>
    </nav>
  );
}