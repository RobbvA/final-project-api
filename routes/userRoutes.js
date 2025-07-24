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

// GEEN authenticatie vereist
router.get("/", asyncHandler(getAllUsers)); // GET /api/users
router.get("/:id", asyncHandler(getUserById)); // GET /api/users/:id

// AUTHENTICATIE vereist
router.post("/", authenticateToken, asyncHandler(createUser));
router.put("/:id", authenticateToken, asyncHandler(updateUser));
router.delete("/:id", authenticateToken, asyncHandler(deleteUser));

export default router;
