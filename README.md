# Nikke Character

Goddess of Victory: Nikke character database and tier list builder. Browse character stats, skills, lore, and build shareable tier lists.

## Features

- **Character Roster** — searchable grid with rarity, element, weapon, class, and burst type
- **Character Detail** — full stats, skills with descriptions, backstory, voice actors (EN/JP/KR), combat notes, harmony cubes
- **Tier List Builder** — drag-and-drop characters into S/A/B/C/D/E tiers, shareable via URL

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Database:** PostgreSQL on Neon (serverless)
- **ORM:** Drizzle ORM with `neon-http` adapter
- **Styling:** Tailwind CSS 4
- **URL State:** nuqs
- **Runtime:** Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- PostgreSQL database (e.g. [Neon](https://neon.tech))

### Setup

```bash
bun install
```

Create `.env.local`:

```
DATABASE_URL=postgresql://...
```

### Development

```bash
bun run dev
```

### Sync Characters

Fetch character data from Prydwen and insert new characters into the database:

```bash
bun run sync
```

### Build

```bash
bun run build
```

## Database

Schema is defined in `lib/schema.ts` using Drizzle ORM. Available scripts:

| Script | Description |
|---|---|
| `bun run db:push` | Push schema changes to the database |
| `bun run db:pull` | Introspect database into local schema |
| `bun run db:generate` | Generate SQL migration files |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:studio` | Open Drizzle Studio GUI |

## Project Structure

```
app/
  page.tsx              # Character list (home)
  [slug]/page.tsx       # Character detail
  tier-list/page.tsx    # Tier list builder
components/             # Shared React components
lib/
  schema.ts             # Drizzle table definition & types
  db.ts                 # Database connection
  characterData.ts      # Query functions
scripts/
  sync-characters.ts    # Data sync from Prydwen API
drizzle.config.ts       # Drizzle Kit configuration
```

## Data Flow

```
Prydwen API → sync script → PostgreSQL → Drizzle queries → Server Components → Browser
```

Characters are synced on-demand via `bun run sync` (insert-only-new strategy). Pages use ISR with revalidation caching for fast loads.
