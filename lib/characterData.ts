const CHARACTER_LIST_URL = "https://www.prydwen.gg/page-data/sq/d/2474920082.json";
const CHARACTER_DETAIL_URL = "https://www.prydwen.gg/page-data/nikke/characters/";
const PRYDWEN_BASE_URL = "https://www.prydwen.gg";

type Skill = {
  cooldown: number | null;
  type: string;
  slot: string;
  name?: string;
  descriptionLevel10?: {
    raw?: string | null;
  } | null;
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

type ApiSkillDetail = {
  unitId: string | null;
  skillId: string | null;
  name: string | null;
  slot: string;
  type: string;
  cooldown: number | null;
  descriptionLevel10?: {
    raw?: string | null;
  } | null;
  skillTreasure: string | null;
  phase: string | null;
};

type ApiDetailUnit = {
  backstory?: {
    backstory?: string | null;
  } | null;
  cv?: {
    kr?: string | null;
    jpn?: string | null;
    en?: string | null;
  } | null;
  weaponName?: string | null;
  ammoCapacity?: number | null;
  reloadTime?: number | null;
  controlMode?: string | null;
  basicAttack?: {
    raw?: string | null;
  } | null;
  harmonyCubesInfo?: {
    raw?: string | null;
  } | null;
  review?: {
    raw?: string | null;
  } | null;
  skills?: ApiSkillDetail[];
  fullImage?: LocalFileImage;
  releaseDate?: string | null;
  specialities?: string[] | null;
  rarity?: string;
  element?: string;
  weapon?: string;
  class?: string;
  manufacturer?: string;
  squad?: string;
  burstType?: string;
  id?: string;
  name?: string;
  slug?: string;
};

type ApiDetailResponse = {
  result: {
    data: {
      currentUnit: {
        nodes: ApiDetailUnit[];
      };
    };
  };
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
  fullImageUrl?: string;
  fullImageWidth?: number;
  fullImageHeight?: number;
  releaseDate?: string | null;
  weaponName?: string | null;
  ammoCapacity?: number | null;
  reloadTime?: number | null;
  controlMode?: string | null;
  backstory?: string | null;
  cv?: {
    kr?: string | null;
    jpn?: string | null;
    en?: string | null;
  };
  basicAttackRaw?: string | null;
  harmonyCubesRaw?: string | null;
  reviewRaw?: string | null;
  skillsWithDetail?: Array<
    Skill & {
      descriptionRaw?: string | null;
    }
  >;
  specialities?: string[] | null;
};

const characterListPromise = fetchCharacters();
const characterMapPromise = characterListPromise.then((characters) =>
  new Map(characters.map((character) => [character.slug, character])),
);

async function fetchCharacters(): Promise<CharacterSummary[]> {
  const response = await fetch(CHARACTER_LIST_URL, {
    next: {
      revalidate: false,
    },
  });

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

function buildAbsoluteImageUrl(image?: LocalFileImage | null): string {
  const src = image?.localFile?.childImageSharp?.gatsbyImageData?.images?.fallback?.src;
  if (!src) {
    return "";
  }
  return `${PRYDWEN_BASE_URL}${src}`;
}

export async function getCharacters(): Promise<CharacterSummary[]> {
  return characterListPromise;
}

export async function getCharacterDetailBySlug(slug: string): Promise<CharacterSummary | null> {
  try {
    const response = await fetch(`${CHARACTER_DETAIL_URL}${encodeURIComponent(slug)}/page-data.json`, {
      next: {
        revalidate: false,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiDetailResponse;
    const detailUnit = payload?.result?.data?.currentUnit?.nodes?.[0];

    if (!detailUnit) {
      return null;
    }

    const summary = await getCharacterBySlug(slug);
    if (!summary) {
      return null;
    }

    const detailSkills = (detailUnit.skills ?? []).map((skill) => ({
      cooldown: skill.cooldown,
      type: skill.type,
      slot: skill.slot,
      name: skill.name ?? undefined,
      descriptionRaw: skill.descriptionLevel10?.raw ?? null,
    }));

    return {
      ...summary,
      fullImageUrl: buildAbsoluteImageUrl(detailUnit.fullImage),
      fullImageWidth: detailUnit.fullImage?.localFile?.childImageSharp?.gatsbyImageData?.width,
      fullImageHeight: detailUnit.fullImage?.localFile?.childImageSharp?.gatsbyImageData?.height,
      releaseDate: detailUnit.releaseDate ?? null,
      weaponName: detailUnit.weaponName ?? null,
      ammoCapacity: detailUnit.ammoCapacity ?? null,
      reloadTime: detailUnit.reloadTime ?? null,
      controlMode: detailUnit.controlMode ?? null,
      backstory: detailUnit.backstory?.backstory ?? null,
      cv: {
        kr: detailUnit.cv?.kr ?? null,
        jpn: detailUnit.cv?.jpn ?? null,
        en: detailUnit.cv?.en ?? null,
      },
      basicAttackRaw: detailUnit.basicAttack?.raw ?? null,
      harmonyCubesRaw: detailUnit.harmonyCubesInfo?.raw ?? null,
      reviewRaw: detailUnit.review?.raw ?? null,
      specialities: detailUnit.specialities ?? null,
      skillsWithDetail: detailSkills,
    };
  } catch {
    return null;
  }
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
