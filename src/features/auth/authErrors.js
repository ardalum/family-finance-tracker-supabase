export function getFriendlyAuthError(error, fallback = "Authentication failed.") {
  const rawMessage = typeof error === "string" ? error : error?.message;
  const message = rawMessage?.trim();
  const normalized = message?.toLowerCase() ?? "";

  if (!message) return fallback;

  if (normalized.includes("invalid login credentials")) {
    return "The email or password does not match an account. Check your details and try again.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirm your email address before signing in. Check your inbox for the confirmation link.";
  }

  if (normalized.includes("user already registered") || normalized.includes("already registered")) {
    return "An account already exists for this email. Sign in instead.";
  }

  if (normalized.includes("password should be at least") || normalized.includes("password must")) {
    return "Use a stronger password that meets the minimum length requirement.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Too many attempts. Wait a few minutes, then try again.";
  }

  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "Could not connect to the sign-in service. Check your internet connection and try again.";
  }

  if (normalized.includes("supabase is not configured")) {
    return "Supabase is not configured. Check the app environment variables.";
  }

  return message || fallback;
}
