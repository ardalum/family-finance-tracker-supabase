import { Eye, EyeOff, KeyRound, WalletCards } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import { getRecoveryFormValidationError } from "../authRecoveryValidation.js";

const PASSWORD_RESET_FORM_FEEDBACK_ID = "password-reset-form-feedback";

export default function PasswordResetForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const hasFeedback = Boolean(error || status);
  const passwordToggleLabel = showPassword ? "Hide new password" : "Show new password";
  const confirmPasswordToggleLabel = showConfirmPassword
    ? "Hide confirm password"
    : "Show confirm password";

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

  function handleSubmit(event) {
    event.preventDefault();
    resetFeedback();

    const validationError = getRecoveryFormValidationError({ password, confirmPassword });

    if (validationError) {
      setError(validationError);
      return;
    }

    setStatus("Password update UI is ready. The secure update service will be connected in the next PR.");
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
            <p className="text-sm text-[#6B7280]">Create a new password for your account.</p>
          </div>
        </div>

        <Card>
          <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                <KeyRound size={20} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold tracking-normal text-[#111827]">Reset your password</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Enter a new password below. You will use this password the next time you sign in.
              </p>
            </div>

            {error ? (
              <div
                id={PASSWORD_RESET_FORM_FEEDBACK_ID}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {status ? (
              <div
                id={PASSWORD_RESET_FORM_FEEDBACK_ID}
                className="rounded-xl border border-green-200 bg-[#DCFCE7] px-3 py-2 text-sm text-[#166534]"
                role="status"
                aria-live="polite"
              >
                {status}
              </div>
            ) : null}

            <div className="grid gap-1.5">
              <Input
                label="New password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={handlePasswordChange}
                minLength={6}
                aria-describedby={hasFeedback ? PASSWORD_RESET_FORM_FEEDBACK_ID : undefined}
                aria-invalid={Boolean(error)}
                required
              />
              <button
                type="button"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-[#6B7280] transition hover:text-[#111827]"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={passwordToggleLabel}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                {passwordToggleLabel}
              </button>
            </div>

            <div className="grid gap-1.5">
              <Input
                label="Confirm new password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                minLength={6}
                aria-describedby={hasFeedback ? PASSWORD_RESET_FORM_FEEDBACK_ID : undefined}
                aria-invalid={Boolean(error)}
                required
              />
              <button
                type="button"
                className="inline-flex w-fit items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-[#6B7280] transition hover:text-[#111827]"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={confirmPasswordToggleLabel}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                {confirmPasswordToggleLabel}
              </button>
            </div>

            <Button type="submit">Continue</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
