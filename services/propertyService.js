//propertyService.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /api/properties
export async function getAllProperties(req, res) {
  try {
    const { location, pricePerNight, maxGuestCount } = req.query;

    const where = {};

    if (location) {
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

    if (maxGuestCount) {
      const parsedMaxGuests = parseInt(maxGuestCount);
      if (!isNaN(parsedMaxGuests)) {
        where.maxGuests = parsedMaxGuests;
      }
    }

    const properties = await prisma.property.findMany({ where });

    // Mappen databasevelden naar testdata-namen
    const mappedProperties = properties.map((prop) => ({
      ...prop,
      maxGuestCount: prop.maxGuests,
      bedroomCount: prop.bedrooms,
      bathRoomCount: prop.bathrooms,
    }));

    res.json(mappedProperties);
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

    // Map ook hier databasevelden naar testdata-namen
    const mappedProperty = {
      ...property,
      maxGuestCount: property.maxGuests,
      bedroomCount: property.bedrooms,
      bathRoomCount: property.bathrooms,
    };

    res.json(mappedProperty);
  } catch (error) {
    console.error("Error in getPropertyById:", error.message);
    console.error(error.stack);
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
    bedroomCount, // uit testdata
    bathRoomCount, // let op spelling!
    maxGuestCount, // uit testdata
    rating,
    hostId,
  } = req.body;

  // Parse en valideer getallen
  const bedrooms = Number.isInteger(bedroomCount)
    ? bedroomCount
    : parseInt(bedroomCount);
  const bathrooms = Number.isInteger(bathRoomCount)
    ? bathRoomCount
    : parseInt(bathRoomCount);
  const maxGuests = Number.isInteger(maxGuestCount)
    ? maxGuestCount
    : parseInt(maxGuestCount);

  if (
    isNaN(bedrooms) ||
    bedrooms < 0 ||
    isNaN(bathrooms) ||
    bathrooms < 0 ||
    isNaN(maxGuests) ||
    maxGuests < 0
  ) {
    return res.status(400).json({
      error: "Bedrooms, bathrooms and maxGuests must be non-negative integers",
    });
  }

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
    console.error("Error in createProperty:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Failed to create property" });
  }
}

// PUT /api/properties/:id
// PUT /api/properties/:id
export async function updateProperty(req, res) {
  const id = req.params.id;

  const {
    title,
    description,
    location,
    pricePerNight,
    bedroomCount,
    bathRoomCount,
    maxGuestCount,
    rating,
    hostId,
  } = req.body;

  // Parse en valideer getallen waar nodig
  let bedrooms, bathrooms, maxGuests;

  if (bedroomCount !== undefined) {
    bedrooms = Number.isInteger(bedroomCount)
      ? bedroomCount
      : parseInt(bedroomCount);
    if (isNaN(bedrooms) || bedrooms < 0) {
      return res
        .status(400)
        .json({ error: "Bedrooms must be a non-negative integer" });
    }
  }

  if (bathRoomCount !== undefined) {
    bathrooms = Number.isInteger(bathRoomCount)
      ? bathRoomCount
      : parseInt(bathRoomCount);
    if (isNaN(bathrooms) || bathrooms < 0) {
      return res
        .status(400)
        .json({ error: "Bathrooms must be a non-negative integer" });
    }
  }

  if (maxGuestCount !== undefined) {
    maxGuests = Number.isInteger(maxGuestCount)
      ? maxGuestCount
      : parseInt(maxGuestCount);
    if (isNaN(maxGuests) || maxGuests < 0) {
      return res
        .status(400)
        .json({ error: "maxGuests must be a non-negative integer" });
    }
  }

  try {
    // Eerst checken of property bestaat
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Property not found" });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(pricePerNight !== undefined && { pricePerNight }),
        ...(bedrooms !== undefined && { bedrooms }),
        ...(bathrooms !== undefined && { bathrooms }),
        ...(maxGuests !== undefined && { maxGuests }),
        ...(rating !== undefined && { rating }),
        ...(hostId !== undefined && { hostId }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error in updateProperty:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Failed to update property" });
  }
}

// DELETE /api/properties/:id
export async function deleteProperty(req, res) {
  const id = req.params.id;

  try {
    // Check of property bestaat
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Eerst gerelateerde bookings en reviews verwijderen
    await prisma.booking.deleteMany({ where: { propertyId: id } });
    await prisma.review.deleteMany({ where: { propertyId: id } });

    // Dan property zelf verwijderen
    await prisma.property.delete({ where: { id } });

    res.json({ message: "Property deleted" });
  } catch (error) {
    console.error("Failed to delete property:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Failed to delete property" });
  }
}
