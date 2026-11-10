// Runs the real production Next server with one ephemeral test access key.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";

const keepServing = process.argv.includes("--serve");
const port = Number(process.env.PROPOSALS_TEST_PORT || 3310);
const origin = `http://localhost:${port}`;
const key = process.env.PROPOSALS_TEST_KEY || randomBytes(24).toString("hex");
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
  {
    env: {
      ...process.env,
      PROPOSALS_ACCESS_KEY: key,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverLog = "";
child.stdout.on("data", (chunk) => {
  serverLog += chunk;
});
child.stderr.on("data", (chunk) => {
  serverLog += chunk;
});
const cleanup = () => {
  child.kill("SIGTERM");
};
process.on("SIGINT", () => {
  cleanup();
  process.exit();
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit();
});
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`${origin}/propuestas/acceso`);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, serverLog);
  const request = (path, opts = {}) =>
    fetch(`${origin}${path}`, { redirect: "manual", ...opts });
  const post = (fields, extra = {}) =>
    request("/propuestas/session", {
      method: "POST",
      headers: { Origin: origin, "X-Forwarded-For": "qa-http", ...extra },
      body: new URLSearchParams(fields),
    });
  const paths = [
    "/propuestas",
    "/propuestas/construccions-germans-moya",
    "/propuestas/construccions-germans-moya/admin",
    "/propuestas/construccions-germans-moya/fachada.webp",
    "/propuestas/construccions-germans-moya/logo-construccions.png",
    "/propuestas/construccions-germans-moya/timelapse-scroll-germans-moya/fotogramas/000.jpg",
    "/propuestas/construccions-germans-moya/timelapse-scroll-germans-moya/fotogramas/143.jpg",
    "/propuestas/construccions-germans-moya/casa-y-pared-germans-moya/01-casa-base.webp",
    "/propuestas/construccions-germans-moya/casa-y-pared-germans-moya/02-pared-logo-transparente.webp",
    "/propuestas/construccions-germans-moya/cocina-antes-despues-horizontal/cocina-antes.webp",
    "/propuestas/construccions-germans-moya/cocina-antes-despues-horizontal/cocina-despues.webp",
  ];
  for (const path of paths) {
    const r = await request(path);
    assert.equal(r.status, 307, path);
    assert.ok(r.headers.get("location").includes("/propuestas/acceso?next="));
    assert.match(r.headers.get("cache-control"), /no-store/);
    assert.match(r.headers.get("x-robots-tag"), /noindex/);
  }
  console.log("✓ Rutas profundas y originales privados sin sesión → acceso");
  for (const path of [
    "/%70ropuestas/construccions-germans-moya/fachada.webp",
    "/propuestas%2fconstruccions-germans-moya%2ffachada.webp",
    "/x/%252e%252e/propuestas/construccions-germans-moya/fachada.webp",
  ]) {
    const response = await request(path);
    assert.ok(
      [307, 308, 400, 404].includes(response.status),
      `Archivo expuesto por URL codificada: ${path}`,
    );
  }
  const bypass = await request(paths[2], {
    headers: {
      "x-middleware-subrequest":
        "middleware:middleware:middleware:middleware:middleware",
    },
  });
  assert.equal(bypass.status, 307);
  const rsc = await request(`${paths[2]}?_rsc=qa`, { headers: { RSC: "1" } });
  assert.equal(rsc.status, 307);
  assert.equal(
    (await post({ key }, { Origin: "https://evil.example" })).status,
    403,
  );
  const wrong = await post({ key: "incorrecta" });
  assert.match(wrong.headers.get("location"), /error=key/);
  const login = await post({ key, next: `${paths[2]}?modulo=crm` });
  assert.equal(login.status, 303);
  assert.equal(new URL(login.headers.get("location")).pathname, paths[2]);
  assert.equal(new URL(login.headers.get("location")).search, "?modulo=crm");
  const setCookie = login.headers.get("set-cookie");
  for (const flag of [
    "HttpOnly",
    "Secure",
    "SameSite=strict",
    "Max-Age=28800",
    "Path=/propuestas",
  ])
    assert.ok(setCookie.toLowerCase().includes(flag.toLowerCase()), flag);
  const accessHTML = await (await request("/propuestas/acceso")).text();
  assert.match(accessHTML, /logo-full-w\.png/);
  assert.match(accessHTML, /logo-full-b\.png/);
  assert.match(accessHTML, /Palabra clave/);
  const cookie = setCookie.split(";")[0];
  for (const path of paths) {
    const response = await request(path, { headers: { Cookie: cookie } });
    assert.equal(response.status, 200, path);
    assert.match(
      response.headers.get("cache-control"),
      /no-store/,
      `Caché del recurso privado: ${path}`,
    );
  }
  const privateHTML = await (
    await request(paths[1], { headers: { Cookie: cookie } })
  ).text();
  assert.match(privateHTML, /noindex/);
  assert.match(privateHTML, /Todo comienza/);
  assert.match(privateHTML, /Construimos\./);
  assert.match(privateHTML, /class="moya-wall-base"[^>]*loading="eager"/);
  assert.equal((privateHTML.match(/<h1[ >]/g) || []).length, 1);
  assert.ok(
    privateHTML.indexOf('class="moya-wall-opening"') <
      privateHTML.indexOf('class="moya-construction-opening"'),
  );
  assert.match(privateHTML, /moya-architecture-mount/);
  assert.match(privateHTML, /moya-main-navigation/);
  assert.ok(
    !privateHTML.includes('class="moya-logo"'),
    "El logo superior se ha retirado",
  );
  assert.match(
    privateHTML,
    /cocina-antes-despues-horizontal\/cocina-antes\.webp/,
  );
  assert.match(
    privateHTML,
    /cocina-antes-despues-horizontal\/cocina-despues\.webp/,
  );
  assert.match(privateHTML, /Saltar animación/);
  assert.ok(
    !privateHTML.includes("<video"),
    "La apertura utiliza dos capas fijas",
  );
  assert.ok(
    !privateHTML.includes("fotogramas/"),
    "La apertura ya no carga la secuencia del ZIP",
  );
  assert.ok(
    privateHTML.indexOf('class="moya-construction-opening"') <
      privateHTML.indexOf('id="proyectos"'),
  );
  const tampered = await request(paths[2], {
    headers: { Cookie: cookie + "x" },
  });
  assert.equal(tampered.status, 307);
  const optimizer = await request(
    "/_next/image?url=%2Fpropuestas%2Fconstruccions-germans-moya%2Ffachada.webp&w=640&q=75",
  );
  assert.equal(optimizer.status, 403);
  const optimizerEncoded = await request(
    "/_next/image?url=%2F%2570ropuestas%2Fconstruccions-germans-moya%2Ffachada.webp&w=640&q=75",
  );
  assert.equal(optimizerEncoded.status, 403);
  console.log(
    "✓ Firma, cookie de producción, retorno a URL profunda, CSRF, RSC y optimizador",
  );
  const logout = await post({ intent: "logout" }, { Cookie: cookie });
  assert.equal(logout.status, 303);
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal((await request(paths[2])).status, 307);
  const root = await request("/");
  assert.equal(root.status, 200);
  const publicHTML = await root.text();
  assert.ok(publicHTML.includes('href="/propuestas/acceso"'));
  assert.match(publicHTML, /Acceso privado a propuestas/);
  assert.equal((await request("/bossbirthday/27")).status, 200);
  assert.equal((await request("/logo/logo-w.png")).status, 200);
  assert.equal(
    (await request("/_next/image?url=%2Flogo%2Flogo-w.png&w=256&q=75")).status,
    200,
  );
  assert.match(
    await (await request("/robots.txt")).text(),
    /Disallow: \/propuestas/,
  );
  console.log(
    "✓ Cierre privado, portfolio, ruta existente, logo público y robots",
  );
  for (let i = 0; i < 7; i++)
    await post({ key: "incorrecta" }, { "X-Forwarded-For": "qa-rate-limited" });
  const limited = await post({ key }, { "X-Forwarded-For": "qa-rate-limited" });
  assert.match(limited.headers.get("location"), /error=limit/);
  console.log(
    "✓ Límite de intentos local: no acepta la clave después del bloqueo",
  );
  if (keepServing) {
    console.log(
      `Vista de QA disponible en ${origin} (servidor de prueba aislado)`,
    );
    await new Promise(() => {});
  }
} catch (error) {
  console.error(error);
  console.error(serverLog);
  process.exitCode = 1;
} finally {
  cleanup();
}
