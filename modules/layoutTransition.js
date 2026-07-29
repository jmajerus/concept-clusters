// Shared browser-side lifecycle for explicit layout transitions. Candidate
// generation and final commit remain renderer-owned; this module only owns
// the mechanics that should feel identical in every mode.

export function easeInOutCubic(raw) {
  return raw < 0.5
    ? 4 * raw * raw * raw
    : 1 - Math.pow(-2 * raw + 2, 3) / 2;
}

// A single requestAnimationFrame callback resumes before its frame paints.
// Two frames guarantee the browser can display a newly-written busy state
// before synchronous candidate search begins.
export function afterNextPaint() {
  return new Promise(resolve => requestAnimationFrame(() =>
    requestAnimationFrame(resolve)
  ));
}

export function layoutTransitionDuration(fullDuration, reducedDuration = 1) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? reducedDuration
    : fullDuration;
}

// `targets` is a Map whose keys are live objects with x/y coordinates.
// Returning false on cancellation lets each renderer retain authority over
// cleanup, simulation state, exact final coordinates, and user messaging.
export function animatePositionTargets({
  targets,
  duration,
  render,
  isCurrent = () => true,
  resetVelocity = false
}) {
  const starts = new Map([...targets].map(([item]) => [
    item,
    { x: item.x, y: item.y }
  ]));
  const started = performance.now();
  return new Promise(resolve => {
    const frame = now => {
      if (!isCurrent()) {
        resolve(false);
        return;
      }
      const raw = Math.min(1, (now - started) / duration);
      const progress = easeInOutCubic(raw);
      for (const [item, target] of targets) {
        const start = starts.get(item);
        item.x = start.x + (target.x - start.x) * progress;
        item.y = start.y + (target.y - start.y) * progress;
        if (resetVelocity) {
          item.vx = 0;
          item.vy = 0;
        }
      }
      render();
      if (raw < 1) requestAnimationFrame(frame);
      else resolve(true);
    };
    requestAnimationFrame(frame);
  });
}
