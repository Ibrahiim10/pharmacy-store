import express from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(morgan("dev"))

app.get("/", (req, res) => res.send("Pharmacy API running ✅"))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
