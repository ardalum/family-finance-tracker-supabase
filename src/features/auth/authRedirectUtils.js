const DEFAULT_AUTH_REDIRECT_PATH = "/";

export function getAuthRedirectUrl(path = DEFAULT_AUTH_REDIRECT_PATH) {
  if (typeof window === "undefined") return path;

  const normalizedPath = normalizeRedirectPath(path);
  return new URL(normalizedPath, window.location.origin).toString();
}

export function normalizeRedirectPath(path = DEFAULT_AUTH_REDIRECT_PATH) {
  const rawPath = String(path || DEFAULT_AUTH_REDIRECT_PATH).trim();
  if (!rawPath) return DEFAULT_AUTH_REDIRECT_PATH;

  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    try {
      const parsedUrl = new URL(rawPath);
      return (
        `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}` || DEFAULT_AUTH_REDIRECT_PATH
      );
    } catch {
      return DEFAULT_AUTH_REDIRECT_PATH;
    }
  }

  return rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
}
