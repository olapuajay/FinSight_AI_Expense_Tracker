import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import transactions from "./routes/transactionRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactions)

app.get("/", (req, res) => {
  res.send({ message: "Hello from server!" });
});

const port = process.env.PORT || 8001;
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});