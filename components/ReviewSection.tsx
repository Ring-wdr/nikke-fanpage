"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/app/[slug]/actions";
import type { Review } from "@/lib/schema";

type ReviewSectionProps = {
  slug: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
};

function Stars({
  count,
  size = "text-base",
}: {
  count: number;
  size?: string;
}) {
  return (
    <span className={`${size} leading-none`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "text-yellow-400" : "text-slate-600"}>
          ★
        </span>
      ))}
    </span>
  );
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            className={`text-2xl transition-colors ${
              star <= (hover || value) ? "text-yellow-400" : "text-slate-600"
            } hover:text-yellow-300`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function ReviewSection({
  slug,
  reviews,
  averageRating,
  reviewCount,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setError(null);
    formData.set("slug", slug);
    formData.set("rating", String(rating));

    startTransition(async () => {
      const result = await submitReview(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setRating(0);
        // Reset the form by finding the form element
        const form = document.querySelector<HTMLFormElement>("#review-form");
        form?.reset();
      }
    });
  }

  return (
    <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
      <h2 className="text-xl font-bold text-cyan-200">Reviews</h2>

      {/* Average rating */}
      <div className="mt-3 flex items-center gap-3">
        <Stars count={Math.round(averageRating)} size="text-lg" />
        <span className="text-sm text-slate-300">
          {reviewCount > 0
            ? `${averageRating.toFixed(1)} average · ${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
            : "No reviews yet"}
        </span>
      </div>

      {/* Review form */}
      <form
        id="review-form"
        action={handleSubmit}
        className="mt-5 space-y-3 rounded-lg border border-cyan-400/15 bg-slate-900/60 p-4"
      >
        <p className="text-sm font-semibold text-cyan-100">Write a review</p>

        <div>
          <label htmlFor="nickname" className="block text-xs text-slate-400">
            Nickname (optional)
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            maxLength={50}
            placeholder="Anonymous"
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="block text-xs text-slate-400">Rating</span>
          <StarInput value={rating} onChange={setRating} />
        </div>

        <div>
          <label htmlFor="content" className="block text-xs text-slate-400">
            Review
          </label>
          <textarea
            id="content"
            name="content"
            required
            maxLength={1000}
            rows={3}
            placeholder="Share your thoughts about this character..."
            className="mt-1 w-full resize-y rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-cyan-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {/* Review list */}
      {reviews.length > 0 && (
        <ul className="mt-5 space-y-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-lg border border-cyan-400/15 bg-slate-900/40 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-cyan-100">
                  {review.nickname || "Anonymous"}
                </span>
                <span className="text-xs text-slate-500">
                  {timeAgo(new Date(review.createdAt))}
                </span>
              </div>
              <Stars count={review.rating} size="text-sm" />
              <p className="mt-1 text-sm text-slate-200 whitespace-pre-line">
                {review.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
