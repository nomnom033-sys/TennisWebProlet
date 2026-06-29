import { createHash, randomBytes } from "node:crypto";

export function createCancelToken() {
  return randomBytes(24).toString("base64url");
}

export function hashCancelToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
