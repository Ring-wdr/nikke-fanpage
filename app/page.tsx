import { Suspense } from "react";
import { getCharacters, type CharacterSummary } from "@/lib/characterData";
import { CharacterListClient } from "@/components/CharacterListClient";

export const revalidate = 3600;

async function getCharacterList(): Promise<CharacterSummary[]> {
  try {
    return await getCharacters();
  } catch (_error) {
    return [];
  }
}

export default async function Home() {
  const characters = await getCharacterList();
  return (
    <Suspense>
      <CharacterListClient initialCharacters={characters} />
    </Suspense>
  );
}
