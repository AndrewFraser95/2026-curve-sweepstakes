import { useMemo } from "react";
import { PARTICIPANTS, FLAGS } from "@/lib/participants";
import { TEAM_OWNER, type GoalsMap } from "@/lib/scores";

export function TopGoals({ goals }: { goals: GoalsMap }) {
  const topNations = useMemo(
    () =>
      Object.entries(goals)
        .map(([team, g]) => ({ team, g }))
        .filter((x) => x.g > 0)
        .sort((a, b) => b.g - a.g)
        .slice(0, 12),
    [goals],
  );

  const players = useMemo(
    () =>
      PARTICIPANTS.map((p) => ({
        name: p.name,
        teams: p.teams,
        goals: (goals[p.teams[0]] ?? 0) + (goals[p.teams[1]] ?? 0),
      })).sort((a, b) => b.goals - a.goals),
    [goals],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Top scoring nations */}
      <div className="retro-panel p-1">
        <div className="retro-titlebar px-2 py-1 text-sm">⚽ TOP SCORING NATIONS</div>
        <div className="p-2">
          {topNations.length === 0 ? (
            <p className="p-3 text-center font-mono text-cyan-200">
              No goals scored yet — kick-off soon!
            </p>
          ) : (
            <table className="retro-table text-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nation</th>
                  <th>Owner</th>
                  <th>Goals</th>
                </tr>
              </thead>
              <tbody>
                {topNations.map((n, i) => (
                  <tr key={n.team}>
                    <td className="text-center font-bold">{i + 1}</td>
                    <td>
                      {FLAGS[n.team] ?? "🏳️"} {n.team}
                    </td>
                    <td className="text-xs">{TEAM_OWNER[n.team] ?? "—"}</td>
                    <td className="text-center text-lg font-bold">{n.g}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Player league table */}
      <div className="retro-panel p-1">
        <div className="retro-titlebar px-2 py-1 text-sm">🏆 PLAYER LEAGUE TABLE</div>
        <div className="overflow-x-auto p-2">
          <table className="retro-table text-sm">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Player</th>
                <th>Teams</th>
                <th>Goals</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => {
                const isLast = i === players.length - 1;
                const cls =
                  i === 0
                    ? "retro-row-1st"
                    : i === 1
                      ? "retro-row-2nd"
                      : isLast
                        ? "retro-row-spoon"
                        : "";
                return (
                  <tr key={p.name} className={cls}>
                    <td className="text-center font-bold">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : isLast ? "🥄" : i + 1}
                    </td>
                    <td>{p.name}</td>
                    <td className="text-xs">
                      {FLAGS[p.teams[0]]} {p.teams[0]} · {FLAGS[p.teams[1]]} {p.teams[1]}
                    </td>
                    <td className="text-center text-lg font-bold">{p.goals}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
