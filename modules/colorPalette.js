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
