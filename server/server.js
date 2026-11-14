
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Goodluck Shoemart Backend Running!");
});

// Payment routes
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Goodluck Backend Running on Port ${PORT}`);
  });
};

startServer();
