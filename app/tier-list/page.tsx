import { getCharacters } from "@/lib/characterData";
import { TierListBuilder } from "./TierListBuilder";
import { CopyLinkButton } from "./CopyLinkButton";

type TierCharacter = {
  slug: string;
  name: string;
  smallImageUrl: string;
  smallImageWidth: number;
  smallImageHeight: number;
};

export default async function TierListPage() {
  const characters = await getCharacters();
  const paletteItems: TierCharacter[] = characters
    .map((character) => ({
      slug: character.slug,
      name: character.name,
      smallImageUrl: character.smallImageUrl,
      smallImageWidth: character.smallImageWidth,
      smallImageHeight: character.smallImageHeight,
    }))
    .sort((left, right) =>
      left.name.localeCompare(right.name, "en", {
        sensitivity: "base",
      }),
    );

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Nikke Tier Builder
            </p>
            <h1 className="mt-2 text-4xl font-black text-white">Tier List</h1>
            <p className="mt-1 text-sm text-slate-300">
              Drag characters into tiers to build and share your ranked list.
            </p>
          </div>
          <CopyLinkButton />
        </div>
        <TierListBuilder characters={paletteItems} />
      </section>
    </main>
  );
}
