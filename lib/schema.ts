import {
  pgTable,
  text,
  boolean,
  integer,
  jsonb,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

// --- Shared JSON types ---

export type Skill = {
  cooldown: number | null;
  type: string;
  slot: string;
  name?: string;
  descriptionLevel10?: {
    raw?: string | null;
  } | null;
};

export type SkillWithDetail = Skill & {
  descriptionRaw?: string | null;
};

export type CV = {
  kr?: string | null;
  jpn?: string | null;
  en?: string | null;
};

// --- Table definition ---

export const characters = pgTable("characters", {
  slug: text().primaryKey(),
  externalId: text("external_id").notNull(),
  name: text().notNull(),
  rarity: text().notNull(),
  element: text().notNull(),
  weapon: text().notNull(),
  role: text().notNull(),
  manufacturer: text().notNull(),
  squad: text().notNull(),
  burstType: text("burst_type").notNull(),
  isLimited: boolean("is_limited"),
  limitedEvent: text("limited_event"),
  smallImageUrl: text("small_image_url").notNull(),
  cardImageUrl: text("card_image_url").notNull(),
  smallImageWidth: integer("small_image_width").notNull(),
  smallImageHeight: integer("small_image_height").notNull(),
  cardImageWidth: integer("card_image_width").notNull(),
  cardImageHeight: integer("card_image_height").notNull(),
  skills: jsonb().$type<Skill[]>().notNull(),
  fullImageUrl: text("full_image_url"),
  fullImageWidth: integer("full_image_width"),
  fullImageHeight: integer("full_image_height"),
  releaseDate: text("release_date"),
  weaponName: text("weapon_name"),
  ammoCapacity: integer("ammo_capacity"),
  reloadTime: real("reload_time"),
  controlMode: text("control_mode"),
  backstory: text(),
  cv: jsonb().$type<CV>(),
  basicAttackRaw: text("basic_attack_raw"),
  harmonyCubesRaw: text("harmony_cubes_raw"),
  skillsWithDetail: jsonb("skills_with_detail").$type<SkillWithDetail[]>(),
  specialities: text().array(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow(),
});

// --- Inferred types ---

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
