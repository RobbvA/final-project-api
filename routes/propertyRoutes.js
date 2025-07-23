// routes/propertyRoutes.js
import express from "express";
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../services/propertyService.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Openbare GET routes
router.get("/", getAllProperties); // GET /api/properties
router.get("/:id", getPropertyById); // GET /api/properties/:id

// Beveiligde routes met JWT middleware
router.post("/", authenticateToken, createProperty); // POST /api/properties
router.put("/:id", authenticateToken, updateProperty); // PUT /api/properties/:id
router.delete("/:id", authenticateToken, deleteProperty); // DELETE /api/properties/:id

export default router;
