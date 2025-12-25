import express from "express"
import {
  getUsersAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  resetUserPasswordAdmin,
} from "../controllers/adminUserController.js"
import { protect } from "../middlewares/authMiddleware.js"
import { authorize } from "../middlewares/roleMiddleware.js"

const router = express.Router()

router.use(protect, authorize("admin"))

router.get("/", getUsersAdmin)
router.post("/", createUserAdmin)
router.put("/:id", updateUserAdmin)
router.delete("/:id", deleteUserAdmin)
router.put("/:id/reset-password", resetUserPasswordAdmin)

export default router
