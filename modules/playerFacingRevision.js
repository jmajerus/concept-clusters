// The lesson date is a human claim that the words the player reads changed.
// Shelf, provenance, board flags, and layout are outside this projection, so
// a publish that only moves those does not qualify.

const PLAYER_FACING_FIELDS = Object.freeze([
  "title",
  "info",
  "clusters",
  "bridges",
  "learningIntroduction",
  "lenses",
  "relatedPuzzles"
]);

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, stableValue(value[key])])
  );
}

export function playerFacingProjection(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return {};
  const projection = {};
  for (const key of PLAYER_FACING_FIELDS) {
    if (document[key] !== undefined) projection[key] = document[key];
  }
  return stableValue(projection);
}

export function samePlayerFacingProjection(left, right) {
  return JSON.stringify(playerFacingProjection(left))
    === JSON.stringify(playerFacingProjection(right));
}

export function utcMonthYear(isoDate) {
  const source = isoDate instanceof Date ? isoDate.toISOString() : String(isoDate || "");
  const match = /^(\d{4})-(\d{2})-\d{2}/.exec(source);
  if (!match) return "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}

export function revisedLessonLabel(now = new Date()) {
  const month = utcMonthYear(now);
  return month ? `Revised ${month}` : "Revised";
}

// One line. Revised only when a marked revision falls in a later month than
// the first publication. A same-month mark, an unmarked edit, and a first
// publication all stay "First published".
export function lessonPublicationLine({ firstPublishedAt = null, contentRevisedAt = null } = {}) {
  const first = utcMonthYear(firstPublishedAt);
  const revised = utcMonthYear(contentRevisedAt);
  if (first && revised && first !== revised) return `Revised ${revised}`;
  const label = first || revised;
  return label ? `First published ${label}` : "";
}

// `live` is the published row's stamp (carried forward when this publish is
// not a marked revision). `marked` is true only for the revision being written.
export function contentRevisedStamp({
  kind,
  previousDocument = null,
  nextDocument = null,
  markRevised = false,
  now,
  previousStamp = null
} = {}) {
  const carried = previousStamp || null;
  if (kind !== "puzzle") return { live: null, marked: false };
  if (!previousDocument || markRevised !== true) return { live: carried, marked: false };
  if (samePlayerFacingProjection(previousDocument, nextDocument)) {
    return { live: carried, marked: false };
  }
  return { live: now, marked: true };
}
