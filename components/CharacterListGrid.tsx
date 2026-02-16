"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { type CharacterSummary } from "@/lib/characterData";

type CharacterListGridProps = {
  initialCharacters: CharacterSummary[];
  searchQuery: string;
  onClearSearch: () => void;
};

function sortCharacters(characters: CharacterSummary[]): CharacterSummary[] {
  return characters.slice().sort((left, right) =>
    left.name.localeCompare(right.name, "en", {
      sensitivity: "base",
    }),
  );
}

export default function CharacterListGrid({
  initialCharacters,
  searchQuery,
  onClearSearch,
}: CharacterListGridProps) {
  const filteredCharacters = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const sorted = sortCharacters(initialCharacters);
    if (!normalized) {
      return sorted;
    }
    return sorted.filter((character) => character.name.toLowerCase().includes(normalized));
  }, [initialCharacters, searchQuery]);

  if (filteredCharacters.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-700/60 bg-slate-950/65 p-6 text-slate-300">
        <p>No character matched your search.</p>
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-3 rounded-lg border border-cyan-300/40 bg-cyan-300/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/30"
        >
          Clear search
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-cyan-300/30 bg-slate-950/60 p-3 text-sm text-slate-200">
        <p className="text-xs text-slate-400">TOP UNIT</p>
        <p className="mt-1 text-lg font-semibold text-cyan-200">{filteredCharacters.length} matched</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCharacters.map((character) => (
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
                  {character.isLimited === null ? "Limited: Unknown" : character.isLimited ? "Limited" : "Standard"}
                </span>
                <span className="rounded-full border border-slate-400/30 bg-slate-700/40 px-2.5 py-1 text-xs text-slate-200">
                  {character.limitedEvent ?? "No Event"}
                </span>
              </div>

              {character.skills.length > 0 && (
                <p className="mt-3 text-xs text-slate-400">
                  Skills: <span className="text-cyan-100">{character.skills.map((skill) => skill.slot).join(", ")}</span>
                </p>
              )}
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

