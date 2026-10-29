/** Cheap frame statistics, read by the dev overlay. Always collected; costs a few additions per frame. */
export const perf = {
  fps: 0,
  updateMs: 0,
  renderMs: 0,
  ticksTotal: 0,
};

let windowStart = 0;
let framesInWindow = 0;

export function recordFrame(now: number, updateMs: number, renderMs: number): void {
  perf.updateMs = updateMs;
  perf.renderMs = renderMs;
  framesInWindow++;
  if (windowStart === 0) windowStart = now;
  if (now - windowStart >= 500) {
    perf.fps = Math.round((framesInWindow * 1000) / (now - windowStart));
    framesInWindow = 0;
    windowStart = now;
  }
}
