export const AUTH_FORM_STATUS_COPY = {
  signUpConfirmation: "Account created. Check your email to confirm your address and finish setup.",
  passwordResetRequested: "Check your email for a password reset link.",
  submitting: "Working...",
  sendingResetLink: "Sending reset link...",
};

export const AUTH_FORM_MODES = {
  signIn: "sign-in",
  signUp: "sign-up",
};

const PASSWORD_AUTOCOMPLETE_VALUES = {
  current: "current-password",
  new: "new-password",
};

const authFormCopy = {
  [AUTH_FORM_MODES.signIn]: {
    title: "Sign in",
    description: "Sign in to continue to your household finance tracker.",
    submitLabel: "Sign in",
    switchModeLabel: "Need an account? Sign up",
    resetPasswordLabel: "Forgot password?",
  },
  [AUTH_FORM_MODES.signUp]: {
    title: "Create account",
    description: "Create an account to start managing your household finance tracker.",
    submitLabel: "Create account",
    switchModeLabel: "Already have an account? Sign in",
    resetPasswordLabel: "",
  },
};

export function getAuthFormCopy(mode) {
  return authFormCopy[mode] ?? authFormCopy[AUTH_FORM_MODES.signIn];
}

export function getNextAuthFormMode(mode) {
  return isSignUpAuthFormMode(mode) ? AUTH_FORM_MODES.signIn : AUTH_FORM_MODES.signUp;
}

export function getPasswordAutocomplete(mode) {
  return isSignUpAuthFormMode(mode) ? PASSWORD_AUTOCOMPLETE_VALUES.new : PASSWORD_AUTOCOMPLETE_VALUES.current;
}

export function isSignUpAuthFormMode(mode) {
  return mode === AUTH_FORM_MODES.signUp;
}
