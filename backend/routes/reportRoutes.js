import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";
import { upload, useCloudinary } from "../middleware/uploadMiddleware.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { analyzeReport } from "../utils/aiAnalyzer.js";

const router = express.Router();

// Helper: get the file URL/path to send to FastAPI and to store in DB
function getFileRef(file) {
  if (useCloudinary) {
    return { fileId: file.filename, fileUrl: file.path };
  }
  return { fileId: file.filename, fileUrl: null };
}

// PATIENT uploads report
router.post(
  "/upload",
  verifyToken,
  checkRole("patient"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const { fileId, fileUrl } = getFileRef(req.file);

      const newReport = new Report({
        patientId: req.user.id,
        file:      fileId,
        fileUrl:   fileUrl,
        status:    "pending",
      });
      await newReport.save();

      // Try FastAPI ML prediction
      let predictedDisease = "Analysis pending";
      let confidence       = null;
      let predictionMethod = "none";

      try {
        const formData = new FormData();

        if (useCloudinary) {
          // Download from Cloudinary and re-stream to FastAPI
          const cloudRes = await axios.get(fileUrl, { responseType: "arraybuffer" });
          const buf = Buffer.from(cloudRes.data);
          formData.append("file", buf, { filename: fileId });
        } else {
          formData.append("file", fs.createReadStream(`uploads/${fileId}`));
        }

        const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
        const response = await axios.post(`${fastApiUrl}/predict`, formData, {
          headers: formData.getHeaders(),
          timeout: 10000,
        });

        predictedDisease = response.data.predicted_disease || "Unknown";
        confidence       = response.data.confidence        ?? null;
        predictionMethod = response.data.prediction_method || "rules";
      } catch (err) {
        // FastAPI down — use local keyword fallback
        console.warn("FastAPI unavailable:", err.message);
        if (!useCloudinary) {
          predictedDisease = analyzeReport(fileId);
          predictionMethod = "fallback";
        }
      }

      // Round-robin doctor assignment
      const doctors = await User.find({ role: "doctor" });
      let assignedDoctor = null;
      if (doctors.length > 0) {
        const reportCount  = await Report.countDocuments();
        assignedDoctor     = doctors[reportCount % doctors.length];
      }

      newReport.predictedDisease = predictedDisease;
      newReport.confidence       = confidence;
      newReport.predictionMethod = predictionMethod;
      newReport.doctorId         = assignedDoctor ? assignedDoctor._id : null;
      newReport.status           = assignedDoctor ? "assigned" : "pending";
      await newReport.save();

      res.json({
        message:          "Report uploaded successfully",
        disease:          predictedDisease,
        confidence,
        predictionMethod,
        doctor: assignedDoctor
          ? assignedDoctor.name || assignedDoctor.email
          : "No doctor assigned",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// DOCTOR views all reports
router.get("/all", verifyToken, checkRole("doctor"), async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("patientId", "name email")
      .populate("doctorId",  "name email")
      .sort({ createdAt: -1 });
    res.json({ message: "Reports fetched", count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATIENT views own reports
router.get("/my", verifyToken, checkRole("patient"), async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.user.id })
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 });

    const formatted = reports.map((r) => ({
      id:              r._id,
      file:            r.file,
      fileUrl:         r.fileUrl,
      disease:         r.predictedDisease,
      confidence:      r.confidence,
      predictionMethod: r.predictionMethod,
      doctor:          r.doctorId ? r.doctorId.name || r.doctorId.email : "Not assigned yet",
      status:          r.status,
      createdAt:       r.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DOCTOR updates report status
router.patch("/:id/status", verifyToken, checkRole("doctor"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "assigned", "completed"].includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Status updated", report });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;