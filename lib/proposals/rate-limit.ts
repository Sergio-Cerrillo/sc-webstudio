import "server-only"

const WINDOW = 15 * 60 * 1000
const buckets = new Map<string, { count: number; until: number }>()

// Local counter: the private portfolio requires no external service or setup.
// The global bucket also caps attempts if a client changes its forwarded IP.
export async function allowLogin(ip: string) {
  const now = Date.now()
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(ip),
  )
  const client = Array.from(new Uint8Array(digest))
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")
  const limits: [string, number][] = [
    [`client:${client}`, 6],
    ["global", 100],
  ]
  for (const [key, bucket] of buckets)
    if (bucket.until <= now) buckets.delete(key)
  for (const [key, max] of limits) {
    const bucket = buckets.get(key) ?? { count: 0, until: now + WINDOW }
    bucket.count++
    buckets.set(key, bucket)
    if (bucket.count > max) return false
  }
  return true
}
