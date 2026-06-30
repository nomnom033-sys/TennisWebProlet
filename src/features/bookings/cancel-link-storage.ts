export type StoredCancelLink = {
  cancelUrl: string;
};

export const CANCEL_LINK_STORAGE_KEY = "prolettennis:last-cancel-link";

export function saveStoredCancelLink(storage: Storage, cancelUrl: string) {
  try {
    storage.setItem(
      CANCEL_LINK_STORAGE_KEY,
      JSON.stringify({
        cancelUrl,
      } satisfies StoredCancelLink),
    );
  } catch {
    // Browsers can block localStorage; cancellation still works via the visible link.
  }
}

export function readStoredCancelLink(
  storage: Storage,
): StoredCancelLink | null {
  try {
    const rawValue = storage.getItem(CANCEL_LINK_STORAGE_KEY);
    if (!rawValue) return null;

    const value = JSON.parse(rawValue) as Partial<StoredCancelLink>;
    if (typeof value.cancelUrl !== "string" || !value.cancelUrl) {
      return null;
    }

    return { cancelUrl: value.cancelUrl };
  } catch {
    return null;
  }
}

export function clearStoredCancelLink(storage: Storage, cancelUrl: string) {
  const storedLink = readStoredCancelLink(storage);
  if (storedLink?.cancelUrl !== cancelUrl) return;

  try {
    storage.removeItem(CANCEL_LINK_STORAGE_KEY);
  } catch {
    // Nothing else to do if localStorage is unavailable.
  }
}
