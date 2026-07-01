import type { KnockoutMatch } from "@/lib/scores";
import { TEAM_OWNER } from "@/lib/scores";
import { FLAGS } from "@/lib/participants";

// Round buckets in run-up-to-the-final order.
const ROUND_ORDER = [
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Final",
] as const;

function bucketOf(round: string): string | null {
  const r = round.toLowerCase();
  if (r.includes("32")) return "Round of 32";
  if (r.includes("16")) return "Round of 16";
  if (r.includes("quarter")) return "Quarter-finals";
  if (r.includes("semi")) return "Semi-finals";
  if (r.includes("third")) return null; // skip 3rd-place playoff in the tree
  if (r.includes("final")) return "Final";
  return null;
}

// Empty skeleton so the bracket always has a shape before knockouts begin.
const SKELETON: Record<string, number> = {
  "Round of 16": 8,
  "Quarter-finals": 4,
  "Semi-finals": 2,
  Final: 1,
};

function TeamLine({ team, score, winner }: { team: string; score: number | null; winner: boolean }) {
  const owner = team ? TEAM_OWNER[team] : undefined;
  return (
    <div
      className={`flex items-center justify-between gap-2 px-2 py-1 ${
        winner ? "bg-yellow-300 text-black" : "text-white"
      }`}
    >
      <span className="truncate">
        {team ? (FLAGS[team] ?? "🏳️") : "⬜"} {team || "TBD"}
        {owner && <span className="ml-1 text-[10px] text-cyan-300">({owner.split(" ")[0]})</span>}
      </span>
      <span className="font-bold">{score ?? "–"}</span>
    </div>
  );
}

function MatchCard({ m }: { m: KnockoutMatch | null }) {
  const s1 = m?.score1 ?? null;
  const s2 = m?.score2 ?? null;
  const decided = s1 !== null && s2 !== null && s1 !== s2;
  return (
    <div className="my-2 border-2 border-cyan-400 bg-[#000055] font-mono text-xs shadow-[3px_3px_0_#000]">
      <TeamLine team={m?.team1 ?? ""} score={s1} winner={decided && s1! > s2!} />
      <div className="border-t border-cyan-700" />
      <TeamLine team={m?.team2 ?? ""} score={s2} winner={decided && s2! > s1!} />
    </div>
  );
}

export function Brackets({ knockout }: { knockout: KnockoutMatch[] }) {
  const hasData = knockout.length > 0;

  // Group live matches into round buckets.
  const grouped: Record<string, KnockoutMatch[]> = {};
  for (const m of knockout) {
    const b = bucketOf(m.round);
    if (!b) continue;
    (grouped[b] ??= []).push(m);
  }

  const columns = ROUND_ORDER.filter((r) => grouped[r] || (!hasData && SKELETON[r]));

  return (
    <div>
      {!hasData && (
        <div className="mb-4 border-2 border-dashed border-yellow-300 bg-black p-3 text-center text-yellow-300">
          🔒 The bracket unlocks once the group stage ends. Placeholders shown until then!
        </div>
      )}
      <div className="flex gap-4 overflow-x-auto pb-3">
        {columns.map((round) => {
          const matches = grouped[round] ?? Array(SKELETON[round] ?? 0).fill(null);
          return (
            <div key={round} className="min-w-[190px] flex-shrink-0">
              <div className="retro-titlebar mb-2 px-2 py-1 text-center text-xs">
                {round === "Final" ? "🏆 FINAL" : round.toUpperCase()}
              </div>
              <div className="flex h-full flex-col justify-around">
                {matches.map((m: KnockoutMatch | null, i: number) => (
                  <MatchCard key={i} m={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
