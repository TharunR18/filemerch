import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt",
  "zip", "rar", "7z", "png", "jpg", "jpeg", "webp"
];

const BLOCKED_EXTENSIONS = [
  "apk", "exe", "bat", "cmd", "scr", "msi", "ps1", "jar", "sh", "com"
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File type .${ext} is blocked for security reasons`), false);
  }
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File type .${ext} is not allowed`), false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
  fileFilter,
});

export default upload;  