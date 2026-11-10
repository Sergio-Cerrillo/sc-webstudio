// This module also runs in the Edge middleware: keep it independent of Node APIs.
export const SESSION_COOKIE = "sc_proposals_session"
export const SESSION_TTL = 60 * 60 * 8
export const PROPOSAL_ROOT = "/propuestas"

// Explicit public origin supports Node deployments behind HTTPS reverse proxies.
export function proposalOrigin(requestURL: string, headers?: Headers) {
  const request = new URL(requestURL)
  const protocol =
    headers?.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https"
      ? "https:"
      : request.protocol
  const url = new URL(`${protocol}//${headers?.get("host") || request.host}`)
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Invalid proposals origin")
  return url.origin
}

export function authConfigured() {
  const key = process.env.PROPOSALS_ACCESS_KEY
  return !!key?.trim() && key.length <= 512
}

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

async function signingKey() {
  const source = `scwebstudio:proposals:session:v2:${process.env.PROPOSALS_ACCESS_KEY}`
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(source),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

export async function createSession(now = Date.now()) {
  if (!authConfigured()) throw new Error("Private access is not configured")
  const payload = `${Math.floor(now / 1000) + SESSION_TTL}.${crypto.randomUUID()}`
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(),
    new TextEncoder().encode(payload),
  )
  return `${payload}.${encode(new Uint8Array(signature))}`
}

export async function validSession(value?: string, now = Date.now()) {
  if (!value || !authConfigured() || value.length > 256) return false
  try {
    const [expires, nonce, signature, extra] = value.split(".")
    const expiry = Number(expires)
    if (
      extra ||
      !nonce ||
      !signature ||
      !Number.isSafeInteger(expiry) ||
      expiry <= now / 1000 ||
      expiry > now / 1000 + SESSION_TTL + 60
    )
      return false
    const bytes = Uint8Array.from(
      atob(signature.replaceAll("-", "+").replaceAll("_", "/")),
      (c) => c.charCodeAt(0),
    )
    return await crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      bytes,
      new TextEncoder().encode(`${expires}.${nonce}`),
    )
  } catch {
    return false
  }
}

export function safeReturnPath(input: unknown) {
  if (typeof input !== "string" || input.includes("\\") || /[\r\n]/.test(input))
    return PROPOSAL_ROOT
  try {
    const url = new URL(input, "https://private.invalid")
    if (
      url.origin !== "https://private.invalid" ||
      !(
        url.pathname === PROPOSAL_ROOT ||
        url.pathname.startsWith(`${PROPOSAL_ROOT}/`)
      )
    )
      return PROPOSAL_ROOT
    if (/^\/propuestas\/(acceso|session)(\/|$)/.test(url.pathname))
      return PROPOSAL_ROOT
    return `${url.pathname}${url.search}`
  } catch {
    return PROPOSAL_ROOT
  }
}
