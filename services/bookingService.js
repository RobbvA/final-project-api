import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /bookings?userId=...
export async function getAllBookings(req, res) {
  const { userId } = req.query;

  try {
    const bookings = await prisma.booking.findMany({
      where: userId ? { userId } : undefined,
    });
    res.json(bookings);
  } catch (error) {
    console.error("❌ Failed to fetch bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
}

// GET /bookings/:id
export async function getBookingById(req, res) {
  const id = req.params.id;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error("❌ Failed to fetch booking:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
}

// POST /bookings
export async function createBooking(req, res) {
  const {
    checkIn,
    checkOut,
    numberOfGuests,
    totalPrice,
    bookingStatus,
    userId,
    propertyId,
  } = req.body;

  try {
    // Minimale verplichte velden
    if (!checkIn || !checkOut || !userId || !propertyId) {
      console.log("❌ Missing required fields:", {
        checkIn,
        checkOut,
        userId,
        propertyId,
      });
      return res.status(400).json({
        error: "checkIn, checkOut, userId en propertyId zijn verplicht",
      });
    }

    // Basis check op UUID-lengte
    function looksLikeUUID(id) {
      return typeof id === "string" && id.length === 36;
    }

    if (!looksLikeUUID(userId) || !looksLikeUUID(propertyId)) {
      console.log("❌ Invalid UUID format:", { userId, propertyId });
      return res
        .status(400)
        .json({ error: "userId en propertyId lijken niet op geldige UUID's" });
    }

    // Check of user en property bestaan
    const [userExists, propertyExists] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.property.findUnique({ where: { id: propertyId } }),
    ]);

    if (!userExists) {
      console.log("❌ User bestaat niet:", userId);
      return res.status(400).json({ error: "User bestaat niet" });
    }
    if (!propertyExists) {
      console.log("❌ Property bestaat niet:", propertyId);
      return res.status(400).json({ error: "Property bestaat niet" });
    }

    // Datumvalidatie
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      console.log("❌ Ongeldige datum:", { checkIn, checkOut });
      return res
        .status(400)
        .json({ error: "checkIn en checkOut moeten geldige datums zijn" });
    }
    if (checkOutDate <= checkInDate) {
      console.log("❌ checkOut moet na checkIn liggen:", {
        checkInDate,
        checkOutDate,
      });
      return res.status(400).json({ error: "checkOut moet na checkIn liggen" });
    }

    // Aanmaken boeking
    const booking = await prisma.booking.create({
      data: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        numberOfGuests: Number(numberOfGuests) || 1,
        totalPrice: Number(totalPrice) || 0,
        bookingStatus: bookingStatus || "confirmed",
        userId,
        propertyId,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({
      error: "Failed to create booking",
      details: error.message,
    });
  }
}

// PUT /bookings/:id
export async function updateBooking(req, res) {
  const id = req.params.id;
  const updateData = { ...req.body };

  try {
    if (updateData.checkinDate) {
      updateData.checkIn = new Date(updateData.checkinDate);
      delete updateData.checkinDate;
    }
    if (updateData.checkoutDate) {
      updateData.checkOut = new Date(updateData.checkoutDate);
      delete updateData.checkoutDate;
    }

    if (updateData.checkIn) updateData.checkIn = new Date(updateData.checkIn);
    if (updateData.checkOut)
      updateData.checkOut = new Date(updateData.checkOut);

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ Update booking error:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
}

// DELETE /bookings/:id
export async function deleteBooking(req, res) {
  const id = req.params.id;

  try {
    await prisma.booking.delete({ where: { id } });
    res.json({ message: "Booking deleted" });
  } catch (error) {
    console.error("❌ Delete booking error:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
}
