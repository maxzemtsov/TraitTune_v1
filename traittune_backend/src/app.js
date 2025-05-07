require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const cors = require("cors"); // For handling Cross-Origin Resource Sharing
const cronService = require("./services/cron_service/cron_service");
const chatRoutes = require("./routes/chatRoutes"); // Import chat routes
const assessmentRoutes = require("./routes/assessmentRoutes"); // Import assessment routes

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes - configure appropriately for production
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Initialize Cron Jobs
cronService.initializeCronJobs();

// API Routes
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "UP", message: "TraitTune Backend is running." });
});

// Mount chat routes
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/assessment", assessmentRoutes); // Mount assessment routes

// TODO: Add other routes for user management, reports, etc.
// Example:
// const userRoutes = require("./routes/userRoutes");
// app.use("/api/v1/users", userRoutes);
// const reportRoutes = require("./routes/reportRoutes");
// app.use("/api/v1/reports", reportRoutes);

// Global error handler (basic example)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred.",
    // Optionally include stack trace in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start the server
if (process.env.NODE_ENV !== "test") { // Avoid starting server during tests if any
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TraitTune Backend Server listening on 0.0.0.0:${PORT}`);
  });
}

module.exports = app; // For potential testing or programmatic use

