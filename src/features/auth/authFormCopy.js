export const AUTH_FORM_STATUS_COPY = {
  signUpConfirmation: "Account created. Check your email to confirm your address and finish setup.",
};

const AUTH_FORM_MODES = {
  signIn: "sign-in",
  signUp: "sign-up",
};

const authFormCopy = {
  [AUTH_FORM_MODES.signIn]: {
    title: "Sign in",
    description: "Sign in to continue to your household finance tracker.",
    submitLabel: "Sign in",
    switchModeLabel: "Need an account? Sign up",
  },
  [AUTH_FORM_MODES.signUp]: {
    title: "Create account",
    description: "Create an account to start managing your household finance tracker.",
    submitLabel: "Create account",
    switchModeLabel: "Already have an account? Sign in",
  },
};

export function getAuthFormCopy(mode) {
  return authFormCopy[mode] ?? authFormCopy[AUTH_FORM_MODES.signIn];
}

export function getNextAuthFormMode(mode) {
  return mode === AUTH_FORM_MODES.signUp ? AUTH_FORM_MODES.signIn : AUTH_FORM_MODES.signUp;
}
