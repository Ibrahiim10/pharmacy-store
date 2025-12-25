import Order from "../models/Order.js"
import Product from "../models/Product.js"

/**
 * @desc    Create order (place order)
 * @route   POST /api/orders
 * @access  Private (customer)
 */
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body

    // 1) Fetch products and validate quantities
    const productIds = orderItems.map((i) => i.product)
    const products = await Product.find({ _id: { $in: productIds } })

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "One or more products not found" })
    }

    // 2) Build final items with snapshots + compute totals
    let requiresPrescription = false
    let itemsPrice = 0

    const finalItems = orderItems.map((item) => {
      const p = products.find((x) => x._id.toString() === item.product)

      if (!p) throw new Error("Product not found during mapping")

      if (p.countInStock < item.qty) {
        const msg = `Not enough stock for ${p.name}. Available: ${p.countInStock}`
        const err = new Error(msg)
        err.statusCode = 400
        throw err
      }

      const lineTotal = p.price * item.qty
      itemsPrice += lineTotal

      if (p.prescriptionRequired) requiresPrescription = true

      return {
        product: p._id,
        name: p.name,
        price: p.price,
        qty: item.qty,
        prescriptionRequired: p.prescriptionRequired,
      }
    })

    const shippingPrice = 0
    const totalPrice = itemsPrice + shippingPrice

    // 3) Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems: finalItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      itemsPrice,
      shippingPrice,
      totalPrice,
      requiresPrescription,
      status: "pending",
    })

    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get my orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    })
    res.json(orders)
  } catch (error) {
    next(error)
  }
}

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get order by id (owner or admin/pharmacist)
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email role"
    )

    if (!order) return res.status(404).json({ message: "Order not found" })

    // owner OR admin/pharmacist
    const isOwner = order.user._id.toString() === req.user._id.toString()
    const isStaff = ["admin", "pharmacist"].includes(req.user.role)

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Approve or reject order (pharmacist/admin)
 * @route   PUT /api/orders/:id/decision
 * @access  Admin/Pharmacist
 */
export const decideOrder = async (req, res, next) => {
  try {
    const { action, pharmacistNote } = req.body // action: "approve" | "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" })
    }

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: "Order not found" })

    order.status = action === "approve" ? "approved" : "rejected"
    if (pharmacistNote) order.pharmacistNote = pharmacistNote

    const updated = await order.save()
    res.json(updated)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update order status (admin/pharmacist)
 * @route   PUT /api/orders/:id/status
 * @access  Admin/Pharmacist
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body // dispatched/delivered

    const allowed = ["approved", "dispatched", "delivered"]
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of ${allowed}` })
    }

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: "Order not found" })

    order.status = status
    if (status === "delivered") order.deliveredAt = new Date()

    const updated = await order.save()
    res.json(updated)
  } catch (error) {
    next(error)
  }
}
