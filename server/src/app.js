require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboard.routes");
const agentsRoutes = require("./routes/agents.routes");
const vehiclesRoutes = require("./routes/vehicles.routes");

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://guineeroute.netlify.app"
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "GuinéeRoute API is running",
  });
});

// Routes
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/agents", agentsRoutes);
app.use("/api/v1/vehicles", vehiclesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`GuinéeRoute API listening on port ${PORT}`);
});
