import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    provider: { type: String, enum: ["mpesa"], default: "mpesa" },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "KES" },

    phone: { type: String, default: "" },

    mpesa: {
      merchantRequestID: String,
      checkoutRequestID: { type: String, index: true },
      resultCode: String,
      resultDesc: String,
      receipt: String,
      transactionDate: String,
    },

    raw: { type: Object, default: {} },
  },
  { timestamps: true }
)

export default mongoose.model("Payment", paymentSchema)
