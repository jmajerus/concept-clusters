import { readFileSync, writeFileSync } from "node:fs";

const path = "modules/starRenderer.js";
const source = readFileSync(path, "utf8");

const oldCreation = `    nodeG.filter(d => !isBridge(d)).append("text").attr("class", "ideal-tag").attr("dy", 27).attr("text-anchor", "middle");`;
const newCreation = `    nodeG.filter(d => !isBridge(d)).append("text").attr("class", "ideal-tag").attr("text-anchor", "middle");`;

const oldPosition = `      nodeG.attr("transform", d => \`translate(\${d.x},\${d.y})\`);
      titleG.attr("transform", d => \`translate(\${d.x},\${d.y})\`);`;
const newPosition = `      // Ideal-target captions normally sit below their pills. Flip them
      // above only when the node is close enough to the bottom edge that
      // the caption would extend outside the SVG viewBox. The pill itself
      // remains in the same position; only its explanatory annotation moves.
      nodeG.select(".ideal-tag")
        .attr("dy", d => d.y > H - 42 ? -21 : 27);
      nodeG.attr("transform", d => \`translate(\${d.x},\${d.y})\`);
      titleG.attr("transform", d => \`translate(\${d.x},\${d.y})\`);`;

function replaceOnce(text, before, after, label) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one target, found ${count}`);
  return text.replace(before, after);
}

let updated = replaceOnce(source, oldCreation, newCreation, "caption creation");
updated = replaceOnce(updated, oldPosition, newPosition, "position rendering");
writeFileSync(path, updated);
