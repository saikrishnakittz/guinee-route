require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboard.routes");
const agentsRoutes = require("./routes/agents.routes");
const vehiclesRoutes = require("./routes/vehicles.routes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  }),
);
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`GuinéeRoute API running on http://localhost:${PORT}`);
});
