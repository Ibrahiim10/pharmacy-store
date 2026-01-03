import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"


import { errorHandler, notFound } from "./middlewares/errorHandler.js"
import authRoutes from "./routes/authRoutes.js"
import adminUserRoutes from "./routes/adminUserRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import settingsRoutes from "./routes/settingsRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import { verifyMailer } from "./utils/mailer.js"
import contactRoutes from "./routes/contactRoutes.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000
verifyMailer()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(morgan("dev"))


// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin/users", adminUserRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/uploads", uploadRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/contact", contactRoutes)


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pharmacy Store API is running 🚀",
  });
});


// Error middleware
app.use(notFound)
app.use(errorHandler)


// Connect to MongoDB
mongoose.connect(process.env.NODE_ENV == "development" ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PRO)
    .then(() => console.log('✅ MongoDB connected locally'))
    .catch(err => console.error('❌ Connection error:', err));

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})
