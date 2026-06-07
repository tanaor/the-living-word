import { useState } from "react";

interface SetNewPasswordPageProps {
  onUpdatePassword: (password: string) => Promise<void>;
}

export default function SetNewPasswordPage({
  onUpdatePassword,
}: SetNewPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await onUpdatePassword(password);
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
            className="h-10 mx-auto mb-6"
            style={{ filter: "brightness(0.55)" }}
          />
          <h1 className="text-3xl font-serif text-amber-900 mb-2">
            Choose a new password
          </h1>
          <p className="text-amber-700 text-sm">
            Enter it twice and you'll be signed in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white
                       text-amber-900 placeholder-amber-400
                       focus:outline-none focus:ring-2 focus:ring-amber-300"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white
                       text-amber-900 placeholder-amber-400
                       focus:outline-none focus:ring-2 focus:ring-amber-300"
          />

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-700 text-white font-medium
                       hover:bg-amber-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
