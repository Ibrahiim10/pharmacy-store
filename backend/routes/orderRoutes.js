import express from "express"
import {
  createOrder,
  getMyOrders,
  getOrderById,
  decideOrder,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js"

import { protect } from "../middlewares/authMiddleware.js"
import { authorize } from "../middlewares/roleMiddleware.js"
import { validateZod } from "../middlewares/validateZod.js"
import { createOrderSchema } from "../schemas/orderSchema.js"

const router = express.Router()

// Customer
router.post("/", protect, validateZod(createOrderSchema), createOrder)
router.get("/my", protect, getMyOrders)

// Owner or staff
router.get("/:id", protect, getOrderById)

// Staff
router.put(
  "/:id/decision",
  protect,
  authorize("admin", "pharmacist"),
  decideOrder
)

router.put(
  "/:id/status",
  protect,
  authorize("admin", "pharmacist"),
  updateOrderStatus
)

router.get("/", protect, authorize("admin", "pharmacist"), getAllOrders)


export default router
