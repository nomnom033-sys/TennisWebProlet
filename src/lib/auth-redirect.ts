const DEFAULT_ADMIN_PATH = "/admin";
const AUTH_CALLBACK_PATH = "/auth/callback";

export function buildAdminAuthRedirectUrl(siteUrl?: string | null) {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  if (!normalizedSiteUrl) {
    return undefined;
  }

  const url = new URL(AUTH_CALLBACK_PATH, normalizedSiteUrl);
  url.searchParams.set("next", DEFAULT_ADMIN_PATH);
  return url.toString();
}

export function normalizeAuthNextPath(value?: string | null) {
  if (!value) {
    return DEFAULT_ADMIN_PATH;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_ADMIN_PATH;
  }

  return value;
}

function normalizeSiteUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}
