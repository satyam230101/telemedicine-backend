import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_URL;
const ALLOWED_TYPES = ["text/plain", "application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE_MB = 5;

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setError("");
    setResult(null);

    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Invalid file type. Please upload a PDF, TXT, PNG, or JPEG.");
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${API}/api/reports/upload`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setResult(res.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Upload Medical Report</h2>
          <p className="text-sm text-gray-500 mb-6">Supported: PDF, TXT, PNG, JPEG — max 5MB</p>

          <label className="block w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition mb-4">
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.png,.jpg,.jpeg" />
            {file ? (
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500">Click to select a file</p>
                <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
              </div>
            )}
          </label>

          {error && (
            <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
          )}

          {result && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Report uploaded successfully</p>
              <p className="text-sm text-green-700 mt-1">Predicted: <strong>{result.disease}</strong></p>
              <p className="text-sm text-green-700">Assigned to: <strong>{result.doctor}</strong></p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/patient")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
            >
              Back
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition"
            >
              {loading ? "Analyzing..." : "Upload & Analyze"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}