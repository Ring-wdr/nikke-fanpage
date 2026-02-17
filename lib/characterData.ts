import { sql } from "./db";

type Skill = {
  cooldown: number | null;
  type: string;
  slot: string;
  name?: string;
  descriptionLevel10?: {
    raw?: string | null;
  } | null;
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
  skillsWithDetail?: Array<
    Skill & {
      descriptionRaw?: string | null;
    }
  >;
  specialities?: string[] | null;
};

type CharacterRow = {
  slug: string;
  external_id: string;
  name: string;
  rarity: string;
  element: string;
  weapon: string;
  role: string;
  manufacturer: string;
  squad: string;
  burst_type: string;
  is_limited: boolean | null;
  limited_event: string | null;
  small_image_url: string;
  card_image_url: string;
  small_image_width: number;
  small_image_height: number;
  card_image_width: number;
  card_image_height: number;
  skills: Skill[];
  full_image_url: string | null;
  full_image_width: number | null;
  full_image_height: number | null;
  release_date: string | null;
  weapon_name: string | null;
  ammo_capacity: number | null;
  reload_time: number | null;
  control_mode: string | null;
  backstory: string | null;
  cv: { kr?: string | null; jpn?: string | null; en?: string | null } | null;
  basic_attack_raw: string | null;
  harmony_cubes_raw: string | null;
  skills_with_detail: Array<Skill & { descriptionRaw?: string | null }> | null;
  specialities: string[] | null;
};

function rowToSummary(row: CharacterRow): CharacterSummary {
  return {
    id: row.external_id,
    name: row.name,
    slug: row.slug,
    rarity: row.rarity,
    element: row.element,
    weapon: row.weapon,
    role: row.role,
    manufacturer: row.manufacturer,
    squad: row.squad,
    burstType: row.burst_type,
    isLimited: row.is_limited,
    limitedEvent: row.limited_event,
    smallImageUrl: row.small_image_url,
    cardImageUrl: row.card_image_url,
    smallImageWidth: row.small_image_width,
    smallImageHeight: row.small_image_height,
    cardImageWidth: row.card_image_width,
    cardImageHeight: row.card_image_height,
    skills: row.skills,
  };
}

function rowToDetail(row: CharacterRow): CharacterSummary {
  return {
    ...rowToSummary(row),
    fullImageUrl: row.full_image_url ?? undefined,
    fullImageWidth: row.full_image_width ?? undefined,
    fullImageHeight: row.full_image_height ?? undefined,
    releaseDate: row.release_date,
    weaponName: row.weapon_name,
    ammoCapacity: row.ammo_capacity,
    reloadTime: row.reload_time,
    controlMode: row.control_mode,
    backstory: row.backstory,
    cv: row.cv ?? undefined,
    basicAttackRaw: row.basic_attack_raw,
    harmonyCubesRaw: row.harmony_cubes_raw,
    skillsWithDetail: row.skills_with_detail ?? undefined,
    specialities: row.specialities,
  };
}

const SUMMARY_COLUMNS = `
  slug, external_id, name, rarity, element, weapon, role, manufacturer,
  squad, burst_type, is_limited, limited_event,
  small_image_url, card_image_url,
  small_image_width, small_image_height,
  card_image_width, card_image_height,
  skills
`;

export async function getCharacters(): Promise<CharacterSummary[]> {
  const rows = (await sql`
    SELECT ${sql.unsafe(SUMMARY_COLUMNS)} FROM characters ORDER BY name
  `) as CharacterRow[];
  return rows.map(rowToSummary);
}

export async function getCharacterBySlug(
  slug: string,
): Promise<CharacterSummary | null> {
  const rows = (await sql`
    SELECT ${sql.unsafe(SUMMARY_COLUMNS)} FROM characters WHERE slug = ${slug} LIMIT 1
  `) as CharacterRow[];
  return rows[0] ? rowToSummary(rows[0]) : null;
}

export async function getCharacterDetailBySlug(
  slug: string,
): Promise<CharacterSummary | null> {
  const rows = (await sql`SELECT * FROM characters WHERE slug = ${slug} LIMIT 1`) as CharacterRow[];
  return rows[0] ? rowToDetail(rows[0]) : null;
}

export async function getCharacterSlugs(): Promise<string[]> {
  const rows = (await sql`SELECT slug FROM characters ORDER BY name`) as { slug: string }[];
  return rows.map((r) => r.slug);
}
