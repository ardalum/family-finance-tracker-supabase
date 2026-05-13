import { KeyRound, Mail, ShieldCheck } from "lucide-react";

export const ACCOUNT_SECURITY_ACTIONS = Object.freeze([
  {
    id: "change-email",
    title: "Change email",
    description: "Update the email address used to sign in. This will need email verification before it becomes active.",
    icon: Mail,
    status: "planned",
  },
  {
    id: "change-password",
    title: "Change password",
    description: "Create a new password for this account after confirming the current account session.",
    icon: KeyRound,
    status: "planned",
  },
  {
    id: "password-reset",
    title: "Password reset",
    description: "Send a recovery link when the user cannot sign in. This belongs on the auth screen later.",
    icon: ShieldCheck,
    status: "planned",
  },
]);
