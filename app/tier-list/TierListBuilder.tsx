"use client";

import Image from "next/image";
import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useDeferredValue, useMemo, useState, useTransition } from "react";

type TierKey = "s" | "a" | "b" | "c" | "d" | "e";
type DropZone = TierKey | "pool";
type TierState = Record<TierKey, string[]>;

type TierListCharacter = {
  slug: string;
  name: string;
  smallImageUrl: string;
  smallImageWidth: number;
  smallImageHeight: number;
};

type DragPayload = {
  slug: string;
  from: DropZone;
};

type QueryState = {
  s: string;
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
};

const tierDefinitions: Array<{
  key: TierKey;
  title: string;
  className: string;
  labelClassName: string;
}> = [
  {
    key: "s",
    title: "S",
    className: "border-cyan-300/35 bg-cyan-300/5",
    labelClassName: "bg-cyan-300/30 text-cyan-100",
  },
  {
    key: "a",
    title: "A",
    className: "border-emerald-300/35 bg-emerald-300/5",
    labelClassName: "bg-emerald-300/30 text-emerald-100",
  },
  {
    key: "b",
    title: "B",
    className: "border-blue-300/35 bg-blue-300/5",
    labelClassName: "bg-blue-300/30 text-blue-100",
  },
  {
    key: "c",
    title: "C",
    className: "border-indigo-300/35 bg-indigo-300/5",
    labelClassName: "bg-indigo-300/30 text-indigo-100",
  },
  {
    key: "d",
    title: "D",
    className: "border-purple-300/35 bg-purple-300/5",
    labelClassName: "bg-purple-300/30 text-purple-100",
  },
  {
    key: "e",
    title: "E",
    className: "border-rose-300/35 bg-rose-300/5",
    labelClassName: "bg-rose-300/30 text-rose-100",
  },
];

const tierKeys: ReadonlyArray<TierKey> = ["s", "a", "b", "c", "d", "e"];

type TierListBoardProps = {
  tierDefinitions: typeof tierDefinitions;
  tiersFromQuery: TierState;
  characterLookup: Map<string, TierListCharacter>;
  onDropToZone: (destination: DropZone) => (event: React.DragEvent<HTMLElement>) => void;
  onDragStart: (slug: string, from: DropZone) => (event: React.DragEvent<HTMLElement>) => void;
  onCardToPool: (slug: string, from: DropZone) => void;
};

