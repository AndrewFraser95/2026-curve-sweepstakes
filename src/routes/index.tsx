import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PARTICIPANTS, FLAGS, type Participant } from "@/lib/participants";
import { MANUAL_GOALS, fetchLive, type GoalsMap, type KnockoutMatch } from "@/lib/scores";
import { CursorTrail } from "@/components/CursorTrail";
import { Brackets } from "@/components/Brackets";
import { TopGoals } from "@/components/TopGoals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "🏆 World Cup 2026 Office Sweepstake 🏆" },
      {
        name: "description",
        content:
          "Totally rad World Cup 2026 office sweepstake. Live bracket, top goals, and the dreaded WOODEN SPOON. Auto-updating scores!",
      },
      { property: "og:title", content: "World Cup 2026 Office Sweepstake" },
      {
        property: "og:description",
        content: "Live knockout bracket, top goals so far, first & second place, and the wooden spoon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
    component: Sweepstake,
});

interface Standing extends Participant {
  goals: number;
  rank: number;
}

function computeStandings(goals: GoalsMap): Standing[] {
  const withTotals = PARTICIPANTS.map((p) => ({
    ...p,
    goals: (goals[p.teams[0]] ?? 0) + (goals[p.teams[1]] ?? 0),
  }));
  const sorted = [...withTotals].sort((a, b) => b.goals - a.goals);
  return sorted.map((s, i) => ({ ...s, rank: i + 1 }));
}

type Tab = "brackets" | "goals";

function Sweepstake() {
  const [goals, setGoals] = useState<GoalsMap>(MANUAL_GOALS);
  const [knockout, setKnockout] = useState<KnockoutMatch[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "manual">("loading");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [tab, setTab] = useState<Tab>("brackets");
  const [visitors, setVisitors] = useState<number | null>(null);

  async function refresh() {
    setStatus("loading");
    const live = await fetchLive();
    if (live) {
      setGoals(live.goals);
      setKnockout(live.knockout);
      setStatus("live");
    } else {
      setGoals(MANUAL_GOALS);
      setKnockout([]);
      setStatus("manual");
    }
    setUpdatedAt(new Date());
  }

  useEffect(() => {
    setVisitors(13337 + Math.floor(Math.random() * 900));
    refresh();
    const id = window.setInterval(refresh, 120000); // auto-refresh every 2 min
    return () => window.clearInterval(id);
  }, []);

  const standings = useMemo(() => computeStandings(goals), [goals]);
  const first = standings.find((s) => s.rank === 1);
  const second = standings.find((s) => s.rank === 2);
  const spoon = [...standings].sort((a, b) => a.goals - b.goals)[0];

  return (
    <div className="retro-page">
      <CursorTrail />

      {/* Marquee */}
      <div className="retro-marquee py-1 text-lg">
        <span>
          ⚽ WELCOME TO THE OFFICIAL OFFICE WORLD CUP 2026 SWEEPSTAKE ⚽ &nbsp;&nbsp; 🏆 WIN
          ETERNAL GLORY 🏆 &nbsp;&nbsp; 🥄 AVOID THE WOODEN SPOON 🥄 &nbsp;&nbsp; SCORES
          AUTO-UPDATE EVERY 2 MINUTES!! &nbsp;&nbsp; BEST VIEWED IN NETSCAPE NAVIGATOR @
          800x600 &nbsp;&nbsp;
        </span>
      </div>

      <div className="mx-auto max-w-6xl px-3 py-6">
        {/* Title */}
        <header className="text-center">
          <div className="retro-badge mb-2 text-sm">★ EST. 2026 ★</div>
          <h1 className="retro-wordart text-4xl sm:text-6xl">WORLD CUP SWEEPSTAKE</h1>
          <p className="retro-outline mt-2 text-lg">
            🌐 The <span className="retro-blink">#1</span> place for office footy glory 🌐
          </p>
        </header>

        {/* Status bar */}
        <div className="retro-panel mt-6 p-1">
          <div className="retro-titlebar flex items-center justify-between px-2 py-1 text-sm">
            <span>C:\SWEEPSTAKE\STANDINGS.EXE</span>
            <span>[ _ ] [ □ ] [ X ]</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <span className="retro-badge">
              {status === "loading"
                ? "⏳ FETCHING..."
                : status === "live"
                  ? "🟢 LIVE FEED"
                  : "📝 MANUAL SCORES"}
            </span>
            <span className="text-cyan-200">
              Last update: {updatedAt ? updatedAt.toLocaleTimeString() : "--:--:--"}
            </span>
            <button className="retro-btn ml-auto text-sm" onClick={refresh}>
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* Podium */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PodiumCard title="🥇 FIRST PLACE" subtitle="THE CHAMPION" s={first} accent="#ffd700" />
          <PodiumCard title="🥈 SECOND PLACE" subtitle="SO CLOSE!" s={second} accent="#c0c0c0" />
          <PodiumCard
            title="🥄 WOODEN SPOON"
            subtitle="FEWEST GOALS = SHAME"
            s={spoon}
            accent="#a0522d"
          />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          <TabButton active={tab === "brackets"} onClick={() => setTab("brackets")}>
            🗂️ Brackets
          </TabButton>
          <TabButton active={tab === "goals"} onClick={() => setTab("goals")}>
            ⚽ Top Goals So Far
          </TabButton>
        </div>

        <div className="retro-panel mt-2 p-1">
          <div className="retro-titlebar px-2 py-1 text-sm">
            {tab === "brackets" ? "🏟️ ROAD TO THE FINAL" : "📊 TOP GOALS SO FAR"}
          </div>
          <div className="p-3">
            {tab === "brackets" ? (
              <Brackets knockout={knockout} />
            ) : (
              <TopGoals goals={goals} />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm">
          <div className="retro-outline">🚧 THIS SITE IS UNDER CONSTRUCTION 🚧</div>
          <div className="mt-3 inline-block border-2 border-dashed border-lime-400 bg-black px-4 py-2 font-mono text-lime-400">
            👁️ You are visitor #{visitors?.toLocaleString() ?? "..."}
          </div>
          <p className="retro-outline mt-4 text-cyan-200">
            Scores via free public feed (openfootball). Edit <code>src/lib/scores.ts</code> to
            set them by hand. © 2026 — Made with 💾 &amp; ⚽
          </p>
        </footer>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`retro-btn text-base ${active ? "" : "opacity-70"}`}
      style={active ? { background: "#00ffff", borderColor: "#aef" } : undefined}
    >
      {children}
    </button>
  );
}

function PodiumCard({
  title,
  subtitle,
  s,
  accent,
}: {
  title: string;
  subtitle: string;
  s?: Standing;
  accent: string;
}) {
  return (
    <div className="retro-panel p-1">
      <div className="retro-titlebar px-2 py-1 text-center text-sm">{title}</div>
      <div className="p-4 text-center">
        <div className="retro-outline text-2xl font-bold" style={{ color: accent }}>
          {s ? s.name : "—"}
        </div>
        <div className="mt-1 font-mono text-3xl text-yellow-300">
          {s ? `${s.goals} ⚽` : "0 ⚽"}
        </div>
        {s && (
          <div className="mt-2 text-xs text-cyan-200">
            {FLAGS[s.teams[0]] ?? ""} {s.teams[0]} + {FLAGS[s.teams[1]] ?? ""} {s.teams[1]}
          </div>
        )}
        <div className="mt-2 text-xs text-pink-300">{subtitle}</div>
      </div>
    </div>
  );
}
