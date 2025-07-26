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

  // Users - hash wachtwoorden en gebruik upsert
  for (const user of users) {
    try {
      if ("password2" in user) delete user.password2;
      if (!user.password) throw new Error("User missing password");

      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;

      console.log("Upserting user:", user.username);
      await prisma.user.upsert({
        where: { username: user.username }, // gebruik username (uniek) ipv email
        update: {},
        create: user,
      });
    } catch (err) {
      console.error(`Error upserting user ${user.username}:`, err.message);
    }
  }

  // Hosts - gebruik upsert op basis van id
  for (const host of hosts) {
    try {
      if ("aboutMe" in host) {
        host.about = host.aboutMe;
        delete host.aboutMe;
      }

      console.log("Upserting host:", host.name || host.id);
      await prisma.host.upsert({
        where: { id: host.id },
        update: {},
        create: host,
      });
    } catch (err) {
      console.error("Error upserting host:", err.message);
    }
  }

  // Properties - upsert per id
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

      console.log("Upserting property:", fixedProperty.title);
      await prisma.property.upsert({
        where: { id: fixedProperty.id },
        update: {},
        create: fixedProperty,
      });
    } catch (err) {
      console.error("Error upserting property:", err.message);
    }
  }

  // Bookings – alleen maken als ID niet bestaat
  for (const booking of bookings) {
    try {
      const fixedBooking = {
        ...booking,
        checkIn: booking.checkinDate
          ? new Date(booking.checkinDate)
          : new Date(booking.checkIn),
        checkOut: booking.checkoutDate
          ? new Date(booking.checkoutDate)
          : new Date(booking.checkOut),
      };

      delete fixedBooking.checkinDate;
      delete fixedBooking.checkoutDate;

      if (!fixedBooking.userId || !fixedBooking.propertyId) {
        throw new Error("Booking missing userId or propertyId");
      }

      const existing = await prisma.booking.findUnique({
        where: { id: fixedBooking.id },
      });

      if (!existing) {
        console.log("Creating booking for userId:", fixedBooking.userId);
        await prisma.booking.create({ data: fixedBooking });
      } else {
        console.log("Booking already exists, skipping:", fixedBooking.id);
      }
    } catch (err) {
      console.error("Error creating booking:", err.message);
    }
  }

  // Reviews – idem: alleen aanmaken als ID nog niet bestaat
  for (const review of reviews) {
    try {
      if (!review.userId || !review.propertyId || !review.rating) {
        throw new Error("Review missing required fields");
      }

      const exists = await prisma.review.findUnique({
        where: { id: review.id },
      });

      if (!exists) {
        console.log("Creating review by userId:", review.userId);
        await prisma.review.create({ data: review });
      } else {
        console.log("Review already exists, skipping:", review.id);
      }
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
