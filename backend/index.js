import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"


import { errorHandler, notfound } from "./middlewares/errorHandler.js"


dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000


app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(morgan("dev"))


// Routes
app.get("/", (req, res) => {
  res.send("Pharmacy API running ✅")
})


// Error middleware
app.use(notfound)
app.use(errorHandler)


// Connect to MongoDB
mongoose.connect(process.env.NODE_ENV == "development" ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PRO)
    .then(() => console.log('✅ MongoDB connected locally'))
    .catch(err => console.error('❌ Connection error:', err));

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})
