import multer from "multer"

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png","image/webp", "application/pdf"]

  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only JPG, PNG, and PDF files are allowed"), false)
  } else {
    cb(null, true)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})
