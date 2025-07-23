import express from "express";
import asyncHandler from "express-async-handler";
import { loginUser } from "../services/authService.js";

const router = express.Router();

router.post("/login", asyncHandler(loginUser));

export default router;
