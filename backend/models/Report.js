import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    file: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,   // Cloudinary URL or null for local
      default: null,
    },
    extractedText: String,
    predictedDisease: {
      type: String,
      default: "Pending",
    },
    confidence: {
      type: Number,
      default: null,
    },
    predictionMethod: {
      type: String,
      enum: ["ml", "rules", "fallback", "none", null],
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);