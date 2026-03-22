import { useEffect, useState } from "react";
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

export default function DoctorDashboard() {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter]         = useState("all");

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/reports/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data.reports);
    } catch {
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("token");
      await axios.patch(`${API}/api/reports/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const counts = {
    all:       reports.length,
    pending:   reports.filter(r => r.status === "pending").length,
    assigned:  reports.filter(r => r.status === "assigned").length,
    completed: reports.filter(r => r.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Patient Reports</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "pending", "assigned", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>

        {error && <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500 py-16">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
            No reports in this category.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((report) => (
              <div key={report._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-800">
                      {report.patientId?.name || "Unknown patient"}
                    </p>
                    <p className="text-sm text-gray-500">{report.patientId?.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize flex-shrink-0 ${statusStyles[report.status] || "bg-gray-100 text-gray-600"}`}>
                    {report.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-0.5">AI prediction</p>
                    <p className="font-medium text-gray-800">{report.predictedDisease}</p>
                    <ConfidenceBadge confidence={report.confidence} method={report.predictionMethod} />
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5">File</p>
                    <p className="font-medium text-gray-800 truncate text-xs">{report.file}</p>
                    {report.createdAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  <a
                    href={report.fileUrl || `${API}/uploads/${report.file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
                  >
                    View file
                  </a>
                  {report.status !== "completed" && (
                    <button
                      onClick={() => updateStatus(report._id, "completed")}
                      disabled={updatingId === report._id}
                      className="text-xs bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      {updatingId === report._id ? "Saving..." : "Mark completed"}
                    </button>
                  )}
                  {report.status === "completed" && (
                    <button
                      onClick={() => updateStatus(report._id, "assigned")}
                      disabled={updatingId === report._id}
                      className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg transition"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}