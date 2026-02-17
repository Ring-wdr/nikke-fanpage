import Link from "next/link";
import Image from "next/image";
import { getRecentReviews } from "@/lib/reviewData";

export const revalidate = 3600;

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

function Stars({ count }: { count: number }) {
  return (
    <span className="leading-none text-sm">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < count ? "text-yellow-400" : "text-slate-600"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewBody({ content }: { content: string }) {
  const preview = content.length > 240 ? `${content.slice(0, 240)}…` : content;
  return <p className="mt-2 text-sm text-slate-200 whitespace-pre-line">{preview}</p>;
}

export default async function RecentReviewsPage() {
  const reviews = await getRecentReviews(50);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-950/85 p-4">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Global Activity
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Recent Reviews</h1>
        <p className="mt-2 text-sm text-slate-300">
          Newest {reviews.length} review{reviews.length === 1 ? "" : "s"} from the last updates.
        </p>
      </header>

      {reviews.length === 0 ? (
        <section className="rounded-2xl border border-slate-700/60 bg-slate-950/65 p-6 text-sm text-slate-300">
          <p>No recent reviews yet.</p>
          <p className="mt-2 text-slate-400">
            Go to a character page and post the first review.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4 shadow-[0_0_30px_rgba(8,145,178,0.13)]"
            >
              <div className="flex items-start gap-3">
                <Image
                  src={review.smallImageUrl}
                  alt={review.characterName}
                  width={review.smallImageWidth}
                  height={review.smallImageHeight}
                  className="h-12 w-12 rounded-lg border border-cyan-300/20 bg-slate-900 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/${review.characterSlug}`}
                      className="text-sm font-semibold text-cyan-100 hover:underline"
                    >
                      {review.characterName}
                    </Link>
                    <span className="text-xs text-slate-400">({review.characterSlug})</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-500">{timeAgo(new Date(review.createdAt))}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars count={review.rating} />
                    <span className="text-xs text-slate-400">
                      by {review.nickname || "Anonymous"}
                    </span>
                  </div>
                  <ReviewBody content={review.content} />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
