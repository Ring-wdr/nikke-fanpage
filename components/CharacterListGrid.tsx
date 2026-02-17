"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { type CharacterSummary } from "@/lib/characterData";
import { getCharacterIcons } from "@/lib/assetPaths";

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

const RARITY_STYLE: Record<string, string> = {
  SSR: "border-yellow-400/50 bg-yellow-400/15 text-yellow-300",
  SR: "border-purple-400/50 bg-purple-400/15 text-purple-300",
  R: "border-blue-400/50 bg-blue-400/15 text-blue-300",
};

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
        {filteredCharacters.map((character) => {
          const icons = getCharacterIcons(character);
          const rarityClass = RARITY_STYLE[character.rarity] ?? "border-slate-400/30 bg-slate-700/40 text-slate-200";

          return (
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
                    className="h-14 w-14 rounded-lg border border-cyan-300/20 bg-slate-900 object-cover shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-cyan-100">{character.name}</h2>
                    <p className="truncate text-xs text-slate-400">
                      {character.manufacturer} · {character.squad}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {icons.element && (
                      <Image
                        src={icons.element}
                        alt={character.element}
                        title={character.element}
                        width={24}
                        height={24}
                        className="h-6 w-6"
                      />
                    )}
                    {icons.weapon && (
                      <Image
                        src={icons.weapon}
                        alt={character.weapon}
                        title={character.weapon}
                        width={24}
                        height={24}
                        className="h-6 w-6"
                      />
                    )}
                    {icons.role && (
                      <Image
                        src={icons.role}
                        alt={character.role}
                        title={character.role}
                        width={24}
                        height={24}
                        className="h-6 w-6"
                      />
                    )}
                    {icons.burst && (
                      <Image
                        src={icons.burst}
                        alt={`Burst ${character.burstType}`}
                        title={`Burst ${character.burstType}`}
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    )}
                  </div>
                  <span className={`ml-auto rounded-full border px-2 py-0.5 text-xs font-semibold ${rarityClass}`}>
                    {character.rarity}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="rounded-full border border-slate-400/30 bg-slate-700/40 px-2.5 py-0.5 text-slate-200">
                    {character.isLimited === null ? "Unknown" : character.isLimited ? "Limited" : "Standard"}
                  </span>
                  {character.limitedEvent && (
                    <span className="rounded-full border border-slate-400/30 bg-slate-700/40 px-2.5 py-0.5 text-slate-200">
                      {character.limitedEvent}
                    </span>
                  )}
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
