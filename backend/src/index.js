require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") }); // Adjusted path for .env
const express = require("express");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/authRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Import the data service and its initialization promise
const { dataInitializationPromise, getCacheStatus } = require("./services/assessmentDataService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/chat", chatRoutes);

// Basic root route for health check or welcome message
app.get("/", (req, res) => {
    res.send("TraitTune Backend API is running.");
});

// Route to check cache status (for debugging/monitoring)
app.get("/api/cache-status", (req, res) => {
    // Basic protection for this route, consider proper admin auth for production
    if (req.query.secret !== process.env.ADMIN_SECRET_KEY) { // Add ADMIN_SECRET_KEY to .env
        return res.status(403).send("Forbidden");
    }
    res.json(getCacheStatus());
});

const PORT = process.env.PORT || 3000;

// Start the server only after data initialization is complete (or attempted)
const startServer = async () => {
    try {
        await dataInitializationPromise; // Wait for the cache to be populated
        console.log("Data initialization complete. Cache is ready (or load attempt finished).");
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Supabase URL (from env): ${process.env.SUPABASE_URL}`);
            console.log(`Supabase Service Role Key Loaded: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "Yes" : "No"}`);
            console.log(`OpenAI API Key Loaded: ${process.env.OPENAI_API_KEY ? "Yes" : "No"}`);
            console.log(`Supabase JWT Secret Loaded: ${process.env.SUPABASE_JWT_SECRET ? "Yes" : "No"}`);
        });
    } catch (error) {
        console.error("Failed to initialize data or start server:", error);
        process.exit(1); // Exit if server can't start due to critical data issues
    }
};

startServer();

module.exports = app; // For potential testing or programmatic use

