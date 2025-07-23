// routes/reviewRoutes.js
import express from "express";
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../services/reviewService.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllReviews); // GET /api/reviews (openbaar)
router.get("/:id", getReviewById); // GET /api/reviews/:id (openbaar)

// Beveiligde routes
router.post("/", authenticateToken, createReview); // POST /api/reviews
router.put("/:id", authenticateToken, updateReview); // PUT /api/reviews/:id
router.delete("/:id", authenticateToken, deleteReview); // DELETE /api/reviews/:id

export default router;
