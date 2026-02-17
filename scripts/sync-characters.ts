import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { characters, type Skill, type NewCharacter } from "../lib/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle({ client: sql });

const CHARACTER_LIST_URL = "https://www.prydwen.gg/page-data/sq/d/2474920082.json";
const CHARACTER_DETAIL_URL = "https://www.prydwen.gg/page-data/nikke/characters/";
const PRYDWEN_BASE_URL = "https://www.prydwen.gg";

// --- Prydwen API types ---

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
  skills?: ApiSkillDetail[];
  fullImage?: LocalFileImage;
  releaseDate?: string | null;
  specialities?: string[] | null;
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

// --- Helpers ---

function buildAbsoluteImageUrl(image?: LocalFileImage | null): string {
  const src = image?.localFile?.childImageSharp?.gatsbyImageData?.images?.fallback?.src;
  if (!src) return "";
  return `${PRYDWEN_BASE_URL}${src}`;
}

// --- Fetch from prydwen ---

async function fetchCharacterList(): Promise<ApiCharacter[]> {
  console.log("Fetching character list from prydwen...");
  const response = await fetch(CHARACTER_LIST_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch character list: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse;
  const nodes = payload?.data?.allContentfulNikkeCharacter?.nodes;
  if (!Array.isArray(nodes)) {
    throw new Error("Invalid character data shape from prydwen API");
  }
  console.log(`  Found ${nodes.length} characters`);
  return nodes;
}

async function fetchCharacterDetail(slug: string): Promise<ApiDetailUnit | null> {
  try {
    const response = await fetch(
      `${CHARACTER_DETAIL_URL}${encodeURIComponent(slug)}/page-data.json`,
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiDetailResponse;
    return payload?.result?.data?.currentUnit?.nodes?.[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchAllDetails(
  slugs: string[],
  concurrency: number = 5,
): Promise<Map<string, ApiDetailUnit>> {
  const results = new Map<string, ApiDetailUnit>();
  console.log(`Fetching details for ${slugs.length} characters (concurrency=${concurrency})...`);

  for (let i = 0; i < slugs.length; i += concurrency) {
    const batch = slugs.slice(i, i + concurrency);
    const details = await Promise.all(batch.map((s) => fetchCharacterDetail(s)));
    for (let j = 0; j < batch.length; j++) {
      const detail = details[j];
      if (detail) results.set(batch[j], detail);
    }
    const done = Math.min(i + concurrency, slugs.length);
    process.stdout.write(`  ${done}/${slugs.length}\r`);
  }
  console.log(`  Fetched details for ${results.size} characters`);
  return results;
}

// --- Fetch existing slugs ---

async function fetchExistingSlugs(): Promise<Set<string>> {
  const rows = await db
    .select({ slug: characters.slug })
    .from(characters);
  return new Set(rows.map((r) => r.slug));
}

// --- Insert new characters only ---

async function insertNewCharacters(
  chars: ApiCharacter[],
  details: Map<string, ApiDetailUnit>,
) {
  console.log(`Inserting ${chars.length} new characters...`);

  const values: NewCharacter[] = chars.map((char) => {
    const detail = details.get(char.slug);

    const skillsWithDetail = detail?.skills
      ? detail.skills.map((s) => ({
          cooldown: s.cooldown,
          type: s.type,
          slot: s.slot,
          name: s.name ?? undefined,
          descriptionRaw: s.descriptionLevel10?.raw ?? null,
        }))
      : null;

    const cv = detail?.cv
      ? { kr: detail.cv.kr ?? null, jpn: detail.cv.jpn ?? null, en: detail.cv.en ?? null }
      : null;

    return {
      slug: char.slug,
      externalId: char.id,
      name: char.name,
      rarity: char.rarity,
      element: char.element,
      weapon: char.weapon,
      role: char.class,
      manufacturer: char.manufacturer,
      squad: char.squad,
      burstType: char.burstType,
      isLimited: char.isLimited,
      limitedEvent: char.limitedEvent,
      smallImageUrl: buildAbsoluteImageUrl(char.smallImage),
      cardImageUrl: buildAbsoluteImageUrl(char.cardImage),
      smallImageWidth: char.smallImage.localFile.childImageSharp.gatsbyImageData.width,
      smallImageHeight: char.smallImage.localFile.childImageSharp.gatsbyImageData.height,
      cardImageWidth: char.cardImage.localFile.childImageSharp.gatsbyImageData.width,
      cardImageHeight: char.cardImage.localFile.childImageSharp.gatsbyImageData.height,
      skills: char.skills,
      fullImageUrl: detail ? buildAbsoluteImageUrl(detail.fullImage) : null,
      fullImageWidth: detail?.fullImage?.localFile?.childImageSharp?.gatsbyImageData?.width ?? null,
      fullImageHeight: detail?.fullImage?.localFile?.childImageSharp?.gatsbyImageData?.height ?? null,
      releaseDate: detail?.releaseDate ?? null,
      weaponName: detail?.weaponName ?? null,
      ammoCapacity: detail?.ammoCapacity ?? null,
      reloadTime: detail?.reloadTime ?? null,
      controlMode: detail?.controlMode ?? null,
      backstory: detail?.backstory?.backstory ?? null,
      cv,
      basicAttackRaw: detail?.basicAttack?.raw ?? null,
      harmonyCubesRaw: detail?.harmonyCubesInfo?.raw ?? null,
      skillsWithDetail,
      specialities: detail?.specialities ?? null,
    };
  });

  await db.insert(characters).values(values).onConflictDoNothing();

  console.log(`  Inserted ${chars.length} new characters`);
}

// --- Main ---

async function main() {
  const start = Date.now();

  const allCharacters = await fetchCharacterList();
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} characters already in DB`);

  const newCharacters = allCharacters.filter((c) => !existingSlugs.has(c.slug));
  console.log(`  ${newCharacters.length} new characters to insert (${allCharacters.length - newCharacters.length} skipped)`);

  if (newCharacters.length === 0) {
    console.log("Nothing to do — all characters already synced.");
  } else {
    const newSlugs = newCharacters.map((c) => c.slug);
    const details = await fetchAllDetails(newSlugs);
    await insertNewCharacters(newCharacters, details);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Done in ${elapsed}s`);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
