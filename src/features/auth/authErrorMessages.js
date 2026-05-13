const DEFAULT_AUTH_ERROR_MESSAGE = "Something went wrong. Try again.";

const errorMessageMatchers = [
  {
    test: (message) => message.includes("invalid login credentials"),
    message: "The email or password does not match an account.",
  },
  {
    test: (message) => message.includes("email not confirmed"),
    message: "Check your inbox and confirm your email before signing in.",
  },
  {
    test: (message) => message.includes("user already registered"),
    message: "An account with this email already exists. Try signing in instead.",
  },
  {
    test: (message) => message.includes("password should be at least"),
    message: "Use a stronger password that meets the minimum length requirement.",
  },
  {
    test: (message) => message.includes("rate limit") || message.includes("too many"),
    message: "Too many attempts. Wait a bit before trying again.",
  },
  {
    test: (message) => message.includes("network") || message.includes("fetch"),
    message: "Could not reach the auth server. Check your connection and try again.",
  },
];

export function getAuthErrorMessage(error, fallback = DEFAULT_AUTH_ERROR_MESSAGE) {
  const rawMessage = getRawErrorMessage(error);
  if (!rawMessage) return fallback;

  const normalizedMessage = rawMessage.toLowerCase();
  const matchedError = errorMessageMatchers.find((entry) => entry.test(normalizedMessage));

  return matchedError?.message || rawMessage || fallback;
}

export function getRawErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error.trim();
  if (error.message) return String(error.message).trim();
  if (error.error_description) return String(error.error_description).trim();
  if (error.error) return String(error.error).trim();
  return "";
}
