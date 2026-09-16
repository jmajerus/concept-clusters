// Generated from content/puzzles/rocks-formation-cycle.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "rocks-formation-cycle",
  "title": "Rocks: How They Form and Change",
  "category": "geology",
  "large": true,
  "info": {
    "text": "Learn how the three rock families — igneous, sedimentary, metamorphic — form, and how the rock cycle converts material between them: a rock’s kind is a record of the process that last remade it.",
    "citations": [
      {
        "title": "Igneous rock",
        "author": "Albert M. Kudo",
        "publisher": "Encyclopaedia Britannica",
        "url": "https://www.britannica.com/science/igneous-rock"
      },
      {
        "title": "Sedimentary rock",
        "publisher": "Encyclopaedia Britannica",
        "url": "https://www.britannica.com/science/sedimentary-rock"
      },
      {
        "title": "Metamorphic rock",
        "publisher": "Encyclopaedia Britannica",
        "url": "https://www.britannica.com/science/metamorphic-rock"
      },
      {
        "title": "Rock cycle",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Rock_cycle"
      }
    ]
  },
  "clusters": [
    {
      "id": "igneous",
      "name": "Igneous — frozen melt",
      "color": "teal",
      "fact": "Crystallized or quenched from molten rock: magma that cools slowly at depth grows large visible crystals (granite, gabbro), while lava chilled at the surface freezes fine-grained (basalt), glassy (obsidian), or frothy with trapped gas (pumice).",
      "terms": [
        "granite",
        "basalt",
        "obsidian",
        "pumice",
        "gabbro"
      ],
      "seeds": [
        "granite",
        "basalt"
      ],
      "termInfo": {
        "granite": "Silica-rich rock crystallized slowly at depth: interlocking quartz, feldspar, and mica — the continental crust’s signature stone.",
        "basalt": "Dark, fine-grained lava rock; it floors every ocean basin where magma cools quickly at the surface.",
        "obsidian": "Volcanic glass: lava chilled so fast that no crystals formed — jet black with sharp, curved fractures.",
        "pumice": "Frothy volcanic glass frozen around escaping gas bubbles — the rock that floats.",
        "gabbro": "Basalt’s coarse twin: the same dark magnesium-and-iron-rich melt, crystallized slowly underground with visible crystals."
      }
    },
    {
      "id": "sedimentary",
      "name": "Sedimentary — assembled at the surface",
      "color": "blue",
      "fact": "Built from accumulated material, then buried: weathered sand and mud, shells and precipitated calcite, or compressed plant matter — all cemented into rock at near-surface conditions, unlike rocks crystallized or recrystallized deep in the crust.",
      "terms": [
        "sandstone",
        "coal",
        "shale",
        "limestone",
        "conglomerate"
      ],
      "seeds": [
        "sandstone",
        "coal"
      ],
      "termInfo": {
        "sandstone": "Cemented sand: individually visible, usually quartz-rich grains whose rounding and sorting record the sand’s journey.",
        "shale": "Cemented mud: fine flakes stacked in paper-thin layers — the most abundant sedimentary rock.",
        "limestone": "Calcite rock from shell banks, reefs, or precipitated waters — the carbonate exception that fizzes in dilute acid.",
        "conglomerate": "Cemented rounded gravel: pebbles tumbled far enough in moving water to lose their edges.",
        "coal": "Compressed plant matter from stagnant swamps: peat buried and carbon-enriched through the coal ranks."
      }
    },
    {
      "id": "metamorphic",
      "name": "Metamorphic — changed in the solid state",
      "color": "amber",
      "fact": "Recrystallized from pre-existing rock by heat and directed stress without melting: limestone becomes marble, shale becomes slate, sandstone becomes quartzite, and deeply buried granite can band itself into gneiss.",
      "terms": [
        "marble",
        "slate",
        "gneiss",
        "quartzite"
      ],
      "seeds": [
        "marble",
        "slate"
      ],
      "termInfo": {
        "marble": "Recrystallized limestone: calcite grains fused into a sugary, sparkling rock — the sculptor’s stone.",
        "slate": "Recrystallized shale: microscopic micas aligned by directed pressure give it perfect flat cleavage.",
        "gneiss": "High-grade and banded: granite-like minerals separated into light and dark stripes by intense heat and squeeze.",
        "quartzite": "Recrystallized sandstone: quartz grains fused so thoroughly the rock breaks through grains, not around them."
      }
    },
    {
      "id": "cycle-verbs",
      "name": "Rock-cycle processes",
      "color": "magenta",
      "fact": "The verbs that convert material between the three families over geologic time: weathering breaks exposed rock down at the surface, deposition and compaction bury the debris, melting remakes it underground, and crystallization turns that melt solid.",
      "terms": [
        "weathering",
        "melting",
        "deposition",
        "compaction",
        "crystallization"
      ],
      "seeds": [
        "weathering",
        "melting"
      ],
      "termInfo": {
        "weathering": "Break-down of rock in place at the surface — frost, roots, and dissolving water; it makes sediment, it does not move it.",
        "deposition": "Settling: water, wind, or ice finally slows and drops its sediment load in a basin.",
        "compaction": "Burial squeezing: the weight of newer layers presses grains together and drives water out.",
        "melting": "Rock heated past its melting point deep underground — the cycle’s reset that turns any family back into magma.",
        "crystallization": "A cooling melt ordering itself into minerals — the step that makes every igneous rock."
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-magma",
      "term": "magma",
      "clusters": [
        0,
        3
      ],
      "fact": "Molten rock underground; when it loses heat it crystallizes — the cycle step that produces every igneous rock, coarse-grained at depth (granite, gabbro) and fine-grained or glassy at the surface (basalt, obsidian).",
      "info": "Melt rises because it is less dense than the rock around it; whether it stalls at depth or erupts decides its texture."
    },
    {
      "id": "bridge-lithification",
      "term": "lithification",
      "clusters": [
        1,
        3
      ],
      "fact": "Buried sediment becomes rock: compaction squeezes grains together and cementation — minerals precipitating between them — glues sand into sandstone and mud into shale.",
      "info": "Natural cements are usually calcite, silica, or iron oxide — the same minerals that later tint the rock red, brown, or white."
    },
    {
      "id": "bridge-metamorphism",
      "term": "metamorphism",
      "clusters": [
        2,
        3
      ],
      "fact": "Heat and directed stress recrystallize any rock in the solid state — no melting required; buried deeply enough, limestone emerges as marble and shale as slate, marking the cycle's path into the third family.",
      "info": "Regional metamorphism builds mountain belts; its local cousin, contact metamorphism, simply bakes rock touching an intrusion."
    },
    {
      "id": "bridge-sediment",
      "term": "sediment",
      "clusters": [
        0,
        1
      ],
      "fact": "Weathering and erosion of exposed igneous rock — Earth is mostly igneous beneath a thin sedimentary veneer — supply the sand, mud, and gravel that burial turns into sedimentary rock.",
      "info": "Sediment is rock-in-waiting: a sand grain stays sand only until burial cements its neighbors to it."
    },
    {
      "id": "bridge-subduction",
      "term": "subduction",
      "clusters": [
        0,
        2
      ],
      "fact": "Where plates drag rock deep toward the mantle, rising temperature and pressure first recrystallize it and then melt it into new magma — the cycle's closing turn back into igneous rock.",
      "info": "Subduction zones are the cycle’s engine rooms: slabs drag surface rock down to the melting zone and feed the volcanoes above."
    }
  ],
  "lenses": [
    {
      "id": "mafic-twins",
      "prompt": "One mafic chemistry, two cooling stories: which rock grew visible crystals slowly at depth, and which quenched fine-grained at the surface?",
      "explanation": "Gabbro and basalt share the same iron-and-magnesium-rich magma; only cooling speed differs — slow at depth grows visible crystals, fast at the surface freezes a fine grain. Granite is ruled out by chemistry (silica-rich, not mafic), and obsidian is glass rather than crystals.",
      "targets": [
        "gabbro",
        "basalt"
      ],
      "reasons": {
        "gabbro": "Mafic magma cooled slowly underground: pyroxene and plagioclase grew visible crystals.",
        "basalt": "The same mafic melt erupted and chilled fast: crystals stayed microscopic."
      }
    },
    {
      "id": "burial-pair",
      "prompt": "After weathering loosens a mountain’s grains, which two verbs must act before they are rock again — one settles them, one squeezes them solid?",
      "explanation": "Deposition ends the journey: currents drop their load in a basin. Compaction begins the making: burial pressure packs grains until cement can bind them. Melting overshoots into new magma, crystallization is the melt-side step that makes igneous rock, and weathering already happened in the stem — it loosens grains but never binds them.",
      "targets": [
        "deposition",
        "compaction"
      ],
      "reasons": {
        "deposition": "Settles the sediment load in a basin — step one of the return to rock.",
        "compaction": "Burial pressure packs grains together, ready for cement."
      }
    },
    {
      "id": "protolith-pairs",
      "prompt": "Metamorphic rocks remember their parents: which term is limestone’s recrystallized self, and which is the rock that mud becomes under a squeeze?",
      "explanation": "Marble is limestone recrystallized — calcite grains fused, chemistry unchanged — and slate is shale’s squeezed equivalent, its clay flakes realigned into flat cleavage. Quartzite is the near-miss: sandstone’s child, not limestone’s or mud’s; gneiss is granite’s banded equivalent.",
      "targets": [
        "marble",
        "slate"
      ],
      "reasons": {
        "marble": "Limestone’s calcite recrystallized into interlocking sugary grains.",
        "slate": "Shale’s clay minerals realigned by directed pressure into flat cleavage."
      }
    }
  ],
  "lensMode": "sequential",
  "learningIntroduction": {
    "requirement": "optional",
    "title": "Every rock is a snapshot",
    "estimatedMinutes": 3,
    "content": {
      "mediaType": "text/markdown",
      "text": "Earth recycles its surface. Melt rising from the interior hardens into igneous rock; exposure to air and water breaks any rock down into grains and dissolved ions; those settle in basins, get buried, and cement into sedimentary rock; and burial to great depth bakes and squeezes rock into metamorphic forms — until heat finally melts it and the journey begins again.\r\n\r\nThe point to carry away: a rock’s kind is not an identity but a state. Granite was not always granite, and limestone was not always limestone — each is a snapshot of whichever process last remade it. Given enough time and a ticket downward or upward, any rock becomes any other."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Kilo Code (GLM 5.3 Flash)",
        "reasoning": "default"
      }
    ]
  }
});
