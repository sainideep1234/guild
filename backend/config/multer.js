import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve upload folder relative to project root (one level up from /config)
const uploadDir = path.join(__dirname, "..", "uploads");

// Create the folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are allowed"), false);
  }
};

// Per-field size limits (in bytes)
const FILE_SIZE_LIMITS = {
  photo: 100 * 1024,       // 100 KB
  aadhaarFile: 200 * 1024,  // 200 KB
  certFile: 200 * 1024,     // 200 KB
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 }, // Hard cap at 200KB (the max of all limits)
});

/**
 * Middleware: validate each uploaded file against its per-field size limit.
 * If a file exceeds the limit, it is deleted from disk and an error is returned.
 */
export function validateFileSizes(req, res, next) {
  const files = req.files || {};
  const errors = [];

  for (const [fieldName, fileArray] of Object.entries(files)) {
    const limit = FILE_SIZE_LIMITS[fieldName];
    if (!limit) continue;

    for (const file of fileArray) {
      if (file.size > limit) {
        const limitKB = Math.round(limit / 1024);
        const sizeKB = Math.round(file.size / 1024);
        errors.push(
          `${fieldName} is ${sizeKB}KB but must be under ${limitKB}KB`
        );
        // Delete the oversized file from disk
        try {
          fs.unlinkSync(file.path);
        } catch (_) { /* ignore cleanup errors */ }
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(". ") });
  }
  next();
}

export default upload;
