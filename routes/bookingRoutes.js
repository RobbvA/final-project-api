// routes/bookingRoutes.js
import express from "express";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../services/bookingService.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllBookings); // GET /api/bookings (openbaar)
router.get("/:id", getBookingById); // GET /api/bookings/:id (openbaar)

// Beveiligde routes
router.post("/", authenticateToken, createBooking); // POST /api/bookings
router.put("/:id", authenticateToken, updateBooking); // PUT /api/bookings/:id
router.delete("/:id", authenticateToken, deleteBooking); // DELETE /api/bookings/:id

export default router;