function TierListBoard({
  tierDefinitions,
  tiersFromQuery,
  characterLookup,
  onDropToZone,
  onDragStart,
  onCardToPool,
}: TierListBoardProps) {
  return (
    <section className="space-y-4">
      {tierDefinitions.map((tier) => {
        const items = tiersFromQuery[tier.key];
        return (
          <section
            key={tier.key}
            className={`overflow-hidden rounded-xl border ${tier.className}`}
          >
            <div className="grid min-h-20 grid-cols-[76px_1fr]">
              <aside
                className={`grid place-items-center border-r border-slate-700/50 ${tier.labelClassName}`}
              >
                <div className="space-y-1 text-center">
                  <p className="text-2xl font-black tracking-wide">{tier.title}</p>
                  <p className="text-xs">{items.length}</p>
                </div>
              </aside>
              <div
                className="min-h-20 bg-slate-950/35 p-2"
                onDrop={onDropToZone(tier.key)}
                onDragOver={(event) => {
                  event.preventDefault();
                }}
              >
                <div className="flex min-h-16 flex-wrap items-center gap-2">
                  {items.length === 0 ? (
                    <p className="w-full rounded-md border border-dashed border-slate-700/60 px-2 py-4 text-center text-xs text-slate-400">
                      Drag units into this rank row
                    </p>
                  ) : (
                    items.map((slug) => {
                      const character = characterLookup.get(slug);
                      if (!character) {
                        return null;
                      }
                      return (
                        <article
                          key={`${slug}-${tier.key}`}
                          draggable
                          onDragStart={onDragStart(slug, tier.key)}
                          onDoubleClick={() => onCardToPool(slug, tier.key)}
                          className="group flex cursor-grab items-center gap-2 rounded-lg border border-slate-600/80 bg-slate-900/90 px-2 py-1 text-xs transition hover:border-cyan-300/80"
                        >
                          <Image
                            src={character.smallImageUrl}
                            alt={character.name}
                            width={character.smallImageWidth}
                            height={character.smallImageHeight}
                            className="h-8 w-8 rounded-md border border-cyan-300/25 bg-slate-950 object-cover"
                          />
                          <p className="text-cyan-100">{character.name}</p>
                          <button
                            type="button"
                            onClick={() => onCardToPool(slug, tier.key)}
                            className="ml-auto hidden h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-300 group-hover:flex"
                            aria-label={`Remove ${character.name}`}
                          >
                            ×
                          </button>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </section>
  );
}

type UnassignedPoolProps = {
  unassignedCharacters: TierListCharacter[];
  onDropToZone: (destination: DropZone) => (event: React.DragEvent<HTMLElement>) => void;
  onDragStart: (slug: string, from: DropZone) => (event: React.DragEvent<HTMLElement>) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
};

function UnassignedPool({
  unassignedCharacters,
  onDropToZone,
  onDragStart,
  searchQuery,
  onSearchChange,
  isSearching,
}: UnassignedPoolProps) {
  return (
    <section
      className="flex-shrink-0 overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-950/85 p-3"
      onDrop={onDropToZone("pool")}
      onDragOver={(event) => {
        event.preventDefault();
      }}
    >
      <div className="mb-2 flex items-center gap-3">
        <h2 className="shrink-0 text-sm font-bold text-white">Unassigned</h2>
        <span className="shrink-0 rounded-full border border-slate-400/30 px-2 py-0.5 text-xs text-slate-200">
          {isSearching ? "..." : `${unassignedCharacters.length}`}
        </span>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Search characters</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none ring-cyan-500 placeholder:text-slate-400 focus:ring-2"
          />
        </label>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {unassignedCharacters.length === 0 ? (
          <p className="w-full rounded-md border border-dashed border-slate-700/60 p-4 text-center text-xs text-slate-400">
            No characters found
          </p>
        ) : (
          unassignedCharacters.map((character) => (
            <article
              key={`pool-${character.slug}`}
              draggable
              onDragStart={onDragStart(character.slug, "pool")}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/70 p-2"
            >
              <Image
                src={character.smallImageUrl}
                alt={character.name}
                width={character.smallImageWidth}
                height={character.smallImageHeight}
                className="h-10 w-10 rounded-md border border-cyan-300/25 bg-slate-950 object-cover"
              />
              <p className="whitespace-nowrap text-xs text-cyan-100">{character.name}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const tierParsers = {
  s: parseAsString.withDefault(""),
  a: parseAsString.withDefault(""),
  b: parseAsString.withDefault(""),
  c: parseAsString.withDefault(""),
  d: parseAsString.withDefault(""),
  e: parseAsString.withDefault(""),
};

function splitQuerySlugs(raw: string, validSlugs: Set<string>): string[] {
  if (!raw) {
    return [];
  }

  const slugs = raw
    .split(",")
    .map((slug) => {
      try {
        return decodeURIComponent(slug);
      } catch {
        return slug;
      }
    })
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0 && validSlugs.has(slug));

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const slug of slugs) {
    if (seen.has(slug)) {
      continue;
    }
    unique.push(slug);
    seen.add(slug);
  }

  return unique;
}

function parseQueryToState(query: QueryState, validSlugs: Set<string>): TierState {
  const parsed: TierState = {
    s: splitQuerySlugs(query.s, validSlugs),
    a: splitQuerySlugs(query.a, validSlugs),
    b: splitQuerySlugs(query.b, validSlugs),
    c: splitQuerySlugs(query.c, validSlugs),
    d: splitQuerySlugs(query.d, validSlugs),
    e: splitQuerySlugs(query.e, validSlugs),
  };

  const seen = new Set<string>();
  const deduped: TierState = {
    s: [],
    a: [],
    b: [],
    c: [],
    d: [],
    e: [],
  };

  tierKeys.forEach((tierKey) => {
    for (const slug of parsed[tierKey]) {
      if (seen.has(slug)) {
        continue;
      }
      deduped[tierKey].push(slug);
      seen.add(slug);
    }
  });

  return deduped;
}

function serializeState(state: TierState): Record<TierKey, string | null> {
  return {
    s: state.s.length === 0 ? null : state.s.map((slug) => encodeURIComponent(slug)).join(","),
    a: state.a.length === 0 ? null : state.a.map((slug) => encodeURIComponent(slug)).join(","),
    b: state.b.length === 0 ? null : state.b.map((slug) => encodeURIComponent(slug)).join(","),
    c: state.c.length === 0 ? null : state.c.map((slug) => encodeURIComponent(slug)).join(","),
    d: state.d.length === 0 ? null : state.d.map((slug) => encodeURIComponent(slug)).join(","),
    e: state.e.length === 0 ? null : state.e.map((slug) => encodeURIComponent(slug)).join(","),
  };
}

function isEqualState(left: TierState, right: TierState): boolean {
  return tierKeys.every((tierKey) => left[tierKey].join("|") === right[tierKey].join("|"));
}

function moveCharacterToZone(current: TierState, payload: DragPayload, destination: DropZone): TierState {
  if (!payload.slug) {
    return current;
  }

  const next: TierState = {
    s: current.s.filter((slug) => slug !== payload.slug),
    a: current.a.filter((slug) => slug !== payload.slug),
    b: current.b.filter((slug) => slug !== payload.slug),
    c: current.c.filter((slug) => slug !== payload.slug),
    d: current.d.filter((slug) => slug !== payload.slug),
    e: current.e.filter((slug) => slug !== payload.slug),
  };

  if (destination === "pool") {
    return next;
  }

  if (payload.from === destination) {
    return current;
  }

  return {
    ...next,
    [destination]: [...next[destination], payload.slug],
  };
}

function isValidDropZone(value: string): value is DropZone {
  return value === "pool" || tierKeys.includes(value as TierKey);
}

function parsePayload(event: React.DragEvent<HTMLElement>): DragPayload | null {
  const encodedPayload = event.dataTransfer.getData("application/json");
  if (encodedPayload) {
    try {
      const parsed = JSON.parse(encodedPayload) as DragPayload;
      if (typeof parsed?.slug === "string" && isValidDropZone(parsed.from)) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  const fallbackSlug = event.dataTransfer.getData("text/plain").trim();
  if (!fallbackSlug) {
    return null;
  }

  return {
    slug: fallbackSlug,
    from: "pool",
  };
}

type TierListBuilderProps = {
  characters: TierListCharacter[];
};

export function TierListBuilder({ characters }: TierListBuilderProps) {
  const [query, setQuery] = useQueryStates(tierParsers, {
    history: "replace",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isSearching, startTransition] = useTransition();

  const validSlugs = useMemo(
    () => new Set(characters.map((character) => character.slug)),
    [characters],
  );
  const tiersFromQuery = useMemo(
    () => parseQueryToState(query as QueryState, validSlugs),
    [query.s, query.a, query.b, query.c, query.d, query.e, validSlugs],
  );

  const characterLookup = useMemo(() => {
    const next = new Map<string, TierListCharacter>();
    for (const character of characters) {
      next.set(character.slug, character);
    }
    return next;
  }, [characters]);

  const assigned = useMemo(() => {
    const set = new Set<string>();
    for (const tierKey of tierKeys) {
      tiersFromQuery[tierKey].forEach((slug) => set.add(slug));
    }
    return set;
  }, [tiersFromQuery]);

  const unassignedCharacters = useMemo(
    () => characters.filter((character) => !assigned.has(character.slug)),
    [assigned, characters],
  );
  const filteredUnassignedCharacters = useMemo(() => {
    const normalized = deferredSearchQuery.trim().toLowerCase();
    if (!normalized) {
      return unassignedCharacters;
    }

    return unassignedCharacters.filter((character) => character.name.toLowerCase().includes(normalized));
  }, [deferredSearchQuery, unassignedCharacters]);

  const applyMove = useCallback(
    (payload: DragPayload, destination: DropZone) => {
      const next = moveCharacterToZone(tiersFromQuery, payload, destination);
      if (isEqualState(next, tiersFromQuery)) {
        return;
      }
      void setQuery(serializeState(next));
    },
    [setQuery, tiersFromQuery],
  );

  const onDropToZone = useCallback(
    (destination: DropZone) => (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      const payload = parsePayload(event);
      if (!payload) {
        return;
      }
      applyMove(payload, destination);
    },
    [applyMove],
  );

  const onDragStart = useCallback((slug: string, from: DropZone) => (event: React.DragEvent<HTMLElement>) => {
    const payload: DragPayload = { slug, from };
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", slug);
  }, []);

  const onCardToPool = useCallback(
    (slug: string, from: DropZone) => {
      applyMove({ slug, from }, "pool");
    },
    [applyMove],
  );

  return (
    <section className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TierListBoard
          tierDefinitions={tierDefinitions}
          tiersFromQuery={tiersFromQuery}
          characterLookup={characterLookup}
          onDropToZone={onDropToZone}
          onDragStart={onDragStart}
          onCardToPool={onCardToPool}
        />
      </div>
      <UnassignedPool
        unassignedCharacters={filteredUnassignedCharacters}
        onDropToZone={onDropToZone}
        onDragStart={onDragStart}
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          startTransition(() => {
            setSearchQuery(value);
          });
        }}
        isSearching={isSearching}
      />
    </section>
  );
}
