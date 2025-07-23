// routes/hostRoutes.js
import express from "express";
import {
  getAllHosts,
  getHostById,
  createHost,
  updateHost,
  deleteHost,
} from "../services/hostService.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET routes zijn publiek toegankelijk
router.get("/", getAllHosts); // GET /api/hosts
router.get("/:id", getHostById); // GET /api/hosts/:id

// POST, PUT, DELETE routes beschermd met JWT
router.post("/", authenticateToken, createHost); // POST /api/hosts
router.put("/:id", authenticateToken, updateHost); // PUT /api/hosts/:id
router.delete("/:id", authenticateToken, deleteHost); // DELETE /api/hosts/:id

export default router;
