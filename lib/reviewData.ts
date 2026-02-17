import { desc, eq, avg, count } from "drizzle-orm";
import { db } from "./db";
import { characters, reviews, type NewReview, type Review } from "./schema";

export async function getReviewsBySlug(slug: string): Promise<Review[]> {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.characterSlug, slug))
    .orderBy(desc(reviews.createdAt));
}

export async function getAverageRating(
  slug: string,
): Promise<{ average: number; count: number }> {
  const [row] = await db
    .select({
      average: avg(reviews.rating),
      count: count(),
    })
    .from(reviews)
    .where(eq(reviews.characterSlug, slug));

  return {
    average: row?.average ? parseFloat(row.average) : 0,
    count: row?.count ?? 0,
  };
}

export async function createReview(
  data: Omit<NewReview, "id" | "createdAt">,
): Promise<Review> {
  const [inserted] = await db.insert(reviews).values(data).returning();
  return inserted;
}

export type RecentReview = {
  id: number;
  characterSlug: string;
  characterName: string;
  smallImageUrl: string;
  smallImageWidth: number;
  smallImageHeight: number;
  nickname: string | null;
  rating: number;
  content: string;
  createdAt: Date;
};

export async function getRecentReviews(limit = 50): Promise<RecentReview[]> {
  const normalizedLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  const rows = await db
    .select({
      id: reviews.id,
      characterSlug: reviews.characterSlug,
      characterName: characters.name,
      smallImageUrl: characters.smallImageUrl,
      smallImageWidth: characters.smallImageWidth,
      smallImageHeight: characters.smallImageHeight,
      nickname: reviews.nickname,
      rating: reviews.rating,
      content: reviews.content,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(characters, eq(reviews.characterSlug, characters.slug))
    .orderBy(desc(reviews.createdAt))
    .limit(normalizedLimit);

  return rows.map((row) => ({
    id: row.id,
    characterSlug: row.characterSlug,
    characterName: row.characterName,
    smallImageUrl: row.smallImageUrl,
    smallImageWidth: row.smallImageWidth,
    smallImageHeight: row.smallImageHeight,
    nickname: row.nickname,
    rating: row.rating,
    content: row.content,
    createdAt: row.createdAt,
  }));
}
