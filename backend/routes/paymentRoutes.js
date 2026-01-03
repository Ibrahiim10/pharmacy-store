import express from "express"
import { protect } from "../middlewares/authMiddleware.js"
import { authorize } from "../middlewares/roleMiddleware.js"
import {
  getMpesaPaymentsAdmin,
  initiateMpesa,
  mpesaCallback,
} from "../controllers/paymentController.js"

const router = express.Router()

// Admin list payments
router.get("/", protect, authorize("admin", "pharmacist"), getMpesaPaymentsAdmin)

// Customer initiate STK
router.post("/mpesa/stk/:orderId", protect, initiateMpesa)

// Public callback
router.post("/mpesa/callback", mpesaCallback)

export default router
