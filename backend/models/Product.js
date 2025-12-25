import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    prescriptionRequired: {
      type: Boolean,
      default: false,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
)

// ✅ ADD THIS TEXT INDEX
productSchema.index({
  name: "text",
  category: "text",
  description: "text",
})

export default mongoose.model("Product", productSchema)
