// One AsyncLocalStorage context per incoming request on the local authoring
// server, shared by the D1 request timing (d1RequestTiming.js) and the D1 read
// cache (d1ReadCache.js). Code outside a request (startup, the automatic
// layout pass) runs with no scope.
import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage();

export function currentD1RequestScope() {
  return storage.getStore() || null;
}

export function runInD1RequestScope(callback) {
  return storage.run({ queries: [], versions: null }, callback);
}

export function withD1RequestScope(handler) {
  return (req, res) => runInD1RequestScope(() => handler(req, res));
}
