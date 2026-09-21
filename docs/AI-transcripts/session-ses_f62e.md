# Kilo Code MCP_CALL provenance issue

**Session ID:** ses_f62e3a258ffev6MuS5QZR6rkCy
**Created:** 9/13/2026, 6:31:17 PM
**Updated:** 9/13/2026, 7:35:44 PM

---

## User

Kilo Code keeps falling back to MCP\_CALL rather than using the stdio server, it appears? That circumvents the provenance stamping feature.


```sql
[mcp-call] No client identity was forwarded; this write will not receive an automatic provenance or assistance-audit stamp. Pass the real envelope with --client-info/--meta (or CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME, CONCEPT_CLUSTERS_MCP_CALL_CLIENT_MODEL, CONCEPT_CLUSTERS_MCP_CALL_CLIENT_INFO, and CONCEPT_CLUSTERS_MCP_CALL_META).
```

---

## Assistant

**Tool: read**

**Tool: bash**

---

## Assistant

**Tool: bash**

**Tool: grep**

---

## Assistant

**Tool: read**

---

## Assistant

**Tool: read**

**Tool: read**

---

## Assistant

The warning tells us writes went through `tools/mcp-call.mjs` (the anonymous one-shot helper) instead of Kilo's native stdio MCP connection from `.kilo/kilo.json`. Let me check what actually happened in recent sessions and how the server stamps provenance.

**Tool: kilo_local_recall**

**Tool: grep**

---

## Assistant

**Tool: bash**

---

## Assistant

**Tool: read**

**Tool: read**

---

## Assistant

The server-side picture is clear: `identifyMcpAssistanceClient` (modules/mcpClientIdentity.js:68) only knows Kilo Code via a placeholder fingerprint that expects `CONCEPT_CLUSTERS_MCP_CALL_CLIENT_NAME=kilo-code` — i.e., the mcp-call fallback path — not a native stdio envelope. Let me check what happened in the recent session and when the Kilo MCP registration was added.

**Tool: kilo_local_recall**

**Tool: bash**

---

## Assistant

This confirms the history: in the 9/11 session the writes went through `mcp-call` because no native registration existed, then `.kilo/kilo.json` was created (commit `134c628`) with the note that it loads on the *next* session. The question now is whether that registration actually works and whether Kilo's native envelope will even be recognized by the server's fingerprints. Let me verify the config shape and the host-fingerprint side.

**Tool: skill**

**Tool: bash**

---

## Assistant

The `.kilo/kilo.json` shape matches Kilo's documented MCP schema, so the config itself is valid. Notably, this session exposes no `concept-clusters_*` MCP tools to me — evidence the registration still isn't producing a live connection. Let me check the probe docs (this repo has a sanctioned probing harness) and verify the server actually comes up the way Kilo would launch it.

**Tool: read**

**Tool: bash**

---

## Assistant

The stdio server itself is healthy — instant handshake, full capabilities (the EPIPE is just my `head` closing the pipe). So the server isn't the problem. Now let me find out why sessions still route through `mcp-call`: check Kilo's own logs for MCP connection attempts, the probe telemetry, and what the split planner emits as transport guidance.

**Tool: bash**

**Tool: bash**

---

## Assistant

Probe telemetry shows only test-harness captures today (`concept-clusters-tests` — the vitest client) and no Kilo probe at all. Let me check whether a session today actually hit the fallback, and look at Kilo's global config/logs for the MCP connection state.

**Tool: kilo_local_recall**

**Tool: bash**

---

## Assistant

**Tool: read**

**Tool: bash**

---

## Assistant

Global config has no MCP overrides, and `.kilo/worktrees/` is empty. The remaining unknown is what Kilo's runtime actually did when it tried to launch the server. Let me find Kilo's data/log storage.

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

No runtime logs. Two facts remain decisive: (1) this session itself has **zero** `concept-clusters_*` tools exposed, so the registration isn't yielding a live connection in Kilo sessions, and (2) the server-side `kilo-code` fingerprint is still an unverified placeholder — nobody has captured what clientInfo Kilo actually sends natively. Let me inspect the installed Kilo CLI to learn its real MCP client identity and how it launches local servers.

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

Found a strong lead: the bundled CLI contains `clientInfo:{name:"opencode",version:"0.0.0"}`. Let me confirm this is what the MCP client sends on initialize and check for alternatives and spawn behavior.

**Tool: bash**

---

## Assistant

Confirmed: Kilo's MCP client sends `clientInfo: {name: "opencode", version: "0.0.0"}` — the `initialize` handshake is right there in the bundle. That name matches **no fingerprint** in `mcpClientIdentity.js`, so even a healthy native connection would silently stamp nothing. Now let me verify what `_meta` Kilo attaches per call and check the extension's storage for MCP connection logs.

**Tool: bash**

**Tool: bash**

---

## Assistant

Kilo sends an empty `_meta` on tool calls — so on the native path the server would have only `clientInfo` to go on. Now let me find out why the native server isn't coming up in Kilo sessions at all. The bundled CLI likely has diagnostics.

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

