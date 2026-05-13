import AccountSettings from "./components/AccountSettings.jsx";
import AuthStatusScreen from "./components/AuthStatusScreen.jsx";
import { AUTH_STATUS_TYPES, AUTH_VIEW_TARGETS } from "./authViewTargets.js";

export const authPageContent = Object.freeze({
  [AUTH_VIEW_TARGETS.accountSettings]: {
    title: "Account Settings",
    description: "Review account identity, session details, and planned security controls.",
  },
  [AUTH_VIEW_TARGETS.authStatus]: {
    title: "Account Status",
    description: "Review account confirmation and sign-in status.",
  },
});

export function getAuthPageContent(view) {
  return authPageContent[view] ?? null;
}

export function renderAuthView(view, options = {}) {
  if (view === AUTH_VIEW_TARGETS.accountSettings) {
    return <AccountSettings />;
  }

  if (view === AUTH_VIEW_TARGETS.authStatus) {
    return (
      <AuthStatusScreen
        status={options.status ?? AUTH_STATUS_TYPES.inbox}
        email={options.email ?? ""}
        actionSlot={options.actionSlot ?? null}
      />
    );
  }

  return null;
}
