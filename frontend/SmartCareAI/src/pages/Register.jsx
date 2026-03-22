import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if (!name || !email || !password) return setError("All fields are required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (role === "doctor" && !inviteCode) return setError("Doctor invite code is required");

    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/auth/register`, {
        name, email, password, role, inviteCode,
      });
      navigate("/", { state: { message: `Registered as ${res.data.role}. Please log in.` } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Join SmartCareAI</p>

        {/* Role toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-5">
          <button
            onClick={() => setRole("patient")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              role === "patient"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 py-2 text-sm font-medium transition ${
              role === "doctor"
                ? "bg-indigo-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Doctor
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="mb-3 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          className="mb-3 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {role === "doctor" && (
          <input
            type="text"
            placeholder="Doctor invite code"
            className="mb-3 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-2 rounded-lg font-medium transition mt-1"
        >
          {loading ? "Registering..." : `Register as ${role}`}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}