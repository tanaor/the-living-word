import { useState } from "react";

interface AuthPageProps {
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
}

type Mode = "signUp" | "signIn" | "forgot";

export default function AuthPage({ onSignUp, onSignIn, onResetPassword }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const isSignUp = mode === "signUp";
  const isForgot = mode === "forgot";

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isForgot) {
        await onResetPassword(email);
        setResetSent(true);
      } else if (isSignUp) {
        await onSignUp(email, password, name);
      } else {
        await onSignIn(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/tanaor-logo.png"
            alt="Tanaor"
            className="h-10 mx-auto mb-6" style={{ filter: "brightness(0.55)" }}
          />
          <h1 className="text-3xl font-serif text-amber-900 mb-2">
            The Living Word
          </h1>
          <p className="text-amber-700 text-sm">
            A friend for every season of your faith.
          </p>
        </div>

        {isForgot && resetSent ? (
          <div className="text-center space-y-4">
            <p className="text-amber-800 text-sm leading-relaxed">
              If an account exists for <span className="font-medium">{email}</span>,
              we've sent a link to reset your password. Check your inbox (and your
              spam folder) and follow the link to choose a new one.
            </p>
            <button
              onClick={() => switchMode("signIn")}
              className="w-full text-sm text-amber-600 hover:text-amber-800"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white
                             text-amber-900 placeholder-amber-400
                             focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              )}

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white
                           text-amber-900 placeholder-amber-400
                           focus:outline-none focus:ring-2 focus:ring-amber-300"
              />

              {!isForgot && (
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white
                             text-amber-900 placeholder-amber-400
                             focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              )}

              {!isSignUp && !isForgot && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="block ml-auto text-sm text-amber-600 hover:text-amber-800"
                >
                  Forgot password?
                </button>
              )}

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-700 text-white font-medium
                           hover:bg-amber-800 disabled:opacity-50 transition-colors"
              >
                {loading
                  ? "..."
                  : isForgot
                    ? "Send reset link"
                    : isSignUp
                      ? "Begin Your Journey"
                      : "Welcome Back"}
              </button>
            </form>

            {isForgot ? (
              <button
                onClick={() => switchMode("signIn")}
                className="w-full mt-4 text-sm text-amber-600 hover:text-amber-800"
              >
                Back to sign in
              </button>
            ) : (
              <button
                onClick={() => switchMode(isSignUp ? "signIn" : "signUp")}
                className="w-full mt-4 text-sm text-amber-600 hover:text-amber-800"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
