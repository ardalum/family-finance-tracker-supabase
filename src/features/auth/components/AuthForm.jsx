import { Eye, EyeOff, WalletCards } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import { isSupabaseConfigured } from "../../../lib/supabase/client.js";
import { getFriendlyAuthError } from "../authErrors.js";
import {
  AUTH_FORM_MODES,
  AUTH_FORM_STATUS_COPY,
  getAuthFormCopy,
  getNextAuthFormMode,
} from "../authFormCopy.js";
import { signInWithEmail, signUpWithEmail } from "../authService.js";

export default function AuthForm() {
  const [mode, setMode] = useState(AUTH_FORM_MODES.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === AUTH_FORM_MODES.signUp;
  const modeCopy = getAuthFormCopy(mode);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const result = await signUpWithEmail({ email, password });
        if (!result.session) {
          setStatus(AUTH_FORM_STATUS_COPY.signUpConfirmation);
        }
      } else {
        await signInWithEmail({ email, password });
      }
    } catch (currentError) {
      setError(getFriendlyAuthError(currentError, "Authentication failed."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4 py-10">
      <div className="grid w-full max-w-md gap-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1F2937] text-white shadow-sm">
            <WalletCards size={21} aria-hidden="true" />
            <span className="absolute bottom-2 right-2 h-1.5 w-5 rounded-full bg-[#10B981]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">
              <span className="text-[#1F2937]">Wallet</span>
              <span className="text-[#10B981]">Flow</span>
            </h1>
            <p className="text-sm text-[#6B7280]">Track your cards, budget, and spending in one clear place.</p>
          </div>
        </div>

        <Card>
          <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg font-semibold tracking-normal text-[#111827]">
                {modeCopy.title}
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">{modeCopy.description}</p>
            </div>

            {!isSupabaseConfigured ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
                Supabase environment variables are missing.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
                {error}
              </div>
            ) : null}

            {status ? (
              <div className="rounded-xl border border-green-200 bg-[#DCFCE7] px-3 py-2 text-sm text-[#166534]">
                {status}
              </div>
            ) : null}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
            <div className="grid gap-1.5">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-[#6B7280] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setShowPassword((current) => !current)}
                aria-pressed={showPassword}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                {showPassword ? "Hide password" : "Show password"}
              </button>
            </div>

            <Button type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
              {isSubmitting ? "Working..." : modeCopy.submitLabel}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMode((currentMode) => getNextAuthFormMode(currentMode));
                setError("");
                setStatus("");
              }}
              disabled={isSubmitting}
            >
              {modeCopy.switchModeLabel}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
