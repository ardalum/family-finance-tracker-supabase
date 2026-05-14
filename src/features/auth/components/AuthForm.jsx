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
  getPasswordAutocomplete,
  isSignUpAuthFormMode,
} from "../authFormCopy.js";
import { AUTH_FORM_FEEDBACK_IDS } from "../authFormIds.js";
import { getAuthFormEmailValidationError, getAuthFormValidationError } from "../authFormValidation.js";
import { requestPasswordReset, signInWithEmail, signUpWithEmail } from "../authService.js";

export default function AuthForm() {
  const [mode, setMode] = useState(AUTH_FORM_MODES.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);

  const isSignUp = isSignUpAuthFormMode(mode);
  const modeCopy = getAuthFormCopy(mode);
  const passwordAutocomplete = getPasswordAutocomplete(mode);
  const feedbackDescriptionId = error
    ? AUTH_FORM_FEEDBACK_IDS.error
    : status
      ? AUTH_FORM_FEEDBACK_IDS.status
      : undefined;
  const passwordToggleLabel = showPassword ? "Hide password" : "Show password";
  const hasAuthFormError = Boolean(error);
  const isFormBusy = isSubmitting || isSendingResetLink;

  function resetAuthFormFeedback() {
    setError("");
    setStatus("");
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    resetAuthFormFeedback();
  }

  function handleEmailBlur() {
    setEmail((currentEmail) => currentEmail.trim());
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    resetAuthFormFeedback();
  }

  function handlePasswordVisibilityToggle() {
    setShowPassword((current) => !current);
  }

  function handleModeSwitch() {
    setMode((currentMode) => getNextAuthFormMode(currentMode));
    resetAuthFormFeedback();
  }

  function prepareAuthFormSubmit() {
    const normalizedEmail = email.trim();
    const validationError = getAuthFormValidationError({ email: normalizedEmail, password, mode });

    setEmail(normalizedEmail);

    return {
      normalizedEmail,
      validationError,
    };
  }

  async function handlePasswordResetRequest() {
    resetAuthFormFeedback();

    const normalizedEmail = email.trim();
    const validationError = getAuthFormEmailValidationError(normalizedEmail);
    setEmail(normalizedEmail);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSendingResetLink(true);

    try {
      await requestPasswordReset({ email: normalizedEmail });
      setStatus(AUTH_FORM_STATUS_COPY.passwordResetRequested);
    } catch (currentError) {
      setError(getFriendlyAuthError(currentError, "Could not send password reset email."));
    } finally {
      setIsSendingResetLink(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    resetAuthFormFeedback();

    const { normalizedEmail, validationError } = prepareAuthFormSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const result = await signUpWithEmail({ email: normalizedEmail, password });
        if (!result.session) {
          setStatus(AUTH_FORM_STATUS_COPY.signUpConfirmation);
        }
      } else {
        await signInWithEmail({ email: normalizedEmail, password });
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
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]"
                role="alert"
              >
                Supabase environment variables are missing.
              </div>
            ) : null}

            {error ? (
              <div
                id={AUTH_FORM_FEEDBACK_IDS.error}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {status ? (
              <div
                id={AUTH_FORM_FEEDBACK_IDS.status}
                className="rounded-xl border border-green-200 bg-[#DCFCE7] px-3 py-2 text-sm text-[#166534]"
                role="status"
                aria-live="polite"
              >
                {status}
              </div>
            ) : null}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              aria-describedby={feedbackDescriptionId}
              aria-invalid={hasAuthFormError}
              disabled={isFormBusy}
              required
            />
            <div className="grid gap-1.5">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete={passwordAutocomplete}
                value={password}
                onChange={handlePasswordChange}
                minLength={6}
                aria-describedby={feedbackDescriptionId}
                aria-invalid={hasAuthFormError}
                disabled={isFormBusy}
                required
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-[#6B7280] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handlePasswordVisibilityToggle}
                  aria-label={passwordToggleLabel}
                  aria-pressed={showPassword}
                  disabled={isFormBusy}
                >
                  {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                  {passwordToggleLabel}
                </button>
                {!isSignUp ? (
                  <button
                    type="button"
                    className="inline-flex w-fit rounded-lg px-1 text-xs font-semibold text-[#6B7280] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handlePasswordResetRequest}
                    disabled={isFormBusy || !isSupabaseConfigured}
                  >
                    {isSendingResetLink ? AUTH_FORM_STATUS_COPY.sendingResetLink : modeCopy.resetPasswordLabel}
                  </button>
                ) : null}
              </div>
            </div>

            <Button type="submit" disabled={isFormBusy || !isSupabaseConfigured}>
              {isSubmitting ? AUTH_FORM_STATUS_COPY.submitting : modeCopy.submitLabel}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleModeSwitch}
              disabled={isFormBusy}
            >
              {modeCopy.switchModeLabel}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
