import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import {
  CHAPTERS,
  chapterAt,
  fitView,
  smooth,
} from "../lib/proposals/construction/config.ts";

test("Las cinco fases se recuperan en ambos sentidos sin memoria temporal", () => {
  assert.equal(CHAPTERS.length, 5);
  for (let i = 0; i < CHAPTERS.length; i++)
    assert.equal(chapterAt(CHAPTERS[i].at), i);
  const forward = Array.from({ length: 1001 }, (_, i) => chapterAt(i / 1000));
  const reverse = Array.from({ length: 1001 }, (_, i) =>
    chapterAt((1000 - i) / 1000),
  ).reverse();
  assert.deepEqual(forward, reverse);
  assert.equal(chapterAt(1), 4);
});

test("La proyección fija encuadra el volumen completo sin cortarlo en distintas pantallas", () => {
  // Bounding rectangle in camera space (site + completed building).
  const bounds = { minX: -18, maxX: 18, minY: -11, maxY: 15 };
  for (const [w, h] of [
    [320, 640],
    [390, 844],
    [440, 956],
    [768, 1024],
    [1024, 768],
    [1440, 900],
    [2256, 1214],
  ]) {
    const view = fitView(w, h, bounds);
    const screenX = (x) => ((x - view.left) / (view.right - view.left)) * w;
    const screenY = (y) => ((view.top - y) / (view.top - view.bottom)) * h;
    assert.ok(screenX(bounds.minX) >= 0, `${w}: izquierda`);
    assert.ok(screenX(bounds.maxX) <= w, `${w}: derecha`);
    assert.ok(screenY(bounds.maxY) >= h * 0.17-.001, `${w}: margen superior`);
    assert.ok(screenY(bounds.minY) <= h * 0.92, `${w}: margen inferior`);
    // Equal world units per screen pixel: no geometric distortion.
    assert.ok(
      Math.abs((view.right - view.left) / w - (view.top - view.bottom) / h) <
        1e-8,
    );
    assert.deepEqual(fitView(w, h, bounds), view);
  }
});

test("Los cambios de luz y texto son continuos y acotados", () => {
  let previous = 0;
  for (let i = 0; i <= 1000; i++) {
    const p = smooth(0.84, 0.98, i / 1000);
    assert.ok(p >= previous && p <= 1);
    assert.ok(p - previous < 0.012);
    previous = p;
  }
  assert.equal(smooth(0.84, 0.98, 0), 0);
  assert.equal(smooth(0.84, 0.98, 1), 1);
});

test("El modelo tiene un montaje completo y libera geometrías y materiales compartidos", async () => {
  const source = await readFile(
    new URL("../lib/proposals/construction/model.ts", import.meta.url),
    "utf8",
  );
  // Native Node test: resolve this browser module's imports and provide only
  // the offscreen grain canvas. This does not fake a WebGL renderer.
  const js = stripTypeScriptTypes(source)
    .replace('"three"', JSON.stringify(import.meta.resolve("three")))
    .replace('"three/examples/jsm/geometries/RoundedBoxGeometry.js"',JSON.stringify(import.meta.resolve("three/examples/jsm/geometries/RoundedBoxGeometry.js")))
    .replace(
      '"./config"',
      JSON.stringify(
        new URL("../lib/proposals/construction/config.ts", import.meta.url)
          .href,
      ),
    );
  const { createConstructionModel } = await import(
    `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
  );
  const previousDocument = globalThis.document;
  globalThis.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({
        createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        putImageData() {},
      }),
    }),
  };
  try {
    const model = createConstructionModel();
    assert.ok(model.parts.length > 100);
    assert.equal(
      new Set(model.parts.map((p) => p.object.name)).size,
      model.parts.length,
    );
    for (const p of model.parts) {
      assert.ok(p.at >= 0 && p.at + p.duration <= 1, p.object.name);
      assert.equal(p.object.parent, model.root);
    }
    const geometries = new Set(),
      materials = new Set(),
      disposed = new Set();
    model.root.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    assert.ok(geometries.size <= 6, "Geometrías reutilizadas entre piezas");
    assert.ok(model.skeleton.geometry.getAttribute("position").count>100);
    for (const resource of [...geometries, ...materials])
      resource.addEventListener("dispose", () => disposed.add(resource));
    model.dispose();
    assert.equal(disposed.size, geometries.size + materials.size);
  } finally {
    globalThis.document = previousDocument;
  }
});
