import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-600">SmartCareAI</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{role}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Hello, <span className="font-medium text-gray-800">{name}</span></span>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg transition font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}