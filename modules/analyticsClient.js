// Gameplay analytics client -- see src/worker.js for what happens to
// these server-side. Takes exactly what it needs as explicit
// parameters (mode, and a small stats object) rather than closing over
// game.js's own `mode`/`state`, so this module has no dependency on
// anything but the fetch it makes.

// Fire-and-forget — never awaited, never throws, silently no-ops if
// /api/event is unreachable (e.g. local file:// dev with no Worker
// behind it).
export function trackEvent(event, data) {
  try {
    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
      keepalive: true
    }).catch(() => {});
  } catch {
    // Ignore synchronous errors (e.g. fetch unavailable in some test environments).
  }
}

export function trackPuzzleLoad(puzzleId, mode) {
  trackEvent("puzzle_load", { puzzleId, mode });
}

// Fired exactly once per puzzle, whether completed by manual play or by
// Show Solution — see the `state.made === state.need` check in
// handleTap, the single point both paths funnel through. Not
// per-move tracking: just enough to see which puzzles people struggle
// with (incorrectMoveCount, elapsedMs) and whether Show Solution was a
// reach-for-it-immediately click or a genuine give-up after trying
// (usedShowSolution + hadProgressBeforeShowSolution together).
export function trackPuzzleCompleted(puzzleId, mode, stats) {
  trackEvent("puzzle_completed", {
    puzzleId,
    mode,
    incorrectMoveCount: stats.incorrectMoveCount,
    elapsedMs: Date.now() - stats.startedAt,
    usedShowSolution: stats.completedViaShowSolution,
    hadProgressBeforeShowSolution: stats.hadProgressBeforeShowSolution
  });
}
