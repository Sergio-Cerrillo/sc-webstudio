export type BirthdayRsvp = {
  id?: string
  guestId?: string
  name: string
  attending: boolean
  comment?: string
  submittedAt: string
}

export type BirthdayRsvpStorageMode = "supabase" | "memory" | "unavailable"

export type BirthdayRsvpListResponse = {
  mode: BirthdayRsvpStorageMode
  rsvps: BirthdayRsvp[]
}

export async function submitBirthdayRsvp(rsvp: BirthdayRsvp) {
  const response = await fetch("/api/bossbirthday/27/rsvps", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rsvp),
  })

  if (!response.ok) {
    throw new Error("Could not submit birthday RSVP")
  }

  return { ok: true }
}

export async function listBirthdayRsvps(adminKey?: string): Promise<BirthdayRsvpListResponse> {
  const url = new URL("/api/bossbirthday/27/rsvps", window.location.origin)

  if (adminKey) {
    url.searchParams.set("key", adminKey)
  }

  const response = await fetch(url)

  if (!response.ok) {
    return {
      mode: "unavailable",
      rsvps: [],
    }
  }

  return response.json() as Promise<BirthdayRsvpListResponse>
}
