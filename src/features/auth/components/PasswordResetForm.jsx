import { Eye, EyeOff, KeyRound, WalletCards } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import {
  AUTH_RECOVERY_FORM_COPY,
  AUTH_RECOVERY_FORM_STATUS_COPY,
  getRecoveryConfirmPasswordToggleLabel,
  getRecoveryPasswordToggleLabel,
} from "../authRecoveryCopy.js";
import { AUTH_RECOVERY_FORM_FEEDBACK_IDS } from "../authRecoveryIds.js";
import { submitRecoveryForm } from "../authRecoverySubmit.js";
import { getRecoveryFormValidationError } from "../authRecoveryValidation.js";

export default function PasswordResetForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFeedback = Boolean(error || status);
  const feedbackDescriptionId = hasFeedback ? AUTH_RECOVERY_FORM_FEEDBACK_IDS.feedback : undefined;
  const passwordToggleLabel = getRecoveryPasswordToggleLabel(showPassword);
  const confirmPasswordToggleLabel = getRecoveryConfirmPasswordToggleLabel(showConfirmPassword);

  function resetFeedback() {
    setError("");
    setStatus("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    resetFeedback();
  }

  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
    resetFeedback();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    resetFeedback();

    const validationError = getRecoveryFormValidationError({ password, confirmPassword });

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitRecoveryForm({ password });
      setStatus(result.status);
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
            <p className="text-sm text-[#6B7280]">{AUTH_RECOVERY_FORM_COPY.brandDescription}</p>
          </div>
        </div>

        <Card>
          <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                <KeyRound size={20} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold tracking-normal text-[#111827]">
                {AUTH_RECOVERY_FORM_COPY.title}
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">{AUTH_RECOVERY_FORM_COPY.description}</p>
            </div>

            {error ? (
              <div
                id={AUTH_RECOVERY_FORM_FEEDBACK_IDS.feedback}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {status ? (
              <div
                id={AUTH_RECOVERY_FORM_FEEDBACK_IDS.feedback}
                className="rounded-xl border border-green-200 bg-[#DCFCE7] px-3 py-2 text-sm text-[#166534]"
                role="status"
                aria-live="polite"
              >
                {status}
              </div>
            ) : null}

            <div className="grid gap-1.5">
              <Input
                label={AUTH_RECOVERY_FORM_COPY.passwordLabel}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={handlePasswordChange}
                minLength={6}
                aria-describedby={feedbackDescriptionId}
                aria-invalid={Boolean(error)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-[#6B7280] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={passwordToggleLabel}
                aria-pressed={showPassword}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                {passwordToggleLabel}
              </button>
            </div>

            <div className="grid gap-1.5">
              <Input
                label={AUTH_RECOVERY_FORM_COPY.confirmPasswordLabel}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                minLength={6}
                aria-describedby={feedbackDescriptionId}
                aria-invalid={Boolean(error)}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-[#6B7280] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={confirmPasswordToggleLabel}
                aria-pressed={showConfirmPassword}
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                {confirmPasswordToggleLabel}
              </button>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? AUTH_RECOVERY_FORM_STATUS_COPY.submitting : AUTH_RECOVERY_FORM_COPY.submitLabel}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
