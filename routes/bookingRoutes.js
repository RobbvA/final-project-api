// routes/bookingRoutes.js
import express from "express";
import asyncHandler from "express-async-handler";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../services/bookingService.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", asyncHandler(getAllBookings)); // Openbaar
router.get("/:id", asyncHandler(getBookingById)); // Openbaar

router.post("/", authenticateToken, asyncHandler(createBooking));
router.put("/:id", authenticateToken, asyncHandler(updateBooking));
router.delete("/:id", authenticateToken, asyncHandler(deleteBooking));

export default router;
