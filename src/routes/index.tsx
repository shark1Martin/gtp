import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildQuiz, resolveCarImage, MODELS, type Question } from "@/lib/quiz-data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { AuthDialog } from "@/components/auth-dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Guess the Porsche — Model ID Quiz" },
      {
        name: "description",
        content:
          "A precision motorsport-style quiz: identify iconic Porsche models from a single studio image. Ten rounds. No mercy.",
      },
      { property: "og:title", content: "Guess the Porsche — Model ID Quiz" },
      {
        property: "og:description",
        content:
          "Ten rounds. Four options. Identify the Porsche from a single studio image.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TOTAL = MODELS.length;
const POINTS_PER_CORRECT = 450;

function Index() {
  const { user, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [seed, setSeed] = useState(0);
  const questions = useMemo<Question[]>(() => buildQuiz(TOTAL), [seed]);
  const [current, setCurrent] = useState(0);
  const [angleIndex, setAngleIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<"answering" | "revealed" | "done">("answering");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedRunRef = useRef(-1);

  const q = questions[current];
  const angleCount = q?.answer.angles.length ?? 1;
  const currentAngle = q?.answer.angles[angleIndex % angleCount];
  const carImage = useMemo(
    () => (q && currentAngle ? resolveCarImage(q.answer.id, currentAngle) : undefined),
    [q?.answer.id, currentAngle],
  );
  const score = correctCount * POINTS_PER_CORRECT;
  const accuracy = current === 0 && phase === "answering" ? 0 : Math.round((correctCount / (phase === "answering" ? current : current + 1)) * 100);

  useEffect(() => {
    if (phase !== "done" || !user || savedRunRef.current === seed) return;
    savedRunRef.current = seed;
    setSaveState("saving");
    supabase
      .from("scores")
      .insert({ user_id: user.id, correct_count: correctCount, total: TOTAL, score })
      .then(({ error }) => setSaveState(error ? "error" : "saved"));
  }, [phase, user, seed, correctCount, score]);

  function handleSelect(i: number) {
    if (phase !== "answering") return;
    setSelected(i);
    setPhase("revealed");
    if (i === q.correctIndex) setCorrectCount((c) => c + 1);
  }

  function handleNext() {
    if (current + 1 >= TOTAL) {
      setPhase("done");
      return;
    }
    setCurrent((c) => c + 1);
    setAngleIndex(0);
    setSelected(null);
    setPhase("answering");
  }

  function handleRestart() {
    setSeed((s) => s + 1);
    setCurrent(0);
    setAngleIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setPhase("answering");
    setSaveState("idle");
  }

  function cycleAngle(direction: 1 | -1) {
    setAngleIndex((i) => (i + direction + angleCount) % angleCount);
  }

  const isCorrect = selected !== null && selected === q?.correctIndex;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-body selection:bg-racing-red selection:text-white">
      {/* Global Status Bar */}
      <nav className="sticky top-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/15 px-6 py-4 flex justify-between items-end animate-entrance">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Competition Quiz
          </span>
          <span className="font-display text-3xl leading-none uppercase tracking-tight">
            Stuttgart / IDENT
          </span>
        </div>

        <div className="flex gap-8 sm:gap-12 items-end">
          <div className="text-right hidden sm:block">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
              Progress
            </div>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL }).map((_, i) => {
                const done = phase === "done";
                const cls =
                  done || i < current
                    ? "bg-racing-red"
                    : i === current
                      ? "bg-white/60"
                      : "bg-white/15";
                return <div key={i} className={`h-1 w-3 sm:w-5 ${cls}`} />;
              })}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              Points
            </div>
            <div className="font-display text-3xl leading-none">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="text-right hidden md:block">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
              Standings
            </div>
            <Link
              to="/leaderboard"
              className="font-mono text-xs uppercase tracking-widest hover:text-racing-red transition-colors"
            >
              Leaderboard
            </Link>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
              Account
            </div>
            {user ? (
              <button
                onClick={() => signOut()}
                className="font-mono text-xs uppercase tracking-widest hover:text-racing-red transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="font-mono text-xs uppercase tracking-widest hover:text-racing-red transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />

      {phase === "done" ? (
        <ResultsScreen
          correctCount={correctCount}
          total={TOTAL}
          score={score}
          onRestart={handleRestart}
          isSignedIn={!!user}
          saveState={saveState}
          onSignIn={() => setAuthOpen(true)}
        />
      ) : (
        <main className="max-w-6xl mx-auto px-6 pt-12 pb-32 grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          {/* Question Hero */}
          <section key={current} className="space-y-8 animate-entrance">
            <div className="relative">
              {/* Viewfinder Corners */}
              <div className="absolute -top-2 -left-2 size-8 border-t-2 border-l-2 border-racing-red z-10" />
              <div className="absolute -bottom-2 -right-2 size-8 border-b-2 border-r-2 border-racing-red z-10" />

              <div className="relative w-full aspect-[16/10] bg-zinc-900 overflow-hidden ring-1 ring-white/10">
                <img
                  src={carImage?.path}
                  alt="Identify this Porsche"
                  width={1280}
                  height={800}
                  className="w-full h-full object-cover"
                />

                {angleCount > 1 && (
                  <>
                    <button
                      onClick={() => cycleAngle(-1)}
                      aria-label="Previous angle"
                      className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/15 bg-[#0D0D0D]/70 backdrop-blur-sm p-2 text-white hover:border-racing-red hover:text-racing-red transition-colors cursor-pointer"
                    >
                      &#8249;
                    </button>
                    <button
                      onClick={() => cycleAngle(1)}
                      aria-label="Next angle"
                      className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/15 bg-[#0D0D0D]/70 backdrop-blur-sm p-2 text-white hover:border-racing-red hover:text-racing-red transition-colors cursor-pointer"
                    >
                      &#8250;
                    </button>

                    <div className="absolute bottom-6 right-6 flex gap-1.5">
                      {q.answer.angles.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 ${
                            i === angleIndex % angleCount ? "bg-racing-red" : "bg-white/25"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Overlay Label */}
              <div className="absolute bottom-6 left-6 bg-[#0D0D0D] px-4 py-2 border border-white/15">
                <span className="font-mono text-xs uppercase tracking-widest">
                  Frame {String(current + 1).padStart(2, "0")}/{TOTAL}
                </span>
              </div>

              {carImage?.credit && (
                <a
                  href={carImage.credit.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 font-mono text-[10px] text-white/30 hover:text-white/70 transition-colors bg-[#0D0D0D]/60 px-2 py-1"
                >
                  Photo: {carImage.credit.photographer} &#8226; {carImage.credit.license}
                </a>
              )}
            </div>

            <div className="max-w-2xl">
              <h1 className="font-display text-5xl md:text-6xl uppercase leading-[0.9] tracking-tighter text-balance mb-4">
                Identify the model shown.
              </h1>
              <p className="text-white/40 text-lg leading-relaxed text-pretty">
                {phase === "revealed"
                  ? isCorrect
                    ? `Correct. ${q.answer.name}.`
                    : `Miss. This is a ${q.answer.name}.`
                  : "Study the silhouette, proportions, and lamp cluster. Four candidates, one right answer."}
              </p>
            </div>
          </section>

          {/* Selection Panel */}
          <section className="space-y-4 animate-entrance lg:sticky lg:top-32">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6 px-1">
              Select Configuration
            </div>

            <div className="flex flex-col gap-3">
              {q.options.map((opt, i) => {
                const isSelected = selected === i;
                const isTheCorrectOne = i === q.correctIndex;
                const revealed = phase === "revealed";

                let stateClass =
                  "border border-white/15 hover:border-racing-red active:animate-snap";
                if (revealed && isTheCorrectOne) {
                  stateClass =
                    "border-2 border-racing-green bg-racing-green/10";
                } else if (revealed && isSelected && !isTheCorrectOne) {
                  stateClass = "border-2 border-racing-red bg-racing-red/10";
                } else if (revealed) {
                  stateClass = "border border-white/10 opacity-40";
                }

                return (
                  <button
                    key={opt.name}
                    onClick={() => handleSelect(i)}
                    disabled={revealed}
                    className={`group relative flex items-center justify-between p-5 transition-all duration-200 cursor-pointer text-left disabled:cursor-default ${stateClass}`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-display text-xl ${
                          revealed && isTheCorrectOne
                            ? "text-racing-green"
                            : revealed && isSelected
                              ? "text-racing-red"
                              : "text-white/40 group-hover:text-racing-red transition-colors"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-xl md:text-2xl uppercase tracking-tight">
                        {opt.name}
                      </span>
                    </div>
                    <div
                      className={`size-2 ${
                        revealed && isTheCorrectOne
                          ? "bg-racing-green animate-pulse"
                          : revealed && isSelected
                            ? "bg-racing-red"
                            : "bg-white/15 group-hover:bg-racing-red"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {phase === "revealed" && (
              <div className="pt-8 mt-8 border-t border-white/15 flex flex-col gap-6 animate-entrance">
                <div className="flex justify-between items-center">
                  <div
                    className={`font-bold uppercase tracking-tighter text-sm italic ${isCorrect ? "text-racing-green" : "text-racing-red"}`}
                  >
                    {isCorrect ? "Engagement Confirmed" : "Misidentification"}
                  </div>
                  <div className="text-white font-mono text-xs">
                    {isCorrect ? `+${POINTS_PER_CORRECT} PTS` : "+0 PTS"}
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-white text-black font-display text-2xl uppercase tracking-wide hover:bg-racing-red hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  {current + 1 >= TOTAL ? "View Results" : "Initialize Next Sequence"}
                </button>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full px-6 py-4 flex justify-between items-center pointer-events-none opacity-40">
        <div className="font-mono text-[9px] uppercase tracking-[0.4em]">
          Telemetry System v4.02 // Renn-Digital
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.4em] hidden sm:block">
          Accuracy {accuracy}%
        </div>
      </footer>
    </div>
  );
}

function ResultsScreen({
  correctCount,
  total,
  score,
  onRestart,
  isSignedIn,
  saveState,
  onSignIn,
}: {
  correctCount: number;
  total: number;
  score: number;
  onRestart: () => void;
  isSignedIn: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  onSignIn: () => void;
}) {
  const accuracy = Math.round((correctCount / total) * 100);
  const grade =
    accuracy === 100
      ? "Werksfahrer"
      : accuracy >= 80
        ? "Pro Driver"
        : accuracy >= 60
          ? "Enthusiast"
          : accuracy >= 40
            ? "Apprentice"
            : "Recruit";

  return (
    <main className="max-w-4xl mx-auto px-6 pt-16 pb-32 animate-entrance">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">
        Session Complete
      </div>
      <h1 className="font-display text-6xl md:text-8xl uppercase leading-[0.85] tracking-tighter mb-12">
        Debrief.
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-white/15 py-10 mb-12">
        <Stat label="Correct" value={`${correctCount}/${total}`} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Score" value={score.toLocaleString()} />
        <Stat label="Rank" value={grade} />
      </div>

      <div className="mb-8 font-mono text-xs uppercase tracking-widest">
        {isSignedIn ? (
          saveState === "saved" ? (
            <span className="text-racing-green">
              Score saved.{" "}
              <Link to="/leaderboard" className="underline hover:text-white">
                View leaderboard
              </Link>
            </span>
          ) : saveState === "error" ? (
            <span className="text-racing-red">Could not save your score. Try again next run.</span>
          ) : (
            <span className="text-white/40">Saving score...</span>
          )
        ) : (
          <span className="text-white/40">
            <button onClick={onSignIn} className="underline hover:text-racing-red cursor-pointer">
              Sign in
            </button>{" "}
            to save this score and appear on the leaderboard.
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRestart}
          className="flex-1 py-5 bg-racing-red text-white font-display text-2xl uppercase tracking-wide hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer"
        >
          Run Another Session
        </button>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        {label}
      </div>
      <div className="font-display text-3xl md:text-4xl uppercase leading-none tracking-tight">
        {value}
      </div>
    </div>
  );
}
