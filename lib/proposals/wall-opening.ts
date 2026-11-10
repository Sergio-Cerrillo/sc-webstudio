export const WALL_ASSETS =
  "/propuestas/construccions-germans-moya/casa-y-pared-germans-moya";
export const PHOTO_SIZE = { width: 1672, height: 941 };
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (a: number, b: number, p: number) => {
  const t = clamp((p-a)/(b-a)); return t*t*(3-2*t);
};
/** Editorial choreography follows the same scroll clock as the stone. */
export function wallCopyAt(progress: number) {
  return {
    lines: [0.015, 0.11, 0.22].map(start => {
      const t = smooth(start, start+.43, progress);
      return {y:-44*t,x:-14*t,opacity:1-t};
    }),
    support:1-smooth(.015,.39,progress),
    shade:1-smooth(.13,.78,progress),
    caption:smooth(.56,.82,progress),
  };
}
/** The final 24% of the track is a still hold on the engraving. There is no
 * independent clock or easing tween: stopping scroll stops the wall exactly. */
export function wallAt(progress: number) {
  const reveal = clamp(progress / 0.76);
  return {
    reveal,
    shift: (1 - reveal) * 100,
    light: clamp((progress - 0.68) / 0.25) * 0.19,
  };
}

/** Mirrors the shared CSS frame, useful for checking the original canvases. */
export function wallFrame(width: number, height: number) {
  const scale = Math.max(width / PHOTO_SIZE.width, height / PHOTO_SIZE.height);
  const w = PHOTO_SIZE.width * scale,
    h = PHOTO_SIZE.height * scale;
  const x =
    width <= 760 || width / height < 1
      ? Math.max(width - w, Math.min(0, width / 2 - w * 0.79665))
      : (width - w) / 2;
  return { width: w, height: h, x, y: (height - h) / 2, scale };
}
