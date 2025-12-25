import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // snapshot fields (so order stays correct even if product changes)
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },

    prescriptionRequired: { type: Boolean, default: false },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderItems: {
      type: [orderItemSchema],
      required: true,
    },

    shippingAddress: {
      phone: { type: String, required: true },
      county: { type: String },
      city: { type: String, required: true },
      street: { type: String, required: true },
      apartment: { type: String },
      notes: { type: String },
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "card", "mpesa"],
      default: "cod",
    },

    itemsPrice: { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    // pharmacy-specific
    requiresPrescription: { type: Boolean, default: false },

    prescription: {
      url: { type: String }, // later: multer/cloudinary
      uploadedAt: { type: Date },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "dispatched", "delivered"],
      default: "pending",
      index: true,
    },

    pharmacistNote: { type: String, default: "" },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    deliveredAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model("Order", orderSchema)
