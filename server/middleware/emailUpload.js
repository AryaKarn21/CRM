// ─────────────────────────────────────────────────────────────
// EMAIL ATTACHMENT UPLOAD (multer)
// Mirrors the uploadReceipt.js convention: disk storage, UUID filenames,
// mime allow-list, size cap. Executables are never accepted.
// ─────────────────────────────────────────────────────────────
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const uploadPath = path.join(process.cwd(), "uploads", "email");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    // Never trust originalname on disk — store as UUID + extension.
    cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
  },
});

// Deliberately broad (email carries many document types) but no
// executables / scripts / archives that commonly smuggle malware.
const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "text/plain", "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const BLOCKED_EXT = [
  ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".pif",
  ".js", ".jse", ".vbs", ".vbe", ".ps1", ".sh", ".jar", ".app", ".dll",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXT.includes(ext)) {
    return cb(new Error(`Executable files (${ext}) cannot be attached.`));
  }
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error(`File type "${file.mimetype}" is not allowed as an attachment.`));
  }
  cb(null, true);
};

const uploadEmailAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB per file — typical provider ceiling
    files: 10,                  // max attachments per message
  },
});

export default uploadEmailAttachment;