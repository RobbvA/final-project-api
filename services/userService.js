// services/userService.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ✅ Alle users ophalen (optioneel gefilterd)
export async function getAllUsers(req, res) {
  const { username, email, name } = req.query;

  try {
    const where = {};
    if (username) where.username = username;
    else if (email) where.email = email;
    else if (name) where.name = { contains: name };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("❌ getAllUsers error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// ✅ Eén user ophalen
export async function getUserById(req, res) {
  const id = req.params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ getUserById error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

// ✅ Nieuwe user aanmaken
export async function createUser(req, res) {
  const { username, password, name, email, phoneNumber, profilePicture } =
    req.body;

  try {
    // Validatie
    if (!username || !password || !name || !email) {
      return res
        .status(400)
        .json({ error: "Username, password, name en email zijn verplicht" });
    }

    // Extra typecheck (optioneel)
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string"
    ) {
      return res.status(400).json({
        error: "Velden moeten strings zijn (username, password, name, email)",
      });
    }

    // Wachtwoord hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nieuwe user aanmaken
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email,
        phoneNumber,
        profilePicture,
      },
    });

    // Wachtwoord verwijderen uit response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("❌ createUser error:", error);

    // Check of het een unique constraint violation is op username
    if (error.code === "P2002" && error.meta?.target?.includes("username")) {
      return res.status(409).json({ error: "Username bestaat al" });
    }

    // Andere errors gewoon doorgeven
    res
      .status(500)
      .json({ error: "Failed to create user", details: error.message });
  }
}

// ✅ User bijwerken
export async function updateUser(req, res) {
  const id = req.params.id;
  const updateData = { ...req.body };

  try {
    // Voorkom wachtwoord update via deze route
    if ("password" in updateData) {
      delete updateData.password;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("❌ updateUser error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(500)
      .json({ error: "Failed to update user", details: error.message });
  }
}

// ✅ User verwijderen
export async function deleteUser(req, res) {
  const id = req.params.id;

  try {
    // Eerst gerelateerde records verwijderen
    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.review.deleteMany({ where: { userId: id } });

    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("❌ deleteUser error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(500)
      .json({ error: "Failed to delete user", details: error.message });
  }
}
