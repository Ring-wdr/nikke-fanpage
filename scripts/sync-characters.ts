import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const CHARACTER_LIST_URL = "https://www.prydwen.gg/page-data/sq/d/2474920082.json";
const CHARACTER_DETAIL_URL = "https://www.prydwen.gg/page-data/nikke/characters/";
const PRYDWEN_BASE_URL = "https://www.prydwen.gg";

// --- Prydwen API types ---

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
  const rows = (await sql`SELECT slug FROM characters`) as { slug: string }[];
  return new Set(rows.map((r) => r.slug));
}

// --- Insert new characters only ---

async function insertNewCharacters(
  characters: ApiCharacter[],
  details: Map<string, ApiDetailUnit>,
) {
  console.log(`Inserting ${characters.length} new characters...`);

  for (const char of characters) {
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

    await sql`
      INSERT INTO characters (
        slug, external_id, name, rarity, element, weapon, role, manufacturer,
        squad, burst_type, is_limited, limited_event,
        small_image_url, card_image_url,
        small_image_width, small_image_height,
        card_image_width, card_image_height,
        skills,
        full_image_url, full_image_width, full_image_height,
        release_date, weapon_name, ammo_capacity, reload_time, control_mode,
        backstory, cv, basic_attack_raw, harmony_cubes_raw,
        skills_with_detail, specialities, synced_at
      ) VALUES (
        ${char.slug}, ${char.id}, ${char.name}, ${char.rarity}, ${char.element},
        ${char.weapon}, ${char.class}, ${char.manufacturer}, ${char.squad},
        ${char.burstType}, ${char.isLimited}, ${char.limitedEvent},
        ${buildAbsoluteImageUrl(char.smallImage)}, ${buildAbsoluteImageUrl(char.cardImage)},
        ${char.smallImage.localFile.childImageSharp.gatsbyImageData.width},
        ${char.smallImage.localFile.childImageSharp.gatsbyImageData.height},
        ${char.cardImage.localFile.childImageSharp.gatsbyImageData.width},
        ${char.cardImage.localFile.childImageSharp.gatsbyImageData.height},
        ${JSON.stringify(char.skills)},
        ${detail ? buildAbsoluteImageUrl(detail.fullImage) : null},
        ${detail?.fullImage?.localFile?.childImageSharp?.gatsbyImageData?.width ?? null},
        ${detail?.fullImage?.localFile?.childImageSharp?.gatsbyImageData?.height ?? null},
        ${detail?.releaseDate ?? null}, ${detail?.weaponName ?? null},
        ${detail?.ammoCapacity ?? null}, ${detail?.reloadTime ?? null},
        ${detail?.controlMode ?? null},
        ${detail?.backstory?.backstory ?? null},
        ${cv ? JSON.stringify(cv) : null},
        ${detail?.basicAttack?.raw ?? null},
        ${detail?.harmonyCubesInfo?.raw ?? null},
        ${skillsWithDetail ? JSON.stringify(skillsWithDetail) : null},
        ${detail?.specialities ?? null},
        now()
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  console.log(`  Inserted ${characters.length} new characters`);
}

// --- Main ---

async function main() {
  const start = Date.now();

  const characters = await fetchCharacterList();
  const existingSlugs = await fetchExistingSlugs();
  console.log(`  ${existingSlugs.size} characters already in DB`);

  const newCharacters = characters.filter((c) => !existingSlugs.has(c.slug));
  console.log(`  ${newCharacters.length} new characters to insert (${characters.length - newCharacters.length} skipped)`);

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
