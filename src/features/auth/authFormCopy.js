export const AUTH_FORM_STATUS_COPY = {
  signUpConfirmation: "Account created. Check your email to confirm your address and finish setup.",
};

const authFormCopy = {
  "sign-in": {
    title: "Sign in",
    description: "Sign in to continue to your household finance tracker.",
    submitLabel: "Sign in",
    switchModeLabel: "Need an account? Sign up",
  },
  "sign-up": {
    title: "Create account",
    description: "Create an account to start managing your household finance tracker.",
    submitLabel: "Create account",
    switchModeLabel: "Already have an account? Sign in",
  },
};

export function getAuthFormCopy(mode) {
  return authFormCopy[mode] ?? authFormCopy["sign-in"];
}
