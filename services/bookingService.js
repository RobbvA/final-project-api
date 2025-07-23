import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /bookings - alle boekingen ophalen of filteren op userId
export async function getAllBookings(req, res) {
  const { userId } = req.query;

  try {
    const bookings = await prisma.booking.findMany({
      where: userId ? { userId } : undefined,
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
}

// GET /bookings/:id - boeking ophalen op id
export async function getBookingById(req, res) {
  const id = req.params.id;
  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
}

// POST /bookings - nieuwe boeking aanmaken
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
    const booking = await prisma.booking.create({
      data: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        numberOfGuests,
        totalPrice,
        bookingStatus,
        userId,
        propertyId,
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
}

// PUT /bookings/:id - boeking updaten
export async function updateBooking(req, res) {
  const id = req.params.id;
  const updateData = req.body;

  try {
    if (updateData.checkIn) updateData.checkIn = new Date(updateData.checkIn);
    if (updateData.checkOut)
      updateData.checkOut = new Date(updateData.checkOut);

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: "Failed to update booking" });
  }
}

// DELETE /bookings/:id - boeking verwijderen
export async function deleteBooking(req, res) {
  const id = req.params.id;
  try {
    await prisma.booking.delete({ where: { id } });
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
}
