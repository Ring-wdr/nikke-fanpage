"use client";

import { lazy, Suspense, useDeferredValue, useRef, useState, useTransition, useCallback } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { type CharacterSummary } from "@/lib/characterData";

const CharacterListGrid = lazy(() => import("@/components/CharacterListGrid"));

type CharacterListClientProps = {
  initialCharacters: CharacterSummary[];
};

export function CharacterListClient({ initialCharacters }: CharacterListClientProps) {
  const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""), {
    history: "replace",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(searchQuery);
  const [, startTransition] = useTransition();
  const [visibleCount, setVisibleCount] = useState(initialCharacters.length);

  const clearSearch = useCallback(() => {
    startTransition(() => {
      void setSearchQuery("");
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [setSearchQuery]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-950/85 p-4 backdrop-blur-sm lg:sticky lg:top-0 lg:z-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Nikke Unit Roster
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Nikke Character List</h1>
        <p className="mt-2 text-sm text-slate-300">
          Total Units: <span className="font-semibold text-cyan-300">{visibleCount}</span>
        </p>
        <div className="mt-4 flex gap-2">
          <input
            type="search"
            defaultValue={searchQuery}
            ref={inputRef}
            onChange={(event) => {
              startTransition(() => {
                void setSearchQuery(event.target.value);
              });
            }}
            placeholder="Search character name"
            className="min-w-0 flex-1 rounded-lg border border-cyan-500/30 bg-slate-950/70 px-3 py-2 text-sm text-cyan-100 placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-300"
          />
        </div>
        {deferredQuery && (
          <p className="mt-2 text-xs text-slate-300">
            Showing results for <span className="text-cyan-300">{`"${deferredQuery}"`}</span>
          </p>
        )}
      </header>

      <Suspense
        fallback={
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/65 p-6 text-sm text-slate-300 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              Loading characters…
            </div>
          </section>
        }
      >
        <CharacterListGrid
          initialCharacters={initialCharacters}
          searchQuery={deferredQuery}
          onClearSearch={clearSearch}
          onFilteredCountChange={setVisibleCount}
        />
      </Suspense>
    </main>
  );
}
