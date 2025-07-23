// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // eventueel opslaan van user info
    next(); // doorgaan naar de route
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
