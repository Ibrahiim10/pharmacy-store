import Order from "../models/Order.js"
import cloudinary from "../utils/cloudinary.js"

/**
 * @desc    Upload prescription for an order
 * @route   POST /api/uploads/prescription/:orderId
 * @access  Private (order owner)
 */
export const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const order = await Order.findById(req.params.orderId)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Only order owner can upload prescription
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pharmacy_prescriptions",
        resource_type: "auto",
      },
      async (error, result) => {
        if (error) return next(error)

        order.prescription = {
          url: result.secure_url,
          uploadedAt: new Date(),
        }

        await order.save()

        res.status(201).json({
          success: true,
          message: "Prescription uploaded successfully",
          prescriptionUrl: result.secure_url,
        })
      }
    )

    stream.end(req.file.buffer)
  } catch (error) {
    next(error)
  }
}
