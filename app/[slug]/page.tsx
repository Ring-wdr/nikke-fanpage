import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCharacterBySlug, getCharacterSlugs, type CharacterSummary } from "@/lib/characterData";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

function renderSkills(character: CharacterSummary) {
  if (character.skills.length === 0) {
    return <p className="text-slate-300">No skills registered.</p>;
  }

  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {character.skills.map((skill) => (
        <li key={skill.slot} className="rounded-lg border border-cyan-400/25 bg-slate-900/70 p-3">
          <p className="text-sm font-semibold text-cyan-200">{skill.slot}</p>
          <p className="text-xs text-slate-200">{skill.type}</p>
          <p className="text-xs text-slate-400">{skill.cooldown === null ? "Passive" : `${skill.cooldown}s cooldown`}</p>
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

  if (!character) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex text-sm text-cyan-300 underline underline-offset-4">
        ← Back to list
      </Link>

      <section className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr]">
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4">
          <Image
            src={character.smallImageUrl}
            alt={character.name}
            width={character.smallImageWidth}
            height={character.smallImageHeight}
            className="h-40 w-40 rounded-xl border border-cyan-300/20 object-cover"
          />
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
          <h1 className="text-3xl font-black text-cyan-100">{character.name}</h1>
          <p className="mt-1 text-sm uppercase tracking-wide text-slate-400">{character.slug}</p>
          <dl className="mt-4 space-y-2 text-sm text-slate-100">
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Rarity</dt>
              <dd>{character.rarity}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Element</dt>
              <dd>{character.element}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Weapon</dt>
              <dd>{character.weapon}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Class</dt>
              <dd>{character.role}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Manufacturer</dt>
              <dd>{character.manufacturer}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Squad</dt>
              <dd>{character.squad}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Burst Type</dt>
              <dd>{character.burstType}</dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Limited</dt>
              <dd>
                {character.isLimited === null ? "Unknown" : character.isLimited ? "Yes" : "No"}
              </dd>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <dt className="text-slate-400">Event</dt>
              <dd>{character.limitedEvent ?? "None"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
        <h2 className="text-xl font-bold text-cyan-200">Card Art</h2>
        <Image
          src={character.cardImageUrl}
          alt={`${character.name} card`}
          width={character.cardImageWidth}
          height={character.cardImageHeight}
          className="mt-4 h-auto max-w-xs rounded-xl border border-cyan-300/20"
        />
      </section>

      <section className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5">
        <h2 className="text-xl font-bold text-cyan-200">Skills</h2>
        {renderSkills(character)}
      </section>
    </main>
  );
}
