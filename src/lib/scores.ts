/* eslint-disable no-constant-binary-expression */
import { ALL_TEAMS, PARTICIPANTS } from "./participants";

export type GoalsMap = Record<string, number>;

export interface KnockoutMatch {
  round: string;
  team1: string;
  team2: string;
  score1: number | null;
  score2: number | null;
}

export interface LiveData {
  goals: GoalsMap;
  knockout: KnockoutMatch[];
}

// ---------------------------------------------------------------------------
// MANUAL FALLBACK SCORES
// ---------------------------------------------------------------------------
// Used when the live feed can't be reached. To update by hand: change the goal
// totals below, commit, and push. Perfect for a GitHub Pages workflow.
// ---------------------------------------------------------------------------
export const MANUAL_GOALS: GoalsMap = ALL_TEAMS.reduce((acc, t) => {
  acc[t] = 0;
  return acc;
}, {} as GoalsMap);

// team -> owning sweepstake player
export const TEAM_OWNER: Record<string, string> = PARTICIPANTS.reduce(
  (acc, p) => {
    acc[p.teams[0]] = p.name;
    acc[p.teams[1]] = p.name;
    return acc;
  },
  {} as Record<string, string>,
);

// Maps the tournament feed's country spelling -> our participant spelling.
const ALIASES: Record<string, string> = {
  USA: "United States",
  "United States of America": "United States",
  "South Korea": "Korea Republic",
  "Korea, South": "Korea Republic",
  "Ivory Coast": "Côte d'Ivoire",
  "Cote d'Ivoire": "Côte d'Ivoire",
  "DR Congo": "Congo DR",
  "Congo DR": "Congo DR",
  "Democratic Republic of the Congo": "Congo DR",
  "Cape Verde": "Cabo Verde",
  Turkey: "Türkiye",
  Turkiye: "Türkiye",
  Curacao: "Curaçao",
  "Czech Republic": "Czechia",
};

const teamSet = new Set(ALL_TEAMS);
function normalise(name: string): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (teamSet.has(trimmed)) return trimmed;
  if (ALIASES[trimmed] && teamSet.has(ALIASES[trimmed])) return ALIASES[trimmed];
  return null;
}

// Free, key-less public JSON feed (openfootball).
const FEED_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

interface FeedMatch {
  round?: string;
  team1?: string | { name?: string };
  team2?: string | { name?: string };
  score?: { ft?: [number, number] };
}
interface FeedData {
  rounds?: { name?: string; matches?: FeedMatch[] }[];
  matches?: FeedMatch[];
}

function teamName(t: FeedMatch["team1"]): string {
  if (!t) return "";
  return typeof t === "string" ? t : (t.name ?? "");
}

const KNOCKOUT_KEYWORDS = ["round of", "final", "quarter", "semi", "third"];
function isKnockout(round: string): boolean {
  const r = round.toLowerCase();
  return KNOCKOUT_KEYWORDS.some((k) => r.includes(k));
}

/**
 * Fetch live results from the free public feed. Totals goals per nation and
 * collects knockout-stage fixtures for the bracket. Returns null if the feed
 * is unavailable or has no usable data yet.
 */
export async function fetchLive(): Promise<LiveData | null> {
  try {
    const res = await fetch(FEED_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const data: FeedData = await res.json();

    const rounds: { name: string; matches: FeedMatch[] }[] = [];
    if (data.rounds) {
      for (const r of data.rounds) rounds.push({ name: r.name ?? "", matches: r.matches ?? [] });
    }
    if (data.matches) rounds.push({ name: "", matches: data.matches });
    if (rounds.length === 0) return null;

    const goals: GoalsMap = { ...MANUAL_GOALS };
    const knockout: KnockoutMatch[] = [];
    let counted = 0;

    for (const round of rounds) {
      for (const m of round.matches) {
        const rawT1 = teamName(m.team1);
        const rawT2 = teamName(m.team2);
        const t1 = normalise(rawT1);
        const t2 = normalise(rawT2);
        const ft = m.score?.ft;

        if (ft && ft.length >= 2) {
          if (t1) goals[t1] += Number(ft[0]) || 0;
          if (t2) goals[t2] += Number(ft[1]) || 0;
          if (t1 || t2) counted += 1;
        }

        const roundName = round.name || m.round || "";
        if (roundName && isKnockout(roundName)) {
          knockout.push({
            round: roundName,
            team1: t1 ?? rawT1,
            team2: t2 ?? rawT2,
            score1: ft ? (Number(ft[0]) ?? null) : null,
            score2: ft ? (Number(ft[1]) ?? null) : null,
          });
        }
      }
    }

    if (counted === 0 && knockout.length === 0) return null;
    return { goals, knockout };
  } catch {
    return null;
  }
}
