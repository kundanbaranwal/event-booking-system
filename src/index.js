const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Production optimizations
app.disable("x-powered-by"); // Hide Express frame hint for security

// Middleware
app.use(cors());
app.use(express.json());

// Load Swagger document
const swaggerDocument = require("./docs/swagger.json");

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const userRoutes = require("./routes/users");

app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

// Basic health check route
app.get("/", (req, res) => {
  res.json({
    message: "Mini Event Management API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
});

// Start Server
const server = app.listen(port, () => {
  console.log(
    `Server is running on port ${port} in ${process.env.NODE_ENV || "development"} mode`,
  );
  console.log(
    `Swagger documentation available at http://localhost:${port}/api-docs`,
  );
});

// Graceful shutdown handling
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
  console.log("Received kill signal, shutting down gracefully...");
  server.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
}
