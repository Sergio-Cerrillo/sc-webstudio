import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  PHOTO_SIZE,
  wallAt,
  wallFrame,
  wallCopyAt,
} from "../lib/proposals/wall-opening.ts";

test("La pared arranca con el primer scroll, se detiene en su destino y retrocede", () => {
  assert.equal(wallAt(0).shift, 100);
  assert.ok(wallAt(0.00001).shift < 100);
  assert.equal(wallAt(0.76).shift, 0);
  assert.equal(wallAt(1).shift, 0);
  assert.equal(wallAt(-1).shift, 100);
  let previous = 100;
  for (let i = 0; i <= 1000; i++) {
    const state = wallAt(i / 1000);
    assert.ok(state.shift <= previous && state.shift >= 0);
    assert.ok(previous - state.shift < 0.14);
    assert.deepEqual(wallAt(i / 1000), state);
    previous = state.shift;
  }
  const forward = Array.from({ length: 1001 }, (_, i) => wallAt(i / 1000));
  assert.deepEqual(
    Array.from({ length: 1001 }, (_, i) => wallAt((1000 - i) / 1000)).reverse(),
    forward,
  );
});

test("Las palabras se retiran escalonadas y el texto final entra sin reloj propio",()=>{
  assert.ok(wallCopyAt(.2).lines[0].opacity<wallCopyAt(.2).lines[1].opacity);
  assert.ok(wallCopyAt(.2).lines[1].opacity<wallCopyAt(.2).lines[2].opacity);
  for(const p of [0,.1,.4,.8,1]){
    const copy=wallCopyAt(p);
    assert.deepEqual(copy,wallCopyAt(p));
    for(const line of copy.lines)assert.ok(line.opacity>=0&&line.opacity<=1&&line.y>=-112&&line.y<=0);
  }
  assert.equal(wallCopyAt(0).caption,0);
  assert.equal(wallCopyAt(1).caption,1);
});

test("Casa y piedra comparten encuadre fijo, escala y registro en los extremos", () => {
  for (const [w, h] of [
    [320, 640],
    [375, 667],
    [390, 844],
    [440, 956],
    [768, 1024],
    [1440, 900],
    [2256, 1214],
  ]) {
    const frame = wallFrame(w, h);
    assert.ok(frame.width >= w - 0.001 && frame.height >= h - 0.001);
    assert.ok(Math.abs(frame.width / frame.height - 1672 / 941) < 1e-8);
    assert.ok(frame.x <= 0.001 && frame.x + frame.width >= w - 0.001);
    assert.ok(frame.y <= 0.001 && frame.y + frame.height >= h - 0.001);
    // At progress zero the opaque top of the wall is exactly below the screen.
    const travel = (h + frame.height) / 2;
    assert.ok(Math.abs(frame.y + travel - h) < 1e-8);
    // The final translation is zero: both canvases retain their native registration.
    assert.equal(wallAt(1).shift * travel, 0);
    if (w <= 760 || w / h < 1) {
      const logoLeft = frame.x + 1118 * frame.scale,
        logoRight = frame.x + 1546 * frame.scale;
      assert.ok(logoLeft >= -1 && logoRight <= w + 1, `${w}: grabado completo`);
    }
  }
});

test("Los tres originales tienen el mismo lienzo y la pared mantiene transparencia", async () => {
  const root = new URL(
    "../public/propuestas/construccions-germans-moya/casa-y-pared-germans-moya/",
    import.meta.url,
  );
  for (const file of [
    "01-casa-base.png",
    "02-pared-logo-transparente.png",
    "03-referencia-original.png",
  ]) {
    const data = await readFile(new URL(file, root));
    assert.equal(data.subarray(1, 4).toString(), "PNG");
    assert.equal(data.readUInt32BE(16), PHOTO_SIZE.width);
    assert.equal(data.readUInt32BE(20), PHOTO_SIZE.height);
    if (file.startsWith("02")) assert.equal(data[25], 6, "PNG RGBA");
  }
  for (const file of ["01-casa-base.webp", "02-pared-logo-transparente.webp"]) {
    const data = await readFile(new URL(file, root));
    assert.equal(data.subarray(8, 12).toString(), "WEBP");
  }
});