`kilo mcp list` shows **concept-clusters: connected** — the registration works and the config is being read. So the remaining mysteries are (1) whether a live agent session actually gets the tools, and (2) the identity problem: Kilo's MCP client hardcoded-sends `opencode`/`0.0.0`, which no fingerprint in this repo matches — meaning even native calls would silently skip the stamp. The repo's own doctrine says to refine fingerprints from a real probe, and there's a `probe_mcp_client` tool for exactly this. Let me run a real headless Kilo session that calls the probe.

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

The live probe settles everything — captured in a real Kilo session (native stdio, tools exposed and callable):

- `clientVersion: {name: "kilo", version: "7.6.2"}` — Kilo natively identifies as **`kilo`**, not `kilo-code`
- `meta: {progressToken: 2}`, no model in the frame, same local actor subject as past drafts

So there are two distinct faults:

1. **The 9/11 session predated `.kilo/kilo.json`** (created at its end), so every write legitimately went through anonymous `mcp-call` → the warning you saw. The registration is fine and live now.
2. **Even native calls would silently stamp nothing**: `modules/mcpClientIdentity.js:69` matches only `kilo-code`, never the real `kilo` name — the placeholder was waiting for exactly this probe.

Let me fix the fingerprint. First, the tests and host label files:

**Tool: bash**

**Tool: read**

---

## Assistant

**Tool: read**

---

## Assistant

Now I have everything to fix it. The fingerprint needs the real native name (`kilo`, exact match, version-independent — same doctrine as the `tbh` Muse runtime match). Let me check the test runner, then make the changes.

**Tool: bash**

---

## Assistant

Now the fix. First the fingerprint in `modules/mcpClientIdentity.js`:

**Tool: edit**

---

## Assistant

Now the tests, mirroring the existing native-Muse runtime pattern:

**Tool: edit**

---

## Assistant

Now the calibration record in `docs/MCP-CLIENT-PROBES.md`, plus a check for other stale claims about Kilo's envelope:

**Tool: bash**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

**Tool: edit**

---

## Assistant

Now run the identity test suite:

**Tool: bash**

---

## Assistant

**Tool: bash**

---

## Assistant

Several failures — let me verify they pre-exist on HEAD and are unrelated to my change:

**Tool: bash**

---

## Assistant

Baseline is 57/62 vs 56/62 with my changes — need the exact failure lists to compare (some tests look network-flaky):

**Tool: bash**

---

## Assistant

Identical failure sets — those 5 are pre-existing on this branch and unrelated (timing-only diffs). Now run the identity test in isolation:

**Tool: bash**

---

## Assistant

All green. Final diff review:

**Tool: bash**

---

## Assistant

Diagnosis confirmed and fixed. There were two separate faults:

**1. The warning itself was from the pre-registration session.** The 9/11 drafting session ran before `.kilo/kilo.json` existed (it was created at that session's end), so every write legitimately went through the anonymous `tools/mcp-call.mjs` helper. The registration is live now — `kilo mcp list` reports `concept-clusters connected`, and a fresh headless Kilo session saw and called the native tools.

**2. The native path would still have stamped nothing — silently.** I ran a live probe (`probe_mcp_client`) through a real Kilo session and captured the true frame:

```json
"clientVersion": { "name": "kilo", "version": "7.6.2" },
"mcpReq": { "meta": { "progressToken": 2 } }
```

Kilo natively identifies as exactly `kilo` — not `kilo-code` — so the placeholder fingerprint (modules/mcpClientIdentity.js:69) never matched, and per the null-frame/null-stamp doctrine no attribution was written. This was the "refine with a real fingerprint once a native connection is probed" TODO, now probed.

Changes:

- **`modules/mcpClientIdentity.js`** — the `kilo-code` fingerprint now matches the observed native name `kilo` (exact, version-independent, no broad `kilo*` prefix — same doctrine as the `tbh` Muse match) while keeping `kilo-code` for the `CLIENT_NAME` fallback path.
- **`tests/mcp-client-identity.mjs`** — native-frame identity, version-independence, and a negative `kilogram` guard. Passes.
- **`docs/MCP-CLIENT-PROBES.md`** — Kilo Code probe section, observed-capture row (`kilo` @ `7.6.2`, no model in frame), and clients-to-probe entry.

Verification: identity test passes in isolation; full suite failure sets are byte-identical with and without my changes (the 5 failures — JSON-LD ×2, learning introductions, local draft review, optional bridges — pre-exist on this branch).

Going forward, native `create_puzzle_draft`/`save_puzzle_draft` from Kilo sessions will auto-stamp "Kilo Code" provenance and the D1 assistance audit. Kilo's frame carries no model claim, so the model detail remains human-owned on the drafts page — consistent with the repo's doctrine. The three 9/11 drafts can't be retroactively stamped (anonymous helper wrote them); your planned manual provenance edit before publishing is the correct remedy.

---

