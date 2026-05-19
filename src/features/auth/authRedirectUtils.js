const DEFAULT_AUTH_REDIRECT_PATH = "/";

function getBasePath() {
  return import.meta.env.BASE_URL || "/";
}

function normalizeBasePath(basePath = getBasePath()) {
  const rawBasePath = String(basePath || "/").trim();

  if (!rawBasePath || rawBasePath === ".") return "/";

  const withLeadingSlash = rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function applyBasePath(path, basePath = normalizeBasePath()) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (basePath === "/") return normalizedPath;
  if (normalizedPath === basePath.slice(0, -1) || normalizedPath.startsWith(basePath)) {
    return normalizedPath;
  }

  const relativePath = normalizedPath === "/" ? "" : normalizedPath.slice(1);
  return `${basePath}${relativePath}`;
}

export function getAuthRedirectUrl(path = DEFAULT_AUTH_REDIRECT_PATH) {
  if (typeof window === "undefined") return path;

  const normalizedPath = normalizeRedirectPath(path);
  const redirectPath = applyBasePath(normalizedPath);

  return new URL(redirectPath, window.location.origin).toString();
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
