import { eq, asc } from "drizzle-orm";
import { db } from "./db";
import { characters, type Character, type Skill, type SkillWithDetail, type CV } from "./schema";

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
  cv?: CV;
  basicAttackRaw?: string | null;
  harmonyCubesRaw?: string | null;
  skillsWithDetail?: SkillWithDetail[];
  specialities?: string[] | null;
};

// Columns selected for list/card views
const summaryColumns = {
  slug: characters.slug,
  externalId: characters.externalId,
  name: characters.name,
  rarity: characters.rarity,
  element: characters.element,
  weapon: characters.weapon,
  role: characters.role,
  manufacturer: characters.manufacturer,
  squad: characters.squad,
  burstType: characters.burstType,
  isLimited: characters.isLimited,
  limitedEvent: characters.limitedEvent,
  smallImageUrl: characters.smallImageUrl,
  cardImageUrl: characters.cardImageUrl,
  smallImageWidth: characters.smallImageWidth,
  smallImageHeight: characters.smallImageHeight,
  cardImageWidth: characters.cardImageWidth,
  cardImageHeight: characters.cardImageHeight,
  skills: characters.skills,
} as const;

function toSummary(row: Pick<Character, keyof typeof summaryColumns>): CharacterSummary {
  return {
    id: row.externalId,
    name: row.name,
    slug: row.slug,
    rarity: row.rarity,
    element: row.element,
    weapon: row.weapon,
    role: row.role,
    manufacturer: row.manufacturer,
    squad: row.squad,
    burstType: row.burstType,
    isLimited: row.isLimited,
    limitedEvent: row.limitedEvent,
    smallImageUrl: row.smallImageUrl,
    cardImageUrl: row.cardImageUrl,
    smallImageWidth: row.smallImageWidth,
    smallImageHeight: row.smallImageHeight,
    cardImageWidth: row.cardImageWidth,
    cardImageHeight: row.cardImageHeight,
    skills: row.skills,
  };
}

function toDetail(row: Character): CharacterSummary {
  return {
    ...toSummary(row),
    fullImageUrl: row.fullImageUrl ?? undefined,
    fullImageWidth: row.fullImageWidth ?? undefined,
    fullImageHeight: row.fullImageHeight ?? undefined,
    releaseDate: row.releaseDate,
    weaponName: row.weaponName,
    ammoCapacity: row.ammoCapacity,
    reloadTime: row.reloadTime,
    controlMode: row.controlMode,
    backstory: row.backstory,
    cv: row.cv ?? undefined,
    basicAttackRaw: row.basicAttackRaw,
    harmonyCubesRaw: row.harmonyCubesRaw,
    skillsWithDetail: row.skillsWithDetail ?? undefined,
    specialities: row.specialities,
  };
}

export async function getCharacters(): Promise<CharacterSummary[]> {
  const rows = await db
    .select(summaryColumns)
    .from(characters)
    .orderBy(asc(characters.name));
  return rows.map(toSummary);
}

export async function getCharacterBySlug(
  slug: string,
): Promise<CharacterSummary | null> {
  const rows = await db
    .select(summaryColumns)
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);
  return rows[0] ? toSummary(rows[0]) : null;
}

export async function getCharacterDetailBySlug(
  slug: string,
): Promise<CharacterSummary | null> {
  const rows = await db
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);
  return rows[0] ? toDetail(rows[0]) : null;
}

export async function getCharacterSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: characters.slug })
    .from(characters)
    .orderBy(asc(characters.name));
  return rows.map((r) => r.slug);
}
