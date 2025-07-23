// services/propertyService.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /api/properties
export async function getAllProperties(req, res) {
  try {
    const { location, pricePerNight } = req.query;

    const where = {};

    if (location) {
      // Gebruik exacte invoer, inclusief komma en spaties
      where.location = {
        contains: location,
      };
    }

    if (pricePerNight) {
      const parsedPrice = parseFloat(pricePerNight);
      if (!isNaN(parsedPrice)) {
        where.pricePerNight = parsedPrice;
      }
    }

    const properties = await prisma.property.findMany({ where });

    res.json(properties);
  } catch (error) {
    console.error("Error in getAllProperties:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
}

// GET /api/properties/:id
export async function getPropertyById(req, res) {
  const id = req.params.id;
  try {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    console.error("Error in getPropertyById:", error);
    res.status(500).json({ error: "Failed to fetch property" });
  }
}

// POST /api/properties
export async function createProperty(req, res) {
  const {
    title,
    description,
    location,
    pricePerNight,
    bedrooms,
    bathrooms,
    maxGuests,
    rating,
    hostId,
  } = req.body;

  try {
    const property = await prisma.property.create({
      data: {
        title,
        description,
        location,
        pricePerNight,
        bedrooms,
        bathrooms,
        maxGuests,
        rating,
        hostId,
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("Error in createProperty:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
}

// PUT /api/properties/:id
export async function updateProperty(req, res) {
  const id = req.params.id;
  try {
    const updated = await prisma.property.update({
      where: { id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error("Error in updateProperty:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
}

// DELETE /api/properties/:id
export async function deleteProperty(req, res) {
  const id = req.params.id;
  try {
    // Eerst alle bookings van deze property verwijderen
    await prisma.booking.deleteMany({
      where: { propertyId: id },
    });

    // Daarna alle reviews van deze property verwijderen
    await prisma.review.deleteMany({
      where: { propertyId: id },
    });

    // Dan pas de property zelf verwijderen
    await prisma.property.delete({ where: { id } });

    res.json({ message: "Property deleted" });
  } catch (error) {
    console.error("Failed to delete property:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
}
