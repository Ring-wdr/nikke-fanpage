"use server";

import { revalidatePath } from "next/cache";
import { createReview } from "@/lib/reviewData";

export async function submitReview(formData: FormData) {
  const slug = formData.get("slug") as string;
  const nickname = (formData.get("nickname") as string)?.trim() || null;
  const ratingStr = formData.get("rating") as string;
  const content = (formData.get("content") as string)?.trim();

  // Validate slug
  if (!slug) {
    return { error: "Character slug is required." };
  }

  // Validate rating
  const rating = parseInt(ratingStr, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  // Validate content
  if (!content) {
    return { error: "Review content is required." };
  }
  if (content.length > 1000) {
    return { error: "Review content must be 1000 characters or less." };
  }

  // Validate nickname length
  if (nickname && nickname.length > 50) {
    return { error: "Nickname must be 50 characters or less." };
  }

  await createReview({
    characterSlug: slug,
    nickname,
    rating,
    content,
  });

  revalidatePath(`/${slug}`);
  return { success: true };
}
