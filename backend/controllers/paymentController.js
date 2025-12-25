import Payment from "../models/Payment.js"
import Order from "../models/Order.js"
import { mpesaStkPush } from "../utils/mpesa.js"

// Admin list
export const getMpesaPaymentsAdmin = async (req, res, next) => {
  try {
    const { q, status } = req.query
    const filter = {}

    if (status && status !== "All") filter.status = status

    if (q) {
      const term = String(q).trim()
      filter.$or = [
        { phone: { $regex: term, $options: "i" } },
        { "mpesa.receipt": { $regex: term, $options: "i" } },
        { "mpesa.checkoutRequestID": { $regex: term, $options: "i" } },
      ]
    }

    const payments = await Payment.find(filter)
      .populate("order", "totalPrice isPaid status")
      .populate("user", "name email")
      .sort({ createdAt: -1 })

    res.json(payments)
  } catch (err) {
    next(err)
  }
}

// Customer: initiate STK push
export const initiateMpesa = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { phone } = req.body

    if (!phone || !String(phone).startsWith("254")) {
      return res.status(400).json({ message: "Phone must be in format 2547XXXXXXXX" })
    }

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ message: "Order not found" })

    // must be owner (or admin)
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" })
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" })
    }

    const amount = Number(order.totalPrice || 0)
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" })

    const stk = await mpesaStkPush({
      phone,
      amount,
      accountRef: `ORDER-${String(order._id).slice(-6)}`,
      description: "Pharmacy order payment",
    })

    const payment = await Payment.create({
      order: order._id,
      user: order.user,
      provider: "mpesa",
      status: "pending",
      amount,
      currency: "KES",
      phone,
      mpesa: {
        merchantRequestID: stk.MerchantRequestID,
        checkoutRequestID: stk.CheckoutRequestID,
        resultDesc: stk.ResponseDescription,
      },
      raw: stk,
    })

    res.status(201).json({
      success: true,
      message: "STK prompt sent. Enter PIN on your phone.",
      paymentId: payment._id,
      checkoutRequestID: stk.CheckoutRequestID,
    })
  } catch (err) {
    next(err)
  }
}

// Mpesa callback (public)
export const mpesaCallback = async (req, res, next) => {
  try {
    const cb = req.body?.Body?.stkCallback
    const checkoutRequestID = cb?.CheckoutRequestID
    if (!checkoutRequestID) return res.json({ ok: true })

    const payment = await Payment.findOne({ "mpesa.checkoutRequestID": checkoutRequestID })
    if (!payment) return res.json({ ok: true })

    payment.raw = req.body
    payment.mpesa.resultCode = String(cb.ResultCode)
    payment.mpesa.resultDesc = cb.ResultDesc

    if (String(cb.ResultCode) === "0") {
      const meta = cb.CallbackMetadata?.Item || []
      const findVal = (name) => meta.find((x) => x.Name === name)?.Value

      payment.status = "success"
      payment.mpesa.receipt = findVal("MpesaReceiptNumber") || ""
      payment.mpesa.transactionDate = String(findVal("TransactionDate") || "")
      await payment.save()

      const order = await Order.findById(payment.order)
      if (order) {
        order.isPaid = true
        order.paidAt = new Date()
        order.paymentMethod = "mpesa"
        order.paymentResult = {
          id: payment.mpesa.receipt,
          status: "success",
          update_time: new Date().toISOString(),
        }
        await order.save()
      }
    } else {
      payment.status = "failed"
      await payment.save()
    }

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}
