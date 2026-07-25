// Optional metadata for puzzle categories, keyed by the exact `category`
// string used on puzzle objects (see puzzles/index.js and each puzzle
// file). A category is otherwise just an implied grouping -- any string
// a puzzle uses for `category` is a valid category, registered here or
// not -- so this is purely additive: an unregistered category (the
// common case today) simply shows no subtitle on its overview screen
// (see showOverview in game.js), never an error.
//
// Shape, same as a cluster's `info` (see AUTHORING.md's "Cluster info &
// links" and "Category info" sections): { info: { text, link, extraLink } }.
// `text` is genuinely useful here (unlike a cluster, a category has no
// other reveal mechanism -- nothing plays the role `fact` does), and is
// shown as the overview screen's subtitle when browsing that category
// (?category=<name> or the "Browse: <category>" button).
//
// Example:
//   "Science": {
//     info: { text: "Where things come from and how they work.", link: "wiki:Science" }
//   }
export const CATEGORIES = {};

export default CATEGORIES;
