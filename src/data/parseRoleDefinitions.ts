/** Visible Role cells: CSV tier-1…Tier-5. Staff (Tier-6) is omitted. */
export const VISIBLE_TIER_HEADERS = [
  "tier-1",
  "tier-2",
  "Tier-3",
  "Tier-4",
  "Tier-5",
] as const;

export const VISIBLE_TIER_COUNT = VISIBLE_TIER_HEADERS.length;

export type RoleTier = {
  header: (typeof VISIBLE_TIER_HEADERS)[number];
  rank: string;
  description: string;
};

export type RoleSkill = {
  id: string;
  title: string;
  definition: string;
  tiers: string[];
};

export type RoleDiscipline = {
  discipline: string;
  definition: string;
  tiers: RoleTier[];
  skills: RoleSkill[];
};

function parseCsvRecords(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

export function splitTierRank(rank: string): { numeral: string; subtitle: string } {
  const match = rank.match(/^([IVXLCDM]+)\s*(?:\((.+)\)|(.+))$/i);
  if (!match) return { numeral: "", subtitle: rank };
  return { numeral: match[1], subtitle: (match[2] ?? match[3] ?? "").trim() };
}

function splitRankDescription(raw: string): { rank: string; description: string } {
  const index = raw.indexOf("*");
  if (index === -1) {
    return { rank: raw.trim(), description: "" };
  }
  return {
    rank: raw.slice(0, index).trim(),
    description: raw.slice(index + 1).trim(),
  };
}

function headerIndex(headers: string[], name: string) {
  const lower = name.toLowerCase();
  return headers.findIndex((header) => header.trim().toLowerCase() === lower);
}

export const NEW_ROLE_LABEL = "-- New Role --";

export function listRoleNames(disciplines: RoleDiscipline[]): string[] {
  const names = disciplines.map((role) => role.discipline);
  const rest = names.filter((name) => name !== NEW_ROLE_LABEL);
  return names.includes(NEW_ROLE_LABEL) ? [...rest, NEW_ROLE_LABEL] : rest;
}

export function parseRoleDefinitions(csv: string): RoleDiscipline[] {
  const records = parseCsvRecords(csv);
  if (records.length < 2) return [];
  const headers = records[0].map((header) => header.trim());
  const disciplineIndex = headerIndex(headers, "discipline");
  const skillIndex = headerIndex(headers, "skill");
  const definitionIndex = headerIndex(headers, "definition");
  const tierIndexes = VISIBLE_TIER_HEADERS.map((name) => headerIndex(headers, name));
  if (
    disciplineIndex < 0 ||
    skillIndex < 0 ||
    definitionIndex < 0 ||
    tierIndexes.some((index) => index < 0)
  ) {
    return [];
  }

  const disciplines: RoleDiscipline[] = [];
  let current: RoleDiscipline | null = null;

  for (const record of records.slice(1)) {
    const discipline = (record[disciplineIndex] ?? "").trim();
    const skill = (record[skillIndex] ?? "").trim();
    const definition = (record[definitionIndex] ?? "").trim();
    const tierCells = tierIndexes.map((index) => (record[index] ?? "").trim());

    if (discipline) {
      current = {
        discipline,
        definition,
        tiers: tierCells.map((cell, index) => {
          const split = splitRankDescription(cell);
          return {
            header: VISIBLE_TIER_HEADERS[index],
            rank: split.rank,
            description: split.description,
          };
        }),
        skills: [],
      };
      disciplines.push(current);
      continue;
    }

    if (!current || !skill || skill.toLowerCase() === "role") continue;
    current.skills.push({
      id: skill,
      title: skill,
      definition,
      tiers: tierCells,
    });
  }

  return disciplines;
}

export function defaultSkillRatings(discipline: RoleDiscipline): Record<string, number> {
  const ratings: Record<string, number> = {};
  for (const skill of discipline.skills) {
    ratings[skill.id] = 1;
  }
  return ratings;
}
