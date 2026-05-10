import { CreditCard } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import { isSupabaseConfigured } from "../../../lib/supabase/client.js";
import { signInWithEmail, signUpWithEmail } from "../authService.js";

export default function AuthForm() {
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const result = await signUpWithEmail({ email, password });
        if (!result.session) {
          setStatus("Account created. Check your email to confirm your address, then sign in.");
        }
      } else {
        await signInWithEmail({ email, password });
      }
    } catch (currentError) {
      setError(currentError.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-100 px-4 py-10">
      <div className="grid w-full max-w-md gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-950 text-white">
            <CreditCard size={20} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-gray-950">Finance Tracker</h1>
            <p className="text-sm text-gray-500">Sign in to use your personal finance tools</p>
          </div>
        </div>

        <Card>
          <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-gray-950">
                {isSignUp ? "Create account" : "Sign in"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Your tracker data stays in this browser for now after you sign in.
              </p>
            </div>

            {!isSupabaseConfigured ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Supabase environment variables are missing.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {status ? (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {status}
              </div>
            ) : null}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />

            <Button type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
              {isSubmitting ? "Working..." : isSignUp ? "Create account" : "Sign in"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMode(isSignUp ? "sign-in" : "sign-up");
                setError("");
                setStatus("");
              }}
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
