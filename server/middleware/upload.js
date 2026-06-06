import multer from "multer";
import path from "path";

// ─── Storage Configuration ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp.ext
    const uniqueSuffix = `${req.user?._id || "unknown"}-${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ─── File Filter — allow only images ───
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files are allowed (jpeg, jpg, png, gif, webp, svg)"),
      false
    );
  }
};

// ─── Multer Instance ───
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter,
});

// ─── Export pre-configured middleware ───

// Single avatar upload
export const uploadAvatar = upload.single("avatar");

// Single generic image upload
export const uploadImage = upload.single("image");

// Multiple images (max 5)
export const uploadImages = upload.array("images", 5);

export default upload;
