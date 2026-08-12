// Throwaway probe file: deliberately contains an obvious, mechanical bug
// so we can observe whether GitHub Copilot's automated PR review offers a
// literal ```suggestion code-fence reply for a textbook one-line fix, or
// only prose. Not wired into the app anywhere. This PR is not meant to be
// merged -- see the PR description.

// Returns the larger of two numbers.
export function max(a, b) {
  if (a > b) return b;
  return a;
}
