const PRODUCTION_SITE_URL = "https://tennis-web-prolet.vercel.app";

export function buildCancelUrl({
  token,
  siteUrl,
  vercelProjectProductionUrl,
  vercelUrl,
}: {
  token: string;
  siteUrl?: string | null;
  vercelProjectProductionUrl?: string | null;
  vercelUrl?: string | null;
}) {
  const origin = normalizeOrigin(
    siteUrl ??
      vercelProjectProductionUrl ??
      (vercelUrl ? `https://${vercelUrl}` : undefined) ??
      PRODUCTION_SITE_URL,
  );

  return new URL(`/cancel/${token}`, origin).toString();
}

function normalizeOrigin(value: string | null | undefined) {
  const fallback = PRODUCTION_SITE_URL;
  if (!value) return fallback;

  try {
    return new URL(value).origin;
  } catch {
    return fallback;
  }
}
