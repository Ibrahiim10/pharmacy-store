import express from "express"
import {
  getUsers,
  getUserInfo,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"
import { authorize } from "../middlewares/roleMiddleware.js"

const router = express.Router()

// Admin only
router.get("/", protect, authorize("admin"), getUsers)
router.post("/", protect, authorize("admin"), createUser)
router.get("/:id", protect, authorize("admin"), getUserInfo)
router.put("/:id", protect, authorize("admin"), updateUser)
router.delete("/:id", protect, authorize("admin"), deleteUser)

export default router
