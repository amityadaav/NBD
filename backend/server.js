
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const { dbConnection } = require("./config/database");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Database connection
dbConnection();

// Routes
const authRoutes = require("./Routes/authRoutes");
const hospitalRoutes = require("./Routes/hospitalRoutes");

app.use("/api", authRoutes);
app.use("/api/hospitals", hospitalRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Server Running");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, (error) => {
  if (error) throw error;

  console.log(`Server running on port no ${PORT}`);
});
