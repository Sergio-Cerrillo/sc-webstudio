import { NextRequest, NextResponse } from "next/server"
import {
  SESSION_COOKIE,
  safeReturnPath,
  validSession,
  proposalOrigin,
} from "@/lib/proposals/auth"

export async function middleware(request: NextRequest) {
  let path = request.nextUrl.pathname
  // The public directory can also be requested using percent-encoded paths.
  // Classify the decoded URL before allowing Next to resolve a static file.
  try {
    for (let i = 0; i < 3; i++) path = decodeURIComponent(path)
  } catch {
    return new NextResponse("URL no válida", { status: 400 })
  }
  path = path.replaceAll("\\", "/")
  try {
    path = new URL(path, request.url).pathname
  } catch {
    return new NextResponse("URL no válida", { status: 400 })
  }
  if (path === "/_next/image") {
    const source = request.nextUrl.searchParams.get("url") || ""
    let decoded = source
    try {
      for (let i = 0; i < 3; i++) decoded = decodeURIComponent(decoded)
    } catch {
      /* Invalid URL is rejected by Next. */
    }
    if (decoded.includes("/propuestas"))
      return new NextResponse("Recurso privado: utiliza su ruta protegida", {
        status: 403,
        headers: {
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex",
        },
      })
    return NextResponse.next()
  }
  const normalized = path.toLowerCase()
  if (normalized !== "/propuestas" && !normalized.startsWith("/propuestas/"))
    return NextResponse.next()
  const publicEntry =
    path === "/propuestas/acceso" ||
    (path === "/propuestas/session" && request.method === "POST")
  let response: NextResponse
  if (
    !publicEntry &&
    !(await validSession(request.cookies.get(SESSION_COOKIE)?.value))
  ) {
    let destination: URL
    try {
      destination = new URL(
        "/propuestas/acceso",
        proposalOrigin(request.url, request.headers),
      )
    } catch {
      return new NextResponse(
        "Revisa el origen público configurado en el servidor",
        {
          status: 503,
          headers: {
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex",
          },
        },
      )
    }
    destination.searchParams.set(
      "next",
      safeReturnPath(path + request.nextUrl.search),
    )
    response = NextResponse.redirect(destination)
  } else {
    response = NextResponse.next()
  }
  response.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive, nosnippet",
  )
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  response.headers.set("Referrer-Policy", "same-origin")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  return response
}

export const config = { matcher: ["/((?!_next/static|_next/webpack-hmr).*)"] }
