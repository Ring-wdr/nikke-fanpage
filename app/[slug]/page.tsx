import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getCharacterBySlug,
  getCharacterDetailBySlug,
  getCharacterSlugs,
  type CharacterSummary,
} from "@/lib/characterData";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

function parseRichText(raw?: string | null): string {
  if (!raw) return "";
  try {
    const doc = JSON.parse(raw) as {
      content?: Array<{
        nodeType?: string;
        content?: Array<{
          nodeType?: string;
          value?: string;
          content?: unknown[];
        }>;
      }>;
    };
    const toText = (node: any): string => {
      if (!node || typeof node !== "object") return "";

      if (node.nodeType === "text" && typeof node.value === "string") {
        return node.value;
      }

      if (Array.isArray(node.content)) {
        return node.content.map(toText).join("");
      }

      return "";
    };

    const lines = (doc?.content ?? []).flatMap((node: any) => {
      const text = toText(node).trim();
      return text ? [text] : [];
    });
    return lines.join("\n\n");
  } catch {
    return raw;
  }
}

function renderSkills(character: CharacterSummary) {
  const detailSkills = character.skillsWithDetail ?? [];
  const skillsToRender = detailSkills.length > 0 ? detailSkills : character.skills;

  if (skillsToRender.length === 0) {
    return <p className="text-slate-300">No skills registered.</p>;
  }

  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {skillsToRender.map((skill) => (
        <li key={skill.slot} className="rounded-lg border border-cyan-400/25 bg-slate-900/70 p-3">
          <p className="text-sm font-semibold text-cyan-200">
            {skill.name ?? skill.slot} <span className="text-xs text-slate-400">({skill.slot})</span>
          </p>
          <p className="text-xs text-slate-200">
            {skill.type} · {skill.cooldown === null ? "Passive" : `${skill.cooldown}s`}
          </p>
          {skill.descriptionRaw && <p className="mt-2 text-xs text-slate-300 whitespace-pre-line">{parseRichText(skill.descriptionRaw)}</p>}
        </li>
      ))}
    </ul>
  );
}

export async function generateStaticParams() {
  const slugs = await getCharacterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function CharacterDetailPage({ params }: Params) {
  const { slug } = await params;
  const character = await getCharacterBySlug(slug);
  const detailedCharacter = await getCharacterDetailBySlug(slug);

  if (!character) {
    notFound();
  }

  const detailEnabled = Boolean(detailedCharacter);
  const detailCharacter: CharacterSummary = detailEnabled && detailedCharacter ? detailedCharacter : character;
  const isDetailFallback = !detailEnabled;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex text-sm text-cyan-300 underline underline-offset-4">
        ← Back to list
      </Link>

      <p className={`mt-2 text-xs ${isDetailFallback ? "text-amber-300" : "text-emerald-300"}`}>
        {isDetailFallback ? "Using base character data (detail fetch failed)." : "Detail data loaded."}
      </p>

      <section className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr]">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4">
          <Image
            src={detailCharacter.smallImageUrl}
            alt={detailCharacter.name}
            width={detailCharacter.smallImageWidth}
            height={detailCharacter.smallImageHeight}
            className="h-40 w-40 rounded-xl border border-cyan-300/20 object-cover"
          />
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
          <h1 className="text-3xl font-black text-cyan-100">{detailCharacter.name}</h1>
          <p className="mt-1 text-sm uppercase tracking-wide text-slate-400">{detailCharacter.slug}</p>
          <dl className="mt-4 space-y-2 text-sm text-slate-100">
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Rarity</dt>
              <dd>{detailCharacter.rarity}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Element</dt>
              <dd>{detailCharacter.element}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Weapon</dt>
              <dd>{detailCharacter.weapon}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Class</dt>
              <dd>{detailCharacter.role}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Manufacturer</dt>
              <dd>{detailCharacter.manufacturer}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Squad</dt>
              <dd>{detailCharacter.squad}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Burst Type</dt>
              <dd>{detailCharacter.burstType}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Limited</dt>
              <dd>{detailCharacter.isLimited === null ? "Unknown" : detailCharacter.isLimited ? "Yes" : "No"}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Release</dt>
              <dd>{detailCharacter.releaseDate ?? "Unknown"}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Event</dt>
              <dd>{detailCharacter.limitedEvent ?? "None"}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Weapon Name</dt>
              <dd>{detailCharacter.weaponName ?? "N/A"}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Ammo / Reload</dt>
              <dd>
                {detailCharacter.ammoCapacity ?? "-"} / {detailCharacter.reloadTime ?? "-"}s
              </dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Control</dt>
              <dd>{detailCharacter.controlMode ?? "N/A"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
        <h2 className="text-xl font-bold text-cyan-200">Backstory</h2>
        <p className="mt-3 text-sm text-slate-100">{detailCharacter.backstory ?? "No backstory data."}</p>
        {detailCharacter.cv && (
          <div className="mt-4 text-sm text-slate-100">
            <p className="text-cyan-200">CV</p>
            <p>EN: {detailCharacter.cv.en ?? "-"}</p>
            <p>JP: {detailCharacter.cv.jpn ?? "-"}</p>
            <p>KR: {detailCharacter.cv.kr ?? "-"}</p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
        <h2 className="text-xl font-bold text-cyan-200">Card Art</h2>
        {detailCharacter.fullImageUrl ? (
          <Image
            src={detailCharacter.fullImageUrl}
            alt={`${detailCharacter.name} full`}
            width={detailCharacter.fullImageWidth ?? detailCharacter.cardImageWidth}
            height={detailCharacter.fullImageHeight ?? detailCharacter.cardImageHeight}
            className="mt-4 h-auto max-w-[320px] rounded-xl border border-cyan-300/20"
          />
        ) : (
          <Image
            src={detailCharacter.cardImageUrl}
            alt={`${detailCharacter.name} card`}
            width={detailCharacter.cardImageWidth}
            height={detailCharacter.cardImageHeight}
            className="mt-4 h-auto max-w-xs rounded-xl border border-cyan-300/20"
          />
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
        <h2 className="text-xl font-bold text-cyan-200">Combat Notes</h2>
        <p className="mt-3 text-sm text-slate-100 whitespace-pre-line">
          {parseRichText(detailCharacter.basicAttackRaw) || "No basic attack details."}
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
        <h2 className="text-xl font-bold text-cyan-200">Harmony Cubes</h2>
        <p className="mt-3 text-sm text-slate-100 whitespace-pre-line">
          {parseRichText(detailCharacter.harmonyCubesRaw) || "No cube bonus details."}
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
        <h2 className="text-xl font-bold text-cyan-200">Skills</h2>
        {renderSkills(detailCharacter)}
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
        <h2 className="text-xl font-bold text-cyan-200">Review</h2>
        <p className="mt-3 text-sm text-slate-100 whitespace-pre-line">
          {parseRichText(detailCharacter.reviewRaw) || "No review data."}
        </p>
      </section>
    </main>
  );
}
