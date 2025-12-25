import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
  {
    // Store
    storeName: { type: String, default: "Pharmacy Store" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    whatsappNumber: { type: String, default: "254719583400" },
    address: { type: String, default: "Nairobi, Kenya" },
    tagline: { type: String, default: "Get Medicines With Ease" },

    // Operations
    lowStockThreshold: { type: Number, default: 5 },
    expiringSoonDays: { type: Number, default: 30 },
    autoDeactivateExpired: { type: Boolean, default: true },
    requireRxApprovalBeforeDispatch: { type: Boolean, default: true },

    // Delivery
    deliveryEnabled: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 0 },
    freeDeliveryMin: { type: Number, default: 0 },

    // Payments (Mpesa placeholders)
    mpesaEnabled: { type: Boolean, default: false },
    mpesaShortCode: { type: String, default: "" },
    mpesaPasskey: { type: String, default: "" },
    mpesaCallbackUrl: { type: String, default: "" },
    paymentNotes: { type: String, default: "Cash on delivery and Card supported." },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

export default mongoose.model("Settings", settingsSchema)
