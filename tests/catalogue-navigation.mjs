import assert from "node:assert/strict";
import { parseCatalogueRoute, routeSearch } from "../modules/catalogueNavigation.js";

export const name = "catalogue routes: admin opens the library and keeps play";

const puzzles = [{ id: "energy-flow", title: "Energy flow", category: "science" }];

export async function run() {
  assert.equal(parseCatalogueRoute(new URLSearchParams("admin"), puzzles, []).kind, "library");
  assert.equal(parseCatalogueRoute(new URLSearchParams("admin=&mode=star"), puzzles, []).kind, "library");
  assert.equal(parseCatalogueRoute(new URLSearchParams("mode=star"), puzzles, []).kind, "default");
  assert.equal(parseCatalogueRoute(new URLSearchParams(""), puzzles, []).kind, "library");
  assert.equal(parseCatalogueRoute(new URLSearchParams("puzzle=missing"), puzzles, []).kind, "default");

  assert.equal(
    routeSearch({ kind: "library" }, null, { admin: true }),
    "?library&admin"
  );
  assert.equal(
    routeSearch({ kind: "puzzle", puzzleId: "energy-flow" }, "star", { admin: true, play: true }),
    "?puzzle=energy-flow&mode=star&admin&play"
  );
  assert.equal(
    routeSearch({ kind: "puzzle", puzzleId: "energy-flow" }, null),
    "?puzzle=energy-flow"
  );
}
