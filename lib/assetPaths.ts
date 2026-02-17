const ELEMENT_MAP: Record<string, string> = {
  Electric: "electronic",
  Fire: "fire",
  Iron: "iron",
  Water: "water",
  Wind: "wind",
};

const WEAPON_MAP: Record<string, string> = {
  "Assault Rifle": "assault_rifle",
  Minigun: "machine_gun",
  "Rocket Launcher": "rocket_launcher",
  Shotgun: "shot_gun",
  SMG: "sub_machine_gun",
  "Sniper Rifle": "sniper_rifle",
};

const BURST_MAP: Record<string, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  All: "p",
};

const RARITY_COLOR: Record<string, string> = {
  SSR: "yellow",
  SR: "purple",
  R: "blue",
};

// role → set of available colors in assets
const ROLE_COLORS: Record<string, string[]> = {
  attacker: ["yellow"],
  defencer: ["yellow", "purple", "blue"],
  supporter: ["yellow", "blue"],
};

function normalizeRole(role: string): string | null {
  const lower = role.toLowerCase();
  if (lower === "attacker") return "attacker";
  if (lower === "defender" || lower === "defencer") return "defencer";
  if (lower === "supporter") return "supporter";
  return null;
}

export function getElementIconPath(element: string): string | null {
  const filename = ELEMENT_MAP[element];
  return filename ? `/assets/code/${filename}.png` : null;
}

export function getWeaponIconPath(weapon: string): string | null {
  const filename = WEAPON_MAP[weapon];
  return filename ? `/assets/weapon/${filename}.png` : null;
}

export function getBurstIconPath(burstType: string): string | null {
  const filename = BURST_MAP[burstType];
  return filename ? `/assets/burst/${filename}.png` : null;
}

export function getRoleIconPath(role: string, rarity: string): string | null {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return null;

  const color = RARITY_COLOR[rarity];
  if (!color) return null;

  const available = ROLE_COLORS[normalizedRole];
  if (!available) return null;

  // Use exact color if available, otherwise fall back to yellow
  const finalColor = available.includes(color) ? color : available[0];
  return `/assets/job/${normalizedRole}--${finalColor}.png`;
}

export function getCharacterIcons(character: {
  element: string;
  weapon: string;
  burstType: string;
  role: string;
  rarity: string;
}) {
  return {
    element: getElementIconPath(character.element),
    weapon: getWeaponIconPath(character.weapon),
    burst: getBurstIconPath(character.burstType),
    role: getRoleIconPath(character.role, character.rarity),
  };
}
