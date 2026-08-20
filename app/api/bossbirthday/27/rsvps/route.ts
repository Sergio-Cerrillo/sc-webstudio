import { NextRequest, NextResponse } from "next/server"
import type { BirthdayRsvp, BirthdayRsvpListResponse } from "@/app/bossbirthday/27/rsvp"

const memoryRsvps: BirthdayRsvp[] = []

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return undefined
  }

  return {
    url,
    serviceRoleKey,
    table: process.env.BOSSBIRTHDAY_RSVP_TABLE ?? "bossbirthday_27_rsvps",
  }
}

function getStorageMode() {
  return getSupabaseConfig() ? "supabase" : "memory"
}

function toStoredRsvp(input: Partial<BirthdayRsvp>): BirthdayRsvp {
  return {
    id: input.id ?? crypto.randomUUID(),
    guestId: input.guestId || undefined,
    name: String(input.name ?? "").trim(),
    attending: Boolean(input.attending),
    comment: input.comment ? String(input.comment).trim() : undefined,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
  }
}

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.BOSSBIRTHDAY_ADMIN_KEY

  if (!adminKey) {
    return process.env.NODE_ENV !== "production"
  }

  return request.nextUrl.searchParams.get("key") === adminKey
}

async function insertSupabaseRsvp(rsvp: BirthdayRsvp) {
  const config = getSupabaseConfig()

  if (!config) {
    return
  }

  const response = await fetch(`${config.url}/rest/v1/${config.table}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      id: rsvp.id,
      guest_id: rsvp.guestId,
      name: rsvp.name,
      attending: rsvp.attending,
      comment: rsvp.comment,
      submitted_at: rsvp.submittedAt,
    }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }
}

async function listSupabaseRsvps() {
  const config = getSupabaseConfig()

  if (!config) {
    return []
  }

  const response = await fetch(`${config.url}/rest/v1/${config.table}?select=*&order=submitted_at.desc`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  const rows = (await response.json()) as Array<{
    id: string
    guest_id?: string
    name: string
    attending: boolean
    comment?: string
    submitted_at: string
  }>

  return rows.map((row) => ({
    id: row.id,
    guestId: row.guest_id,
    name: row.name,
    attending: row.attending,
    comment: row.comment,
    submittedAt: row.submitted_at,
  }))
}

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as Partial<BirthdayRsvp>
    const rsvp = toStoredRsvp(input)

    if (!rsvp.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (getSupabaseConfig()) {
      await insertSupabaseRsvp(rsvp)
    } else {
      memoryRsvps.unshift(rsvp)
    }

    return NextResponse.json({ ok: true, mode: getStorageMode() })
  } catch {
    return NextResponse.json({ error: "Could not submit RSVP" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const response: BirthdayRsvpListResponse = {
      mode: getStorageMode(),
      rsvps: getSupabaseConfig() ? await listSupabaseRsvps() : memoryRsvps,
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: "Could not list RSVPs" }, { status: 500 })
  }
}
