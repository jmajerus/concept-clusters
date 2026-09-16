// Generated from content/puzzles/mountains-reading-the-range.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "mountains-reading-the-range",
  "title": "Reading a Range: Types and Structures",
  "category": "geology",
  "info": {
    "text": "Ranges are legible twice over: their overall architecture records the tectonic force that raised them, and their internal structures record which way the crust was squeezed or stretched. Learn both readings — five range types, and the folds, faults, and fault blocks they are built from.",
    "citations": [
      {
        "title": "Mountain — Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Mountain"
      },
      {
        "title": "Fault (geology) — Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Fault_(geology)"
      },
      {
        "title": "Orogeny — Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Orogeny"
      }
    ]
  },
  "clusters": [
    {
      "id": "built-forms",
      "name": "Built Forms — Range Types",
      "color": "teal",
      "fact": "Whole ranges come in distinct architectures, each encoding how it was made: collisions crumple crust into fold ranges, stretching breaks it into tilted fault blocks, subduction raises volcanic chains, stalled magma balloons domes, and erosion carves survivors out of uplifted plateaus.",
      "terms": [
        "volcanic mountains",
        "fold mountains",
        "fault-block mountains",
        "dome mountains",
        "plateau mountains"
      ],
      "seeds": [
        "volcanic mountains",
        "fold mountains"
      ],
      "termInfo": {
        "dome mountains": "Magma that bulged the crust but never erupted; once the roof erodes, a rounded uplift of solidified rock remains — Navajo Mountain.",
        "fault-block mountains": "Ranges made of crust broken into tilted blocks by stretching: uplifted blocks rise as ranges between dropped basins — the Basin and Range province.",
        "fold mountains": "Ranges crumpled out of compressed crust where continents collide: shortening folds and thrusts the layers, thickening the crust — Alps, Himalaya, Jura.",
        "plateau mountains": "Survivors rather than builders: mountains carved out of an uplifted plateau as water and ice strip the weaker rock away — the Catskills.",
        "volcanic mountains": "Ranges built of erupted magma, typically above a subducting plate — the Andes and Cascades — or over hotspots, like Fuji."
      },
      "info": "Mountains are classified by the process that made them, not by how tall or pointy they are: the five types below each name a different construction (or, for plateaus, a different demolition)."
    },
    {
      "id": "deformation-structures",
      "name": "Deformation Structures",
      "color": "blue",
      "fact": "Zoom in and every range is built of record-keeping structures: compressed layers fold into anticlines and synclines and shear along low-angle thrusts that stack up nappes, while stretched crust drops grabens between standing horsts — each structure tells you which way the crust was squeezed.",
      "terms": [
        "anticline",
        "syncline",
        "thrust fault",
        "horst",
        "graben",
        "nappe"
      ],
      "seeds": [
        "anticline",
        "syncline"
      ],
      "termInfo": {
        "anticline": "An up-arched fold, layers bent like a rainbow; long-eroded anticline cores form many straight mountain ridges.",
        "graben": "A block of crust dropped between normal faults that dip toward each other — the basin or rift valley, as in the East African Rift.",
        "horst": "A block of crust left standing high between two normal faults that dip away from each other — the mountain between the basins.",
        "nappe": "A huge sheet of rock carried far sideways on a thrust and stacked like shingles; the Alps are a stack of them.",
        "syncline": "The down-arched trough between anticlines, with the youngest rock layers toward its axis.",
        "thrust fault": "A gently dipping break along which one slab of crust rides up and over another, stacking slices of rock — subduction megathrusts are the largest."
      },
      "info": "Two stress regimes write everything here: compression (squeezing) folds layers and thrusts them upward; extension (pulling apart) breaks crust into standing and dropped blocks."
    }
  ],
  "bridges": [
    {
      "id": "ranges-built-of-structures",
      "term": "ranges are built of structures",
      "clusters": [
        0,
        1
      ],
      "fact": "Range types decompose into rock-scale structures: fold mountains are trains of anticlines and synclines riding thrusts, and fault-block ranges are horsts alternating with grabens — Basin and Range is a province-sized swarm of them.",
      "info": "Whole-range types and outcrop-scale structures are the same story at two zoom levels: compression writes folds and thrusts, extension writes horsts and grabens."
    }
  ],
  "lenses": [
    {
      "id": "magma-two-ways",
      "prompt": "Magma builds two of these range types — erupting onto the surface in one, stalling and hardening underground in the other. Which two?",
      "explanation": "Volcanic mountains are eruptive constructs; dome mountains are intrusions whose rounded uplift is exposed only after the roof rock erodes. Fold, fault-block, and plateau mountains involve no fresh magma at all.",
      "targets": [
        "volcanic mountains",
        "dome mountains"
      ],
      "reasons": {
        "dome mountains": "Built by magma that intruded and solidified without erupting.",
        "volcanic mountains": "Built by erupted magma, as above subduction zones or hotspots."
      }
    },
    {
      "id": "erosion-as-author",
      "prompt": "One of these range types is defined by what erosion removed rather than by what a geological process built. Which one?",
      "explanation": "Plateau mountains are the resistant leftovers of an uplifted plateau — the Catskills are the textbook case. Every other type here is named for the process that constructed it; erosion only exposes the domes, it does not define them.",
      "targets": [
        "plateau mountains"
      ],
      "reasons": {
        "plateau mountains": "Erosion is the author: mountains are what remains after the plateau around them is stripped away."
      }
    },
    {
      "id": "stretched-not-squeezed",
      "prompt": "These structures are fingerprints of a crust being pulled apart. Which are they?",
      "explanation": "Horsts and grabens are the standing and dropped blocks of normal-fault systems under extension — Basin and Range is a province-sized swarm of them. Anticlines, synclines, thrusts, and nappes all record compression instead.",
      "targets": [
        "horst",
        "graben"
      ],
      "reasons": {
        "graben": "A downdropped block between normal faults dipping toward each other — pure extension.",
        "horst": "An upstanding block between normal faults dipping away from each other — pure extension."
      }
    }
  ],
  "lensMode": "sequential",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "mountains-life-of-a-range",
        "reason": "Play the life cycle first: this board reads the anatomy — range types and structures — that the cycle of building, buoying, and erosion produces."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "optional",
    "title": "Reading Mountains",
    "summary": "A short orientation: every range records the forces that built it and the erosion that unmakes it, readable at the scale of whole ranges and of single outcrops.",
    "estimatedMinutes": 2,
    "content": {
      "mediaType": "text/markdown",
      "text": "Every mountain range is a document written in rock. Its overall architecture — a crumpled belt, a swarm of tilted blocks, a chain of volcanic peaks — announces the tectonic force that raised it, and its smaller details, from folded strata to downdropped valleys, record the direction the crust was pushed or pulled while it rose.\r\n\r\nGeology reads that document at both scales. To read a landscape the way a geologist does is to see not just scenery but a record of forces: where plates collided, where crust stretched and thinned, where magma found a path upward, and where erosion has been quietly rewriting everything since."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  }
});
