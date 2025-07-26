import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Alle hosts ophalen, zonder wachtwoord
export async function getAllHosts(req, res) {
  const { name } = req.query;

  try {
    const where = {};

    if (name) {
      where.name = {
        contains: name,
        // mode: "insensitive" // activeren als ondersteund
      };
    }

    const hosts = await prisma.host.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
        about: true,
      },
    });

    res.status(200).json(hosts);
  } catch (error) {
    console.error("Error fetching hosts:", error);
    res.status(500).json({ error: "Failed to fetch hosts" });
  }
}

// 1 host ophalen op id, zonder wachtwoord
export async function getHostById(req, res) {
  const id = req.params.id;

  try {
    const host = await prisma.host.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
        about: true,
      },
    });

    if (!host) {
      return res.status(404).json({ error: "Host not found" });
    }

    res.json(host);
  } catch (error) {
    console.error("Error fetching host:", error);
    res.status(500).json({ error: "Failed to fetch host" });
  }
}

// Nieuwe host aanmaken met gehasht password
export async function createHost(req, res) {
  const {
    username,
    password,
    name,
    email,
    phoneNumber,
    profilePicture,
    about,
  } = req.body;

  try {
    if (!username || !password || !name || !email) {
      return res
        .status(400)
        .json({ error: "Username, password, name en email zijn verplicht" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const host = await prisma.host.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email,
        phoneNumber,
        profilePicture,
        about,
      },
    });

    const { password: _, ...hostWithoutPassword } = host;
    res.status(201).json(hostWithoutPassword);
  } catch (error) {
    console.error("Error creating host:", error);

    // Bijvoorbeeld unique constraint op username of email checken
    if (
      error.code === "P2002" &&
      error.meta?.target?.some((field) => ["username", "email"].includes(field))
    ) {
      return res.status(409).json({ error: "Username of email bestaat al" });
    }

    res.status(500).json({ error: "Failed to create host" });
  }
}

// Host updaten (geen password update via deze route)
export async function updateHost(req, res) {
  const id = req.params.id;
  const updateData = { ...req.body };

  // Verwijder password als dat meegestuurd wordt
  if ("password" in updateData) {
    delete updateData.password;
  }

  // Zet aboutMe om naar about (indien aanwezig)
  if ("aboutMe" in updateData) {
    updateData.about = updateData.aboutMe;
    delete updateData.aboutMe;
  }

  try {
    const updatedHost = await prisma.host.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
        about: true,
      },
    });

    res.json(updatedHost);
  } catch (error) {
    console.error("Error updating host:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Host not found" });
    }

    res.status(500).json({ error: "Failed to update host" });
  }
}

// Host verwijderen
export async function deleteHost(req, res) {
  const id = req.params.id;

  try {
    await prisma.host.delete({ where: { id } });
    res.json({ message: "Host deleted" });
  } catch (error) {
    console.error("Error deleting host:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Host not found" });
    }

    res.status(500).json({ error: "Failed to delete host" });
  }
}
