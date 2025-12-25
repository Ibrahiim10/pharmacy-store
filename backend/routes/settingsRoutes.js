import express from "express"
import { getSettings, updateSettings } from "../controllers/settingsController.js"
import { protect } from "../middlewares/authMiddleware.js"
import { authorize } from "../middlewares/roleMiddleware.js"

const router = express.Router()

router.get("/", protect, authorize("admin", "pharmacist"), getSettings)
router.put("/", protect, authorize("admin", "pharmacist"), updateSettings)

export default router
