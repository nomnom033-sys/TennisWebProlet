export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function isSupabaseServiceConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

export function isTelegramConfigured() {
  return Boolean(getTelegramBotToken() && getTelegramChatId());
}

export function getSupabaseUrl() {
  return normalizeSupabaseUrl(readEnv("NEXT_PUBLIC_SUPABASE_URL"));
}

export function getSupabaseAnonKey() {
  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey() {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getTelegramBotToken() {
  return readEnv("TELEGRAM_BOT_TOKEN");
}

export function getTelegramChatId() {
  return readEnv("TELEGRAM_CHAT_ID");
}

export function getTelegramMessageThreadId() {
  return readEnv("TELEGRAM_MESSAGE_THREAD_ID");
}

export function getTurnstileSecretKey() {
  return readEnv("TURNSTILE_SECRET_KEY");
}

function readEnv(key: string) {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function normalizeSupabaseUrl(value: string | undefined) {
  if (!value) return undefined;

  return value.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
}
