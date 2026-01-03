import User from "../models/User.js"
import { generateToken } from "../utils/generateToken.js"

// Register
export const registerUser = async (req, res, next) => {
  let { name, email, password, profilePic } = req.body

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" })
    }

    email = email.toLowerCase().trim()

    const userExists = await User.findOne({ email })
    if (userExists) return res.status(400).json({ message: "User already exists" })

    // 🔐 IMPORTANT: do NOT trust role from client
    const user = await User.create({
      name,
      email,
      password,
      profilePic,
      role: "user",
    })

    const token = generateToken(user._id)

    // Password is excluded by default (select:false), but we still return safe user payload
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Login
export const loginUser = async (req, res, next) => {
  let { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    email = email.toLowerCase().trim()

    // ✅ Must select password for comparePassword to work
    const user = await User.findOne({ email }).select("+password")

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" })
    }

    const token = generateToken(user._id)

    // Remove password before sending user
    user.password = undefined

    res.json({ token, user })
  } catch (error) {
    next(error)
  }
}


// Get current user (me)
export const getMe = async (req, res) => {
  res.json(req.user)
}
