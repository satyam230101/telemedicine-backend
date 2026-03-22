import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_URL;

const statusStyles = {
  pending:   "bg-yellow-100 text-yellow-700",
  assigned:  "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

function ConfidenceBadge({ confidence, method }) {
  if (confidence == null) return null;
  const pct   = Math.round(confidence * 100);
  const color = pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-500";
  const label = method === "ml" ? "ML" : method === "rules" ? "rules" : "fallback";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {pct}% confidence <span className="text-gray-400">({label})</span>
    </span>
  );
}

function getFileUrl(report) {
  if (report.fileUrl) return report.fileUrl;
  return `${API}/uploads/${report.file}`;
}

export default function PatientDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/reports/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch {
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Reports</h1>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow text-sm font-medium transition"
          >
            + Upload Report
          </button>
        </div>

        {error && <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500 py-16">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-lg mb-1">No reports yet</p>
            <p className="text-sm">Upload a medical report to get an AI prediction.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-gray-800 truncate flex-1 text-sm">{report.file}</p>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize flex-shrink-0 ${statusStyles[report.status] || "bg-gray-100 text-gray-600"}`}>
                    {report.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-0.5">Predicted condition</p>
                    <p className="font-medium text-gray-800">{report.disease || "Processing..."}</p>
                    <ConfidenceBadge confidence={report.confidence} method={report.predictionMethod} />
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5">Assigned doctor</p>
                    <p className="font-medium text-gray-800">{report.doctor}</p>
                  </div>
                </div>

                {report.createdAt && (
                  <p className="text-xs text-gray-400 mt-3">
                    Uploaded {new Date(report.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                  </p>
                )}

                <div className="mt-3">
                  <button
                    onClick={() => window.open(getFileUrl(report), "_blank")}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
                  >
                    View file
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}