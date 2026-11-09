
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

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



app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
// Routes
const authRoutes = require("./Routes/authRoutes");
const hospitalRoutes = require("./Routes/hospitalRoutes");
const appointmentRoutes = require("./Routes/AppointmentRoutes");
const doctorRoutes = require("./Routes/DoctorRoutes");
const adminRoutes = require("./Routes/AdminRoutes");
const adminHospitalRoutes = require("./Routes/AdminHospitalRoutes");
const adminDoctorRoutes = require("./Routes/AdminDoctorRoutes");




app.use("/api", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/hospitals", adminHospitalRoutes);
app.use("/api/admin/doctors", adminDoctorRoutes);

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
