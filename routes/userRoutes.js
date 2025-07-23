// routes/userRoutes.js
import express from "express";
import asyncHandler from "express-async-handler";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ GET-routes ZONDER authenticatie
router.get("/", asyncHandler(getAllUsers)); // GET /api/users
router.get("/:id", asyncHandler(getUserById)); // GET /api/users/:id

// ✅ POST, PUT, DELETE routes MET authenticatie
router.post("/", authenticateToken, asyncHandler(createUser)); // POST /api/users
router.put("/:id", authenticateToken, asyncHandler(updateUser)); // PUT /api/users/:id
router.delete("/:id", authenticateToken, asyncHandler(deleteUser)); // DELETE /api/users/:id

export default router;
