import express from "express"
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js"

import { validateZod } from "../middlewares/validateZod.js"
import { protect } from "../middlewares/authMiddleware.js"
import { authorize } from "../middlewares/roleMiddleware.js"
import { productValidationSchema } from "../schemas/productSchema.js"

import { uploadProductImage } from "../controllers/productUploadController.js"
import { upload } from "../middlewares/uploadMiddleware.js"

const router = express.Router()

// Public
router.get("/", getProducts)
router.get("/:id", getProductById)

// Admin/Pharmacist - Create product
router.post(
  "/",
  protect,
  authorize("admin", "pharmacist"),
  validateZod(productValidationSchema),
  createProduct
)

// Admin/Pharmacist - Upload product image
router.post(
  "/:id/image",
  protect,
  authorize("admin", "pharmacist"),
  upload.single("file"),
  uploadProductImage
)

// Admin/Pharmacist - Update / Delete
router.put("/:id", protect, authorize("admin", "pharmacist"), updateProduct)
router.delete("/:id", protect, authorize("admin", "pharmacist"), deleteProduct)

export default router
