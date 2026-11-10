import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual, createHash } from "node:crypto"
import {
  SESSION_COOKIE,
  SESSION_TTL,
  authConfigured,
  createSession,
  safeReturnPath,
  validSession,
  proposalOrigin,
} from "@/lib/proposals/auth"
import { allowLogin } from "@/lib/proposals/rate-limit"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  }
  let origin: string
  try {
    origin = proposalOrigin(request.url, request.headers)
  } catch {
    return new NextResponse("Origen de aplicación mal configurado", {
      status: 503,
      headers,
    })
  }
  if (request.headers.get("origin") !== origin)
    return new NextResponse("Origen no permitido", { status: 403, headers })
  if (Number(request.headers.get("content-length") ?? 0) > 4096)
    return new NextResponse("Solicitud demasiado grande", {
      status: 413,
      headers,
    })
  if (
    !request.headers
      .get("content-type")
      ?.startsWith("application/x-www-form-urlencoded")
  )
    return new NextResponse("Formato no permitido", { status: 415, headers })
  const reader = request.body?.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  if (reader) {
    while (true) {
      const part = await reader.read()
      if (part.done) break
      length += part.value.byteLength
      if (length > 4096) {
        await reader.cancel()
        return new NextResponse("Solicitud demasiado grande", {
          status: 413,
          headers,
        })
      }
      chunks.push(part.value)
    }
  }
  const body = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  const form = new URLSearchParams(new TextDecoder().decode(body))
  if (form.get("intent") === "logout") {
    if (!(await validSession(request.cookies.get(SESSION_COOKIE)?.value)))
      return new NextResponse("Sin sesión", { status: 401, headers })
    const response = NextResponse.redirect(
      new URL("/propuestas/acceso", origin),
      303,
    )
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/propuestas",
      maxAge: 0,
    })
    return response
  }
  const next = safeReturnPath(form.get("next"))
  const fail = (error: string) => {
    const url = new URL("/propuestas/acceso", origin)
    url.searchParams.set("error", error)
    url.searchParams.set("next", next)
    return NextResponse.redirect(url, 303)
  }
  if (!authConfigured()) return fail("config")
  const limit = await allowLogin(
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local",
  )
  if (!limit) return fail("limit")
  const supplied = String(form.get("key") ?? "")
  if (
    supplied.length > 512 ||
    !timingSafeEqual(
      createHash("sha256").update(supplied).digest(),
      createHash("sha256").update(process.env.PROPOSALS_ACCESS_KEY!).digest(),
    )
  )
    return fail("key")
  const response = NextResponse.redirect(new URL(next, origin), 303)
  response.headers.set("Cache-Control", "private, no-store")
  response.cookies.set(SESSION_COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/propuestas",
    maxAge: SESSION_TTL,
  })
  return response
}
