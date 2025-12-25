import User from "../models/User.js"

// GET /api/users  (admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (err) {
    next(err)
  }
}

// GET /api/users/:id  (admin only)
export const getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

// POST /api/users  (admin only) - create user safely
export const createUser = async (req, res, next) => {
  try {
    let { name, email, password, role, profilePic } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" })
    }

    email = email.toLowerCase().trim()

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: "User already exists" })

    // ✅ allow only specific roles, otherwise default
    const allowedRoles = ["customer", "admin", "pharmacist"]
    if (!allowedRoles.includes(role)) role = "customer"

    const user = await User.create({ name, email, password, role, profilePic })

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    })
  } catch (err) {
    next(err)
  }
}

// PUT /api/users/:id  (admin only)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params

    // Block dangerous fields from being updated blindly
    const updates = { ...req.body }
    delete updates.password // must be updated via dedicated endpoint
    delete updates.email // optional: allow email update only via special flow

    // prevent random users promoting themselves
    if (updates.role) {
      const allowedRoles = ["customer", "admin", "pharmacist"]
      if (!allowedRoles.includes(updates.role)) delete updates.role
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!updatedUser) return res.status(404).json({ message: "User not found" })

    res.json(updatedUser)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/users/:id  (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: "User not found" })

    res.json({ message: `User with id ${id} deleted` })
  } catch (err) {
    next(err)
  }
}
