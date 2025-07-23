// services/userService.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Haal alle users op, met optionele query filters (username, email of name), zonder wachtwoord
export async function getAllUsers(req, res) {
  const { username, email, name } = req.query;

  try {
    let where = {};

    if (username) {
      where.username = username;
    } else if (email) {
      where.email = email;
    } else if (name) {
      where.name = {
        contains: name, // zoekt ook op gedeeltelijke naam
        // mode: "insensitive" // SQLite ondersteunt dit niet, dus laten we het weg
      };
    }

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
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// Haal 1 user op met id, zonder wachtwoord
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
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

// Nieuwe user aanmaken (wachtwoord wordt gehashed)
export async function createUser(req, res) {
  const { username, password, name, email, phoneNumber, profilePicture } =
    req.body;

  try {
    // Hash het wachtwoord
    const hashedPassword = await bcrypt.hash(password, 10);

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

    // Return zonder password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
}

// User updaten
export async function updateUser(req, res) {
  const id = req.params.id;
  const updateData = req.body;

  try {
    // Wachtwoord updaten niet via deze route
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
    res.status(500).json({ error: "Failed to update user" });
  }
}

// User verwijderen
export async function deleteUser(req, res) {
  const id = req.params.id;

  try {
    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.review.deleteMany({ where: { userId: id } });

    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}
