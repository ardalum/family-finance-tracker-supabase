import { CheckCircle2, KeyRound, MailCheck, ShieldAlert, UserCircle } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import { formatAuthEventLabel } from "../authAccountDisplayUtils.js";
import { useAuth } from "../AuthProvider.jsx";
import { AUTH_STATUS_TYPES } from "../authViewTargets.js";

const statusConfig = {
  [AUTH_STATUS_TYPES.inbox]: {
    icon: MailCheck,
    title: "Check your inbox",
    description:
      "Open the email from Spedger and follow the link to finish setting up your account.",
  },
  [AUTH_STATUS_TYPES.verified]: {
    icon: CheckCircle2,
    title: "Account verified",
    description: "Your account is ready. You can continue using Spedger.",
  },
  [AUTH_STATUS_TYPES.resetPassword]: {
    icon: KeyRound,
    title: "Reset your password",
    description:
      "Follow the password reset steps from your email to continue securing your Spedger account.",
  },
  [AUTH_STATUS_TYPES.signedOut]: {
    icon: UserCircle,
    title: "Sign in required",
    description: "Sign in again to continue managing your household finance data.",
  },
  [AUTH_STATUS_TYPES.problem]: {
    icon: ShieldAlert,
    title: "Auth status needs attention",
    description:
      "Something about the sign-in state needs attention. Try refreshing or signing in again.",
  },
};

export default function AuthStatusScreen({
  status = AUTH_STATUS_TYPES.inbox,
  email = "",
  message = "",
  actionSlot = null,
}) {
  const { authEvent } = useAuth();
  const config = statusConfig[status] ?? statusConfig[AUTH_STATUS_TYPES.problem];
  const authEventLabel = formatAuthEventLabel(authEvent);
  const Icon = config.icon;

  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-10">
      <Card className="w-full max-w-lg p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-app-background text-text-muted">
          <Icon size={28} aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-text-main">{config.title}</h2>
        <p className="mt-2 text-sm text-text-muted">{config.description}</p>
        {message ? (
          <p className="mt-4 rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-main">
            {message}
          </p>
        ) : null}
        {email ? (
          <p className="mt-4 rounded-xl bg-app-background px-3 py-2 text-sm font-semibold text-text-main">
            {email}
          </p>
        ) : null}
        {authEventLabel ? (
          <p className="mt-3 text-xs text-text-muted">Latest auth event: {authEventLabel}</p>
        ) : null}
        {actionSlot ? <div className="mt-5">{actionSlot}</div> : null}
      </Card>
    </div>
  );
}
