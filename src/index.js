import express from "express";
import dotenv from "dotenv";
dotenv.config();

import * as Sentry from "@sentry/node";

// Importeer routes
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import hostRoutes from "../routes/hostRoutes.js";
import propertyRoutes from "../routes/propertyRoutes.js";
import bookingRoutes from "../routes/bookingRoutes.js";
import reviewRoutes from "../routes/reviewRoutes.js";

// Importeer middleware
import { requestLogger } from "../middleware/logger.js";
import { errorHandler } from "../middleware/errorHandler.js";

// Initialiseer Sentry met DSN uit .env
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  tracesSampleRate: 1.0,
});

const app = express();

// Sentry request handler
app.use(Sentry.Handlers.requestHandler());

// Middleware om JSON te parsen
app.use(express.json());

// Logging middleware voor alle requests
app.use(requestLogger);

// Route om 404 voor favicon.ico te voorkomen
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Sentry test route om foutmelding te triggeren
app.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

// API routes
app.use("/login", authRoutes);
app.use("/users", userRoutes);
app.use("/hosts", hostRoutes);
app.use("/properties", propertyRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.send("Hello world!");
});

// Sentry eigen error handler
app.use(Sentry.Handlers.errorHandler());

// Eigen error handler middleware
app.use(errorHandler);

// Start de server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
