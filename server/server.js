import "./config/env.js";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./utils/socket.js";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactions from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import budgetInsightsRoutes from "./routes/budgetInsightsRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/transactions", transactions);
app.use("/api/budgets", budgetRoutes);
app.use("/api/budget-insights", budgetInsightsRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send({ message: "Hello from server!" });
});

const port = process.env.PORT || 8001;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

initSocket(io);

io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);
  socket.emit("welcome", { message: "Welcome to finance tracker websocket!" });

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });
});

app.set("io", io);

server.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});