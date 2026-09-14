import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Mode = "sign-in" | "sign-up";

const ASCII_ONLY = /^[\x20-\x7E]+$/;

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError(null);
    setInfo(null);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "sign-up") {
      const trimmedName = displayName.trim();
      if (!trimmedName) {
        setError("Display name is required.");
        return;
      }
      if (!ASCII_ONLY.test(trimmedName)) {
        setError("Display name can only use plain ASCII letters, numbers, and punctuation.");
        return;
      }
      setSubmitting(true);
      // Escape LIKE/ILIKE wildcards so a name containing "%" or "_" is
      // checked as a literal string, not a pattern.
      const escapedName = trimmedName.replace(/[\\%_]/g, (c) => `\\${c}`);
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .ilike("display_name", escapedName)
        .maybeSingle();
      if (existing) {
        setSubmitting(false);
        setError("That display name is already taken.");
        return;
      }
    } else {
      setSubmitting(true);
    }

    if (mode === "sign-in") {
      const result = await signIn(email, password);
      setSubmitting(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      handleOpenChange(false);
      return;
    }

    const result = await signUp(email, password, displayName.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Email confirmation may be disabled, in which case signUp already
    // signed the user in and there's nothing left to confirm.
    if (result.signedIn) {
      handleOpenChange(false);
      return;
    }

    setInfo("Account created. Check your email to confirm, then sign in.");
    setMode("sign-in");
    setPassword("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm border border-white/15 bg-[#0D0D0D] text-white p-8 rounded-none shadow-none">
        <DialogTitle className="font-display text-3xl uppercase tracking-tight leading-none">
          {mode === "sign-in" ? "Sign In" : "Create Account"}
        </DialogTitle>
        <DialogDescription className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          {mode === "sign-in" ? "Access your telemetry." : "Register to save your scores."}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {mode === "sign-up" && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-display-name"
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40"
              >
                Display Name
              </label>
              <input
                id="auth-display-name"
                type="text"
                required
                maxLength={30}
                pattern="[\x20-\x7E]+"
                title="Plain ASCII letters, numbers, and punctuation only"
                autoComplete="nickname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-transparent border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-racing-red transition-colors"
              />
              <p className="text-white/30 text-[11px]">
                Shown on the leaderboard. Your email stays private.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-email"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-racing-red transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-password"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border border-white/15 px-3 py-2 text-sm text-white outline-none focus:border-racing-red transition-colors"
            />
          </div>

          {error && <p className="text-racing-red text-xs">{error}</p>}
          {info && <p className="text-racing-green text-xs">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-white text-black font-display text-lg uppercase tracking-wide hover:bg-racing-red hover:text-white transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            {submitting ? "Working..." : mode === "sign-in" ? "Sign In" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => switchMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            className="text-center text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            {mode === "sign-in" ? "No account? Create one" : "Already have an account? Sign in"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
