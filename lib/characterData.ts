const CHARACTER_LIST_URL = "https://www.prydwen.gg/page-data/sq/d/2474920082.json";
const PRYDWEN_BASE_URL = "https://www.prydwen.gg";

type Skill = {
  cooldown: number | null;
  type: string;
  slot: string;
};

type GatsbyImage = {
  images: {
    fallback: {
      src: string;
    };
  };
  width: number;
  height: number;
};

type ChildImageSharp = {
  gatsbyImageData: GatsbyImage;
};

type LocalFileImage = {
  localFile: {
    childImageSharp: ChildImageSharp;
  };
};

type ApiCharacter = {
  id: string;
  name: string;
  slug: string;
  rarity: string;
  element: string;
  weapon: string;
  class: string;
  manufacturer: string;
  squad: string;
  burstType: string;
  isLimited: boolean | null;
  limitedEvent: string | null;
  skills: Skill[];
  smallImage: LocalFileImage;
  cardImage: LocalFileImage;
};

type ApiResponse = {
  data: {
    allContentfulNikkeCharacter: {
      nodes: ApiCharacter[];
    };
  };
};

export type CharacterSummary = {
  id: string;
  name: string;
  slug: string;
  rarity: string;
  element: string;
  weapon: string;
  role: string;
  manufacturer: string;
  squad: string;
  burstType: string;
  isLimited: boolean | null;
  limitedEvent: string | null;
  smallImageUrl: string;
  cardImageUrl: string;
  skills: Skill[];
  smallImageWidth: number;
  smallImageHeight: number;
  cardImageWidth: number;
  cardImageHeight: number;
};

const characterListPromise = fetchCharacters();
const characterMapPromise = characterListPromise.then((characters) =>
  new Map(characters.map((character) => [character.slug, character])),
);

async function fetchCharacters(): Promise<CharacterSummary[]> {
  const response = await fetch(CHARACTER_LIST_URL);

  if (!response.ok) {
    throw new Error(`Failed to load character data: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse;
  const nodes = payload?.data?.allContentfulNikkeCharacter?.nodes;

  if (!Array.isArray(nodes)) {
    throw new Error("Invalid character data shape from prydwen API");
  }

  return nodes.map((character) => ({
    id: character.id,
    name: character.name,
    slug: character.slug,
    rarity: character.rarity,
    element: character.element,
    weapon: character.weapon,
    role: character.class,
    manufacturer: character.manufacturer,
    squad: character.squad,
    burstType: character.burstType,
    isLimited: character.isLimited,
    limitedEvent: character.limitedEvent,
    smallImageUrl: buildAbsoluteImageUrl(character.smallImage),
    cardImageUrl: buildAbsoluteImageUrl(character.cardImage),
    smallImageWidth: character.smallImage.localFile.childImageSharp.gatsbyImageData.width,
    smallImageHeight: character.smallImage.localFile.childImageSharp.gatsbyImageData.height,
    cardImageWidth: character.cardImage.localFile.childImageSharp.gatsbyImageData.width,
    cardImageHeight: character.cardImage.localFile.childImageSharp.gatsbyImageData.height,
    skills: character.skills,
  }));
}

function buildAbsoluteImageUrl(image: LocalFileImage): string {
  const src = image?.localFile?.childImageSharp?.gatsbyImageData?.images?.fallback?.src;
  if (!src) {
    return "";
  }
  return `${PRYDWEN_BASE_URL}${src}`;
}

export async function getCharacters(): Promise<CharacterSummary[]> {
  return characterListPromise;
}

export async function getCharacterBySlug(
  slug: string,
): Promise<CharacterSummary | null> {
  const characterBySlug = await characterMapPromise;
  return characterBySlug.get(slug) ?? null;
}

export async function getCharacterSlugs(): Promise<string[]> {
  const characters = await characterListPromise;
  return characters.map((character) => character.slug);
}
