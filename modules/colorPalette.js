// Non-semantic identity hues shared by authored clusters and comparative
// lenses. Bridge purple and feedback green/red intentionally live outside
// this pool because they carry fixed meanings.
export const IDENTITY_COLOR_KEYS = Object.freeze([
  "teal",
  "blue",
  "amber",
  "magenta",
  "olive",
  "brown",
  "cyan"
]);

export const IDENTITY_COLOR_KEY_SET = new Set(IDENTITY_COLOR_KEYS);

function clusterIdentityMatch(incoming, candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
  if (incoming.id && candidate.id === incoming.id) return true;
  return !incoming.id && Boolean(incoming.name) && candidate.name === incoming.name;
}

function withSettledColor(record, color) {
  if (record.color === color) return record;
  if (Object.hasOwn(record, "color")) return { ...record, color };
  const next = {};
  let placed = false;
  for (const [key, value] of Object.entries(record)) {
    next[key] = value;
    if (key === "name") {
      next.color = color;
      placed = true;
    }
  }
  if (!placed) next.color = color;
  return next;
}

function withoutColor(record) {
  if (!Object.hasOwn(record, "color")) return record;
  const next = { ...record };
  delete next.color;
  return next;
}

/**
 * Agent documents do not carry presentation color. Keep a stored cluster hue
 * when the cluster is still the same one, and assign the next unused palette
 * color for a cluster that has none. Ignore any hue the agent sent. Lens
 * color is an exceptional stored override: keep one already on the same lens
 * id, and drop one an agent added.
 */
export function settleAgentPresentationColors(document, previousDocument = null) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return document;
  const previousClusters = Array.isArray(previousDocument?.clusters)
    ? previousDocument.clusters
    : [];
  const usedPrevious = new Set();
  const takenColors = new Set();
  let clustersChanged = false;
  const settledClusters = Array.isArray(document.clusters)
    ? document.clusters.map(cluster => {
      if (!cluster || typeof cluster !== "object" || Array.isArray(cluster)) return cluster;
      const bare = withoutColor(cluster);
      const matchIndex = previousClusters.findIndex((candidate, index) =>
        !usedPrevious.has(index) && clusterIdentityMatch(bare, candidate)
      );
      if (matchIndex >= 0) {
        const previousColor = previousClusters[matchIndex].color;
        if (IDENTITY_COLOR_KEY_SET.has(previousColor) && !takenColors.has(previousColor)) {
          usedPrevious.add(matchIndex);
          takenColors.add(previousColor);
          const next = withSettledColor(bare, previousColor);
          if (next !== cluster) clustersChanged = true;
          return next;
        }
      }
      if (bare !== cluster) clustersChanged = true;
      return bare;
    })
    : null;

  let clusters = settledClusters;
  if (settledClusters) {
    const available = IDENTITY_COLOR_KEYS.filter(color => !takenColors.has(color));
    let nextIndex = 0;
    clusters = settledClusters.map(cluster => {
      if (!cluster || typeof cluster !== "object" || Array.isArray(cluster) || cluster.color) {
        return cluster;
      }
      const color = available.length
        ? available[nextIndex++ % available.length]
        : IDENTITY_COLOR_KEYS[nextIndex++ % IDENTITY_COLOR_KEYS.length];
      clustersChanged = true;
      return withSettledColor(cluster, color);
    });
  }

  const previousLensColors = new Map();
  for (const lens of previousDocument?.lenses || []) {
    if (lens && typeof lens === "object" && lens.id && IDENTITY_COLOR_KEY_SET.has(lens.color)) {
      previousLensColors.set(lens.id, lens.color);
    }
  }
  let lensesChanged = false;
  const lenses = Array.isArray(document.lenses)
    ? document.lenses.map(lens => {
      if (!lens || typeof lens !== "object" || Array.isArray(lens)) return lens;
      const kept = lens.id ? previousLensColors.get(lens.id) : undefined;
      if (!kept) {
        const next = withoutColor(lens);
        if (next !== lens) lensesChanged = true;
        return next;
      }
      const next = withSettledColor(lens, kept);
      if (next !== lens) lensesChanged = true;
      return next;
    })
    : null;

  if (!clustersChanged && !lensesChanged) return document;
  return {
    ...document,
    ...(clusters ? { clusters } : {}),
    ...(lenses ? { lenses } : {})
  };
}

// Give comparative lenses colors that are absent from the current board
// before reusing any cluster hue. Array order makes the result deterministic,
// so saved assignments and mode switches never change their appearance.
// A per-lens `color` is an exceptional author override and takes precedence.
export function lensColorMap(puzzle) {
  const lenses = puzzle?.lenses || [];
  const clusterColors = new Set(
    (puzzle?.clusters || []).map(cluster => cluster.color).filter(Boolean)
  );
  const explicitColors = new Set(
    lenses.map(lens => lens.color).filter(color => IDENTITY_COLOR_KEY_SET.has(color))
  );
  const candidates = [
    ...IDENTITY_COLOR_KEYS.filter(color =>
      !clusterColors.has(color) && !explicitColors.has(color)
    ),
    ...IDENTITY_COLOR_KEYS.filter(color =>
      clusterColors.has(color) && !explicitColors.has(color)
    )
  ];
  const colors = new Map();
  let automaticIndex = 0;
  lenses.forEach(lens => {
    if (IDENTITY_COLOR_KEY_SET.has(lens.color)) {
      colors.set(lens.id, lens.color);
      return;
    }
    const available = candidates.length ? candidates : IDENTITY_COLOR_KEYS;
    colors.set(lens.id, available[automaticIndex % available.length]);
    automaticIndex++;
  });
  return colors;
}
