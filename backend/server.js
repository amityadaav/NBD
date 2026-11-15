
const dotenv = require("dotenv");
dotenv.config(); // must run before anything that reads process.env

const express = require("express");
const cors = require("cors");
const path = require("path");

const { dbConnection } = require("./config/database");

const app = express();
app.set("trust proxy", 1);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static PUBLIC uploads only (logos, photos).
// private_uploads is intentionally NOT served; documents go through the
// protected /api/admin/hospitals/:id/document endpoint.
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---------- Public / user routes ----------
app.use("/api", require("./Routes/authRoutes"));
app.use("/api/user", require("./Routes/userRoutes")); 
app.use("/api/hospitals", require("./Routes/hospitalRoutes"));
app.use("/api/appointments", require("./Routes/AppointmentRoutes"));
app.use("/api/doctors", require("./Routes/DoctorRoutes"));



app.use("/api", require("./Routes/supportTicketRoutes"));
// ---------- Hospital admin ----------
app.use("/api/hospital-admin", require("./Routes/HospitalAdminRoutes"));
app.use("/api/hospital-admin", require("./Routes/HospitalAdminManageRoutes"));
app.use("/api/hospital-admin/prescriptions",require("./Routes/HospitalAdminPrescriptionRoutes"));
// ---------- Admin routes ----------
app.use("/api/admin/hospitals", require("./Routes/AdminHospitalRoutes"));
app.use("/api/admin/appointments", require("./Routes/AdminAppointmentRoutes"));
app.use("/api/admin/doctors", require("./Routes/AdminDoctorRoutes"));
app.use("/api/admin/patients", require("./Routes/adminPatientRoutes"));
app.use("/api/admin", require("./Routes/AdminRoutes"));
app.use("/api/settings", require("./Routes/settingsRoutes"));

// server.js (add to your existing router mounts)
const donorRoutes          = require("./Routes/donorRoutes");
const bloodRequestRoutes   = require("./Routes/bloodRequestRoutes");
const bloodStatsRoutes     = require("./Routes/bloodStatsRoutes");
const bloodInventoryRoutes = require("./Routes/bloodInventoryRoutes");

app.use("/api/donors",           donorRoutes);
app.use("/api/blood-requests",   bloodRequestRoutes);
app.use("/api/blood-stats",      bloodStatsRoutes);
app.use("/api/blood-inventory",  bloodInventoryRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Server Running");
});

// Start server after database connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnection();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();