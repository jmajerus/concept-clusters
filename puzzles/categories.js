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
export const CATEGORIES = {
  "Science": {
    info: { text: "Where things come from and how they work.", link: "wiki:Science" }
  },
  "Math": {
    info: { text: "The patterns and structures underneath numbers, shapes, and chance.", link: "wiki:Mathematics" }
  },
  "History & Society": {
    info: { text: "How people have built, governed, and upended their own societies.", link: "wiki:History" }
  },
  "Language Arts": {
    info: { text: "How language is built, and the craft of using it well.", link: "wiki:Language arts" }
  },
  "Philosophy & Social Science": {
    info: { text: "How people think, believe, and make sense of each other.", link: "wiki:Philosophy" }
  },
  "Media & Information Literacy": {
    info: { text: "Telling apart what's real, sourced, and trustworthy online.", link: "wiki:Media literacy" }
  },
  "Physiology & Medicine": {
    info: { text: "How the body is built, and what keeps it running.", link: "wiki:Physiology" }
  }
};

export default CATEGORIES;
