const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ROOT = process.cwd();
const publicHospitalDir = path.join(ROOT, "uploads", "hospitals");
const privateDocumentDir = path.join(ROOT, "private_uploads", "hospital-documents");

fs.mkdirSync(publicHospitalDir, { recursive: true });
fs.mkdirSync(privateDocumentDir, { recursive: true });

const imageFields = new Set(["logo", "images"]);
const documentFields = new Set([
  "registrationCertificate",
  "ownerId",
  "fireSafety",
  "biomedicalWaste",
  "accreditation",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageFields.has(file.fieldname) ? publicHospitalDir : privateDocumentDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const imageMimes = ["image/jpeg", "image/png", "image/webp"];
  const documentMimes = ["application/pdf", "image/jpeg", "image/png"];

  if (imageFields.has(file.fieldname)) {
    const valid = imageMimes.includes(file.mimetype) && [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    return cb(valid ? null : new Error("Logo and hospital photos must be JPG, PNG or WEBP images."), valid);
  }

  if (documentFields.has(file.fieldname)) {
    const valid = documentMimes.includes(file.mimetype) && [".pdf", ".jpg", ".jpeg", ".png"].includes(ext);
    return cb(valid ? null : new Error("Documents must be PDF, JPG or PNG files."), valid);
  }

  return cb(new Error(`Unexpected upload field: ${file.fieldname}`));
};

const hospitalUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 11,
    fields: 30,
  },
});

const hospitalRegistrationUpload = hospitalUpload.fields([
  { name: "logo", maxCount: 1 },
  { name: "images", maxCount: 5 },
  { name: "registrationCertificate", maxCount: 1 },
  { name: "ownerId", maxCount: 1 },
  { name: "fireSafety", maxCount: 1 },
  { name: "biomedicalWaste", maxCount: 1 },
  { name: "accreditation", maxCount: 1 },
]);

module.exports = { hospitalUpload, hospitalRegistrationUpload };
