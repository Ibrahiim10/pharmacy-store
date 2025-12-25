import Product from "../models/Product.js"

/**
 * @desc    Create a new product (medicine)
 * @route   POST /api/products
 * @access  Admin / Pharmacist
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user._id, // optional, if you want tracking
    })

    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all products (public)
 * @route   GET /api/products
 * @access  Public
 */

export const getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50)
    const skip = (page - 1) * limit

    const q = (req.query.q || "").trim()
    const status = req.query.status // active | inactive
    const prescription = req.query.prescription // true | false
    const lowStock = req.query.lowStock // true
    const expiringDays = req.query.expiringDays // e.g 30

    // sort options
    const sortBy = req.query.sortBy || "createdAt" // createdAt | price | countInStock | expiryDate
    const sortDir = req.query.sortDir === "asc" ? 1 : -1

    const filter = {}

    // search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ]
    }

    // filters
    if (status && ["active", "inactive"].includes(status)) filter.status = status
    if (prescription === "true") filter.prescriptionRequired = true
    if (prescription === "false") filter.prescriptionRequired = false

    if (lowStock === "true") filter.countInStock = { $lte: 5 }

    if (expiringDays) {
      const days = Math.max(parseInt(expiringDays, 10), 1)
      const now = new Date()
      const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      filter.expiryDate = { $lte: until }
    }

    const sort = { [sortBy]: sortDir }

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ])

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}


/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) return res.status(404).json({ message: "Product not found" })

    res.json(product)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Admin / Pharmacist
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!product) return res.status(404).json({ message: "Product not found" })

    res.json(product)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Admin / Pharmacist
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) return res.status(404).json({ message: "Product not found" })

    res.json({ message: "Product deleted" })
  } catch (error) {
    next(error)
  }
}
