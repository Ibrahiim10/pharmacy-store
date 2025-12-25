import express from "express"
import { uploadPrescription } from "../controllers/uploadController.js"
import { protect } from "../middlewares/authMiddleware.js"
import { upload } from "../middlewares/uploadMiddleware.js"

const router = express.Router()

router.post(
  "/prescription/:orderId",
  protect,
  upload.single("file"),
  uploadPrescription
)

export default router
