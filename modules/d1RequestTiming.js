// Opt-in (AUTHORING_D1_TIMING=1) per-request trace of D1 HTTP round trips on
// the local authoring server. Each incoming request runs in its own
// d1RequestScope.js context; httpD1Database.js reports every query it sends,
// and the request logs one summary line when it ends. "wall" is the union of
// the query intervals: wall close to "sum" means the queries ran one after
// another, wall well below sum means they overlapped. AUTHORING_D1_TIMING=2
// also lists every query with its start offset, duration, and response size.
import { currentD1RequestScope } from "./d1RequestScope.js";

export function d1TimingEnabled(env = process.env) {
  return env?.AUTHORING_D1_TIMING === "1" || d1TimingDetailed(env);
}

function d1TimingDetailed(env) {
  return env?.AUTHORING_D1_TIMING === "2";
}

function sqlLabel(body) {
  if (Array.isArray(body?.batch)) {
    return `batch(${body.batch.length}) ${sqlLabel(body.batch[0] || {})}`;
  }
  return String(body?.sql || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function recordD1Query(body, startedAt, endedAt, bytes = 0) {
  const trace = currentD1RequestScope();
  if (!trace) return;
  trace.queries.push({ label: sqlLabel(body), startedAt, endedAt, bytes });
}

function wallMs(queries) {
  if (!queries.length) return 0;
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

function detailLines(startedAt, queries) {
  return queries.map(query =>
    `  +${Math.round(query.startedAt - startedAt)}ms ` +
    `${Math.round(query.endedAt - query.startedAt)}ms ` +
    `${Math.round(query.bytes / 1024)}KB ${query.label}`
  );
}

export function summarizeD1Trace({
  method, url, status, startedAt, endedAt, queries, cacheHits = 0, detailed = false
}) {
  const durations = queries.map(query => query.endedAt - query.startedAt);
  const sum = durations.reduce((total, ms) => total + ms, 0);
  const slowest = queries[durations.indexOf(Math.max(...durations))];
  const ms = value => `${Math.round(value)}ms`;
  const bytes = queries.reduce((total, query) => total + query.bytes, 0);
  const summary = `D1 ${method} ${url} ${status} total=${ms(endedAt - startedAt)} ` +
    `d1=${queries.length} sum=${ms(sum)} wall=${ms(wallMs(queries))} ` +
    `size=${Math.round(bytes / 1024)}KB cached=${cacheHits} ` +
    (slowest ? `slowest=${ms(slowest.endedAt - slowest.startedAt)} ${slowest.label}` : "");
  return detailed ? [summary, ...detailLines(startedAt, queries)].join("\n") : summary;
}

export function withD1Timing(handler, { env = process.env, log = console.log } = {}) {
  if (!d1TimingEnabled(env)) return handler;
  return (req, res) => {
    const trace = currentD1RequestScope();
    if (!trace) return handler(req, res);
    const startedAt = performance.now();
    res.once("close", () => {
      if (!trace.queries.length && !trace.cacheHits) return;
      log(summarizeD1Trace({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        startedAt,
        endedAt: performance.now(),
        queries: trace.queries,
        cacheHits: trace.cacheHits || 0,
        detailed: d1TimingDetailed(env)
      }));
    });
    return handler(req, res);
  };
}
