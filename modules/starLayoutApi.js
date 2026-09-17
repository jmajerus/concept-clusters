// Backward-compatible module name. Layout authoring is mode-neutral now;
// callers should import layoutApi.js directly.
export {
  saveLayout,
  clearLayout,
  saveStarLayout,
  clearStarLayout
} from "./layoutApi.js";
