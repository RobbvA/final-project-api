import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /reviews - alle reviews ophalen
export async function getAllReviews(req, res) {
  try {
    const reviews = await prisma.review.findMany();
    res.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
}

// GET /reviews/:id - review ophalen op id
export async function getReviewById(req, res) {
  const id = req.params.id;
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    console.error("Failed to fetch review:", error);
    res.status(500).json({ error: "Failed to fetch review" });
  }
}

// POST /reviews - nieuwe review aanmaken
export async function createReview(req, res) {
  const { rating, comment, userId, propertyId } = req.body;

  // Basale validatie
  if (
    typeof rating !== "number" ||
    rating < 1 ||
    rating > 5 ||
    !comment ||
    !userId ||
    !propertyId
  ) {
    return res.status(400).json({ error: "Invalid review data" });
  }

  try {
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        propertyId,
      },
    });
    res.status(201).json(newReview);
  } catch (error) {
    console.error("Failed to create review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
}

// PUT /reviews/:id - review updaten
export async function updateReview(req, res) {
  const id = req.params.id;
  const { rating, comment } = req.body;

  // Optionele validatie: alleen rating en comment kunnen geüpdatet worden
  const updateData = {};
  if (rating !== undefined) {
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating value" });
    }
    updateData.rating = rating;
  }
  if (comment !== undefined) {
    updateData.comment = comment;
  }

  try {
    // Eerst checken of review bestaat
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Review not found" });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
    });
    res.json(updatedReview);
  } catch (error) {
    console.error("Failed to update review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
}

// DELETE /reviews/:id - review verwijderen
export async function deleteReview(req, res) {
  const id = req.params.id;
  try {
    // Eerst checken of review bestaat
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Review not found" });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Failed to delete review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
}
