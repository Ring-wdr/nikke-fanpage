import { getCharacters, type CharacterSummary } from "@/lib/characterData";
import { CharacterListClient } from "@/components/CharacterListClient";

async function getCharacterList(): Promise<CharacterSummary[]> {
  try {
    return await getCharacters();
  } catch (_error) {
    return [];
  }
}

export default async function Home() {
  const characters = await getCharacterList();
  return <CharacterListClient initialCharacters={characters} />;
}
