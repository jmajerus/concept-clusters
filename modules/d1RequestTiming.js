// Opt-in (AUTHORING_D1_TIMING=1) per-request trace of D1 HTTP round trips on
// the local authoring server. Each incoming request runs in its own
// AsyncLocalStorage context; httpD1Database.js reports every query it sends,
// and the request logs one summary line when it ends. "wall" is the union of
// the query intervals: wall close to "sum" means the queries ran one after
// another, wall well below sum means they overlapped.
import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage();

export function d1TimingEnabled(env = process.env) {
  return env?.AUTHORING_D1_TIMING === "1";
}

function sqlLabel(body) {
  if (Array.isArray(body?.batch)) {
    return `batch(${body.batch.length}) ${sqlLabel(body.batch[0] || {})}`;
  }
  return String(body?.sql || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function recordD1Query(body, startedAt, endedAt) {
  const trace = storage.getStore();
  if (!trace) return;
  trace.queries.push({ label: sqlLabel(body), startedAt, endedAt });
}

function wallMs(queries) {
  const intervals = queries
    .map(query => [query.startedAt, query.endedAt])
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [start, end] = intervals[0];
  for (const [nextStart, nextEnd] of intervals.slice(1)) {
    if (nextStart > end) {
      total += end - start;
      [start, end] = [nextStart, nextEnd];
    } else {
      end = Math.max(end, nextEnd);
    }
  }
  return total + (end - start);
}

export function summarizeD1Trace({ method, url, status, startedAt, endedAt, queries }) {
  const durations = queries.map(query => query.endedAt - query.startedAt);
  const sum = durations.reduce((total, ms) => total + ms, 0);
  const slowest = queries[durations.indexOf(Math.max(...durations))];
  const ms = value => `${Math.round(value)}ms`;
  return `D1 ${method} ${url} ${status} total=${ms(endedAt - startedAt)} ` +
    `d1=${queries.length} sum=${ms(sum)} wall=${ms(wallMs(queries))} ` +
    `slowest=${ms(slowest.endedAt - slowest.startedAt)} ${slowest.label}`;
}

export function withD1Timing(handler, { env = process.env, log = console.log } = {}) {
  if (!d1TimingEnabled(env)) return handler;
  return (req, res) => {
    const trace = { queries: [] };
    const startedAt = performance.now();
    res.once("close", () => {
      if (!trace.queries.length) return;
      log(summarizeD1Trace({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        startedAt,
        endedAt: performance.now(),
        queries: trace.queries
      }));
    });
    return storage.run(trace, () => handler(req, res));
  };
}
