// Encoding for the &moves=<encoded> share-link param (see the "Sharing
// links" section in docs/DEVELOPMENT.md). Pure data in, data out -- no
// dependency on game state, D3, or the DOM -- so this is safe to unit
// test directly and to reuse from anywhere that needs it.

const MOVE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const MOVE_CHAR_TO_INDEX = new Map([...MOVE_ALPHABET].map((c, i) => [c, i]));

// One character per node id (6 bits, 0-63) — today's largest puzzle
// has 19 nodes, so this leaves plenty of headroom before it'd need to
// change to two characters per id.
export function encodeMoves(moveHistory) {
  return moveHistory.map(m => MOVE_ALPHABET[m.source] + MOVE_ALPHABET[m.target]).join("");
}

export function decodeMoves(encoded, nodeCount) {
  if (!encoded || encoded.length % 2 !== 0) return null;
  const moves = [];
  for (let i = 0; i < encoded.length; i += 2) {
    const source = MOVE_CHAR_TO_INDEX.get(encoded[i]);
    const target = MOVE_CHAR_TO_INDEX.get(encoded[i + 1]);
    if (source === undefined || target === undefined || source >= nodeCount || target >= nodeCount) return null;
    moves.push({ source, target });
  }
  return moves;
}
