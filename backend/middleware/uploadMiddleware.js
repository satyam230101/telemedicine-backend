import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();

const allowedMimeTypes = [
  "text/plain",
  "application/pdf",
  "image/png",
  "image/jpeg",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, TXT, PNG, and JPEG are allowed."), false);
  }
};

// ── Cloudinary storage (if credentials are set) ──────────────────────────────
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let upload;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         "smartcareai/reports",
      resource_type:  "auto",
      allowed_formats: ["pdf", "txt", "png", "jpg", "jpeg"],
      public_id: (req, file) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        return `${Date.now()}-${safeName}`;
      },
    },
  });

  upload = multer({
    storage: cloudinaryStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  console.log("Storage: Cloudinary");
} else {
  // ── Local disk storage (fallback) ─────────────────────────────────────────
  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    },
  });

  upload = multer({
    storage: diskStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  console.log("Storage: local disk (uploads/)");
}

export { upload, useCloudinary };