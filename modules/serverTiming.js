// Server-Timing for the authoring server's whole-corpus routes (the puzzle
// list and the play corpus), so the browser's network panel shows where a
// navigation spends its time: fetching rows from D1, comparing working
// copies with published puzzles, or rendering.
//
// `phase` records the time since the previous phase ended. `timed` records
// one awaited step on its own, for steps that run concurrently. `measure`
// sums synchronous work repeated across rows, which run interleaved, so no
// single phase isolates it.

export function createServerTiming(now = () => performance.now()) {
  const entries = [];
  const sums = new Map();
  let last = now();
  return {
    phase(name) {
      const at = now();
      entries.push([name, at - last]);
      last = at;
    },
    async timed(name, promise) {
      const start = now();
      try {
        return await promise;
      } finally {
        entries.push([name, now() - start]);
      }
    },
    measure(name, run) {
      const start = now();
      try {
        return run();
      } finally {
        sums.set(name, (sums.get(name) || 0) + now() - start);
      }
    },
    header() {
      return [...entries, ...sums]
        .map(([name, ms]) => `${name};dur=${ms.toFixed(1)}`)
        .join(", ");
    },
    // Before the response is written; writeHead keeps headers set here.
    apply(res) {
      const value = this.header();
      if (value && typeof res?.setHeader === "function" && !res.headersSent) {
        res.setHeader("Server-Timing", value);
      }
    }
  };
}
