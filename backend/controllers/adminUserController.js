import User from "../models/User.js"
import bcrypt from "bcryptjs"

/**
 * @route   GET /api/admin/users?role=admin&q=ibrahim
 * @access  Admin only
 */
export const getUsersAdmin = async (req, res, next) => {
  try {
    const { role, q } = req.query

    const filter = {}

    if (role && role !== "All") filter.role = role

    if (q) {
      const term = String(q).trim()
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ]
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    next(err)
  }
}

/**
 * @route   POST /api/admin/users
 * @access  Admin only
 */
export const createUserAdmin = async (req, res, next) => {
  try {
    let { name, email, password, role, profilePic } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" })
    }

    email = email.toLowerCase()

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: "User already exists" })

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      profilePic: profilePic || "",
    })

    user.password = undefined
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
}

/**
 * @route   PUT /api/admin/users/:id
 * @access  Admin only
 */
export const updateUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params

    const allowed = ["name", "role", "profilePic"]
    const payload = {}

    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k]
    }

    const updated = await User.findByIdAndUpdate(id, payload, {
      new: true,
    }).select("-password")

    if (!updated) return res.status(404).json({ message: "User not found" })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}

/**
 * @route   DELETE /api/admin/users/:id
 * @access  Admin only
 */
export const deleteUserAdmin = async (req, res, next) => {
  try {
    const { id } = req.params

    // prevent deleting yourself (optional)
    if (String(req.user._id) === String(id)) {
      return res.status(400).json({ message: "You cannot delete your own account." })
    }

    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: "User not found" })

    res.json({ success: true, message: "User deleted" })
  } catch (err) {
    next(err)
  }
}

/**
 * @route   PUT /api/admin/users/:id/reset-password
 * @access  Admin only
 */
export const resetUserPasswordAdmin = async (req, res, next) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.json({ success: true, message: "Password reset successful" })
  } catch (err) {
    next(err)
  }
}
