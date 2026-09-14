import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [{ title: "Leaderboard — Guess the Porsche" }],
  }),
  component: Leaderboard,
});

type LeaderboardRow = {
  user_id: string;
  display_name: string;
  best_score: number;
  games_played: number;
};

function Leaderboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("user_id, display_name, best_score, games_played")
        .order("best_score", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as LeaderboardRow[];
    },
  });

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-body">
      <nav className="sticky top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/15 px-6 py-4 flex justify-between items-end">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Standings
          </span>
          <span className="font-display text-3xl leading-none uppercase tracking-tight">
            Leaderboard
          </span>
        </div>
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-white/40 hover:text-racing-red transition-colors"
        >
          &larr; Back to Quiz
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {isLoading && (
          <p className="font-mono text-sm text-white/40">Loading standings...</p>
        )}

        {error && (
          <p className="font-mono text-sm text-racing-red">
            Could not load the leaderboard. Try again shortly.
          </p>
        )}

        {data && data.length === 0 && (
          <p className="font-mono text-sm text-white/40">
            No scores yet. Be the first to set a time.
          </p>
        )}

        {data && data.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/15 text-left">
                <th className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 py-3 pr-4">
                  Rank
                </th>
                <th className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 py-3 pr-4">
                  Driver
                </th>
                <th className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 py-3 pr-4">
                  Best Score
                </th>
                <th className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 py-3">
                  Runs
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.user_id} className="border-b border-white/10">
                  <td className="font-display text-xl py-4 pr-4 text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="font-display text-xl py-4 pr-4 uppercase tracking-tight">
                    {row.display_name}
                  </td>
                  <td className="font-mono text-sm py-4 pr-4">
                    {row.best_score.toLocaleString()}
                  </td>
                  <td className="font-mono text-sm py-4 text-white/40">{row.games_played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
