import Link from "next/link";
import Image from "next/image";
import { getCharacters, type CharacterSummary } from "@/lib/characterData";

async function getCharacterList(): Promise<CharacterSummary[]> {
  try {
    return await getCharacters();
  } catch (_error) {
    return [];
  }
}

export default async function Home() {
  const characters = await getCharacterList();

  if (characters.length === 0) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center px-4">
        <section className="rounded-2xl border border-slate-700/60 bg-slate-950/65 p-8 text-center">
          <h1 className="text-3xl font-bold text-cyan-200">Nikke Characters</h1>
          <p className="mt-3 text-slate-300">No character data available.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Nikke Unit Roster
        </p>
        <h1 className="mt-3 text-4xl font-black text-white">Nikke Character List</h1>
        <p className="mt-2 text-sm text-slate-300">
          Total Units: <span className="font-semibold text-cyan-300">{characters.length}</span>
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {characters.map((character) => (
          <Link
            key={character.id}
            href={`/${character.slug}`}
            className="group block rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4 shadow-[0_0_30px_rgba(8,145,178,0.13)] transition duration-200 hover:translate-y-[-2px] hover:border-cyan-400/45 hover:shadow-[0_0_40px_rgba(14,165,233,0.3)]"
          >
            <article>
              <div className="flex items-center gap-3">
                <Image
                  src={character.smallImageUrl}
                  alt={character.name}
                  width={character.smallImageWidth}
                  height={character.smallImageHeight}
                  className="h-16 w-16 rounded-lg border border-cyan-300/20 bg-slate-900 object-cover shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                />
                <div>
                  <h2 className="text-lg font-bold text-cyan-100">{character.name}</h2>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{character.slug}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-200">
                <p>
                  <span className="text-cyan-300">Rarity</span> · {character.rarity}
                </p>
                <p>
                  <span className="text-cyan-300">Element</span> · {character.element}
                </p>
                <p>
                  <span className="text-cyan-300">Weapon</span> · {character.weapon}
                </p>
                <p>
                  <span className="text-cyan-300">Class</span> · {character.role}
                </p>
                <p>
                  <span className="text-cyan-300">Squad</span> · {character.squad}
                </p>
                <p>
                  <span className="text-cyan-300">Manufacturer</span> · {character.manufacturer}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-200">
                  Burst {character.burstType}
                </span>
                <span className="rounded-full border border-slate-400/30 bg-slate-700/40 px-2.5 py-1 text-xs text-slate-200">
                  {character.isLimited === null
                    ? "Limited: Unknown"
                    : character.isLimited
                      ? "Limited"
                      : "Standard"}
                </span>
                <span className="rounded-full border border-slate-400/30 bg-slate-700/40 px-2.5 py-1 text-xs text-slate-200">
                  {character.limitedEvent ?? "No Event"}
                </span>
              </div>

              {character.skills.length > 0 && (
                <p className="mt-3 text-xs text-slate-400">
                  Skills:{" "}
                  <span className="text-cyan-100">{character.skills.map((skill) => skill.slot).join(", ")}</span>
                </p>
              )}
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
