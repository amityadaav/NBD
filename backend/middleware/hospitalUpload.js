const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const publicDir = path.join(__dirname, "../uploads/hospitals");
const privateDir = path.join(__dirname, "../private_uploads/hospital-documents");

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(privateDir, { recursive: true });

const IMAGE_FIELDS = ["logo", "images"];
const DOCUMENT_FIELDS = [
  "registrationCertificate",
  "ownerId",
  "fireSafety",
  "biomedicalWaste",
  "accreditation",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGE_FIELDS.includes(file.fieldname) ? publicDir : privateDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFields = [...IMAGE_FIELDS, ...DOCUMENT_FIELDS];

  if (!allowedFields.includes(file.fieldname)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }

  const imageTypes = ["image/jpeg", "image/png", "image/webp"];
  const documentTypes = ["application/pdf", "image/jpeg", "image/png"];
  const allowedTypes = IMAGE_FIELDS.includes(file.fieldname) ? imageTypes : documentTypes;

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type for "${file.fieldname}".`));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 11, // 1 logo + 5 images + 5 documents
  },
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "images", maxCount: 5 },
  { name: "registrationCertificate", maxCount: 1 },
  { name: "ownerId", maxCount: 1 },
  { name: "fireSafety", maxCount: 1 },
  { name: "biomedicalWaste", maxCount: 1 },
  { name: "accreditation", maxCount: 1 },
]);

// Return upload problems as 400 instead of a generic 500
const hospitalRegistrationUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();

    console.error("UPLOAD ERROR:", err);

    const message =
      err instanceof multer.MulterError
        ? err.code === "LIMIT_FILE_SIZE"
          ? "Each file must be 5 MB or less."
          : `Upload error: ${err.message}${err.field ? ` (${err.field})` : ""}`
        : err.message || "File upload failed.";

    return res.status(400).json({ success: false, message });
  });
};

module.exports = { hospitalRegistrationUpload };