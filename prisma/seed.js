import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, "../src/data");

  const usersData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "users.json"), "utf-8")
  );
  const hostsData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "hosts.json"), "utf-8")
  );
  const propertiesData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "properties.json"), "utf-8")
  );
  const bookingsData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "bookings.json"), "utf-8")
  );
  const reviewsData = JSON.parse(
    fs.readFileSync(path.join(dataPath, "reviews.json"), "utf-8")
  );

  const users = usersData.users;
  const hosts = hostsData.hosts;
  const properties = propertiesData.properties;
  const bookings = bookingsData.bookings;
  const reviews = reviewsData.reviews;

  // Users - hash wachtwoorden voordat je ze toevoegt
  for (const user of users) {
    try {
      if ("password2" in user) {
        delete user.password2;
      }

      if (!user.password) {
        throw new Error("User missing password");
      }

      user.password = await bcrypt.hash(user.password, 10);

      console.log("Creating user:", user.username);
      await prisma.user.create({ data: user });
    } catch (err) {
      console.error(`Error creating user ${user.username}:`, err.message);
    }
  }

  // Hosts
  for (const host of hosts) {
    try {
      if ("aboutMe" in host) {
        host.about = host.aboutMe;
        delete host.aboutMe;
      }
      console.log("Creating host:", host.name || host.id);
      await prisma.host.create({ data: host });
    } catch (err) {
      console.error("Error creating host:", err.message);
    }
  }

  // Properties
  for (const property of properties) {
    try {
      const fixedProperty = {
        ...property,
        bedrooms: property.bedroomCount,
        bathrooms: property.bathRoomCount,
        maxGuests: property.maxGuestCount,
      };

      delete fixedProperty.bedroomCount;
      delete fixedProperty.bathRoomCount;
      delete fixedProperty.maxGuestCount;

      console.log("Creating property:", fixedProperty.title);
      await prisma.property.create({ data: fixedProperty });
    } catch (err) {
      console.error("Error creating property:", err.message);
    }
  }

  // Bookings
  for (const booking of bookings) {
    try {
      const fixedBooking = {
        ...booking,
        checkIn: booking.checkinDate ? new Date(booking.checkinDate) : null,
        checkOut: booking.checkoutDate ? new Date(booking.checkoutDate) : null,
      };

      delete fixedBooking.checkinDate;
      delete fixedBooking.checkoutDate;

      // Zorg dat verplichte velden bestaan, anders skip
      if (!fixedBooking.userId || !fixedBooking.propertyId) {
        throw new Error("Booking missing userId or propertyId");
      }

      console.log("Creating booking for userId:", fixedBooking.userId);
      await prisma.booking.create({ data: fixedBooking });
    } catch (err) {
      console.error("Error creating booking:", err.message);
    }
  }

  // Reviews
  for (const review of reviews) {
    try {
      // Controleer verplichte velden
      if (!review.userId || !review.propertyId || !review.rating) {
        throw new Error("Review missing required fields");
      }

      console.log("Creating review by userId:", review.userId);
      await prisma.review.create({ data: review });
    } catch (err) {
      console.error("Error creating review:", err.message);
    }
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
