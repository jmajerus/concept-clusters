// Generated from content/puzzles/tnm-cancer-staging.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "tnm-cancer-staging",
  "title": "Reading a Cancer's Address — T, N, and M",
  "category": "medicine",
  "subcategories": {
    "medicine": "oncology"
  },
  "info": {
    "text": "Every cancer chart carries an address like cT2 N1 M0. This board teaches the TNM grammar — the three axes of primary tumor, regional nodes, and distant metastasis; the prefixes that time the assessment and the grade that refines prognosis; and the Roman-numeral stage groups that condense the axes into the number that decides treatment.",
    "citations": [
      {
        "title": "TNM staging system",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/TNM_staging_system"
      },
      {
        "title": "Cancer staging",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Cancer_staging"
      }
    ]
  },
  "clusters": [
    {
      "id": "tumor",
      "name": "T — the primary tumor",
      "color": "teal",
      "fact": "T grades the original tumor: from no evidence (T0), through cells still in place (Tis), a small primary (T1), to frank invasion of nearby structures (T4) — with Tx for the tumor that cannot be assessed.",
      "terms": [
        "Tis — carcinoma in situ",
        "T4 — invades nearby structures",
        "T0 — no evidence of tumor",
        "T1 — small primary tumor",
        "Tx — cannot be assessed"
      ],
      "seeds": [
        "Tis — carcinoma in situ",
        "T4 — invades nearby structures"
      ],
      "termInfo": {
        "T0 — no evidence of tumor": "No evidence of a primary tumor — the category used when no original can be demonstrated.",
        "T1 — small primary tumor": "A small primary; the exact cutoff is organ-specific — centimeters in breast or lung, depth of invasion in the bowel wall.",
        "T4 — invades nearby structures": "Frank invasion: the tumor has grown beyond its organ into adjacent structures — chest wall, skin, neighboring organs.",
        "Tis — carcinoma in situ": "Carcinoma in situ: abnormal cells that have not invaded beyond their normal place — stage 0 disease, wholly local.",
        "Tx — cannot be assessed": "The primary cannot be assessed — no information to grade it."
      },
      "info": {
        "text": "Size of the original tumor and whether it has invaded nearby tissue.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/TNM_staging_system",
            "label": "TNM staging system — T"
          }
        ]
      }
    },
    {
      "id": "nodes",
      "name": "N — the regional nodes",
      "color": "blue",
      "fact": "N is its own axis: whether regional lymph nodes are involved (N0 versus N1) and how numerous or distant the involved nodes are (N3) — independent of how small the primary remains. Nx means the nodes cannot be assessed.",
      "terms": [
        "N0 — no regional node spread",
        "N1 — regional node metastasis",
        "N3 — numerous regional nodes",
        "Nx — nodes cannot be assessed"
      ],
      "seeds": [
        "N0 — no regional node spread",
        "N1 — regional node metastasis"
      ],
      "termInfo": {
        "N0 — no regional node spread": "No regional lymph node metastasis.",
        "N1 — regional node metastasis": "Regional node metastasis present — the first positive hop along the lymphatic drainage.",
        "N3 — numerous regional nodes": "Spread to more numerous or more distant regional nodes (not used at every site).",
        "Nx — nodes cannot be assessed": "The regional nodes cannot be assessed — for example, no dissection performed."
      },
      "info": {
        "text": "Involvement of the nearby (regional) lymph nodes.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/TNM_staging_system",
            "label": "TNM staging system — N"
          }
        ]
      }
    },
    {
      "id": "metastasis",
      "name": "M — distant spread",
      "color": "amber",
      "fact": "The metastasis axis is binary at heart: M0 (none found) versus M1 (spread beyond regional nodes to distant organs) — and M1 alone makes the cancer stage IV.",
      "terms": [
        "M1 — distant organ metastasis",
        "M0 — no distant metastasis"
      ],
      "seeds": [
        "M1 — distant organ metastasis"
      ],
      "termInfo": {
        "M0 — no distant metastasis": "No distant metastasis found.",
        "M1 — distant organ metastasis": "Spread beyond the regional nodes to distant organs. M1 alone makes the cancer stage IV, whatever the T and N say."
      },
      "info": {
        "text": "Distant metastasis — the axis that outranks the others: one positive finding changes the Roman numeral to IV.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/TNM_staging_system",
            "label": "TNM staging system — M"
          }
        ]
      }
    },
    {
      "id": "annotation",
      "name": "How staging is written — prefixes and neighbors",
      "color": "magenta",
      "fact": "The annotation layer records when and how the stage was made — c from clinical evidence, p from the specimen, y after neoadjuvant therapy, r at recurrence — plus the neighbors: R for tumor left behind after surgery, and G for grade, how abnormal the cells look, which is not anatomy but folds into prognostic stage groups.",
      "terms": [
        "c — clinical staging",
        "p — pathological staging",
        "y — after neoadjuvant therapy",
        "r — recurrent tumor",
        "R — residual tumor classification",
        "G — grade: cell abnormality"
      ],
      "seeds": [
        "c — clinical staging",
        "p — pathological staging"
      ],
      "termInfo": {
        "G — grade: cell abnormality": "Grade — how abnormal the cells look: G1 well differentiated and slow to G4 undifferentiated. Not TNM anatomy, but AJCC prognostic stage groups may fold it in.",
        "R — residual tumor classification": "Grades what surgery left behind — R0 in a staging line means no residual tumor; uppercase R to distinguish it from recurrent r.",
        "c — clinical staging": "Stage determined from evidence acquired before treatment — exam, blood tests, imaging, biopsy, endoscopy. The prefix is implicit if no p appears.",
        "p — pathological staging": "Stage given by histopathologic examination of the surgical specimen — it adds what clinical staging cannot see.",
        "r — recurrent tumor": "Stage for a recurrent tumor after a disease-free interval. Lowercase r — do not confuse with residual R.",
        "y — after neoadjuvant therapy": "Stage assessed after chemotherapy and/or radiation therapy — it can differ from the clinical stage at diagnosis."
      },
      "info": {
        "text": "Lowercase prefixes time the assessment; uppercase R (residual) and G (grade) carry post-surgical and cellular information.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/TNM_staging_system",
            "label": "TNM staging system — prefixes and parameters"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-stage-groups",
      "term": "Stage groups",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "The many T-N-M combinations are condensed into stage groups 0–IV that are homogeneous in survival: stage 0 is carcinoma in situ, stage I localized, stage IV metastasized — most stage I tumors are curable, most stage IV tumors are inoperable, and any M1 makes the cancer stage IV.",
      "info": "Stage groups are the output the three axes are read for — prognosis and treatment both hang on the Roman numeral.",
      "relationKind": "foundation"
    },
    {
      "id": "bridge-c-to-p",
      "term": "From c to p",
      "clusters": [
        0,
        3
      ],
      "fact": "Clinical stage is assigned from pre-treatment evidence — exam, imaging, biopsy — and the pathological prefix upgrades it from the resected specimen; neoadjuvant therapy re-stages the tumor as y, which is why a stage can change mid-course.",
      "info": "The same tumor can carry different codes at different moments: c before surgery, p after it, y after drugs or radiation.",
      "relationKind": "dynamic"
    },
    {
      "id": "bridge-axes-separate",
      "term": "Size is not spread",
      "clusters": [
        0,
        1
      ],
      "fact": "The axes are kept separate so a small primary with nodal metastasis (T1 N1) is recorded as exactly that — tumor size and nodal status each carry their own prognostic weight and neither stands in for the other.",
      "info": "A tiny tumor is not automatically an early one: the N axis can already carry bad news.",
      "relationKind": "contrast",
      "idealTerms": [
        "T1 — small primary tumor",
        "N1 — regional node metastasis"
      ]
    }
  ],
  "lenses": [
    {
      "id": "lens-m1-trumps",
      "prompt": "A tiny primary with one involved node has just been found to hold a liver deposit. Which single value changes the Roman numeral to IV?",
      "explanation": "Whatever the T and N say, one positive finding on the M axis moves the Roman numeral to IV — the axis that outranks the others.",
      "targets": [
        "M1 — distant organ metastasis"
      ],
      "reasons": {
        "M1 — distant organ metastasis": "Distant spread outranks everything: M1 makes the cancer stage IV."
      }
    },
    {
      "id": "lens-case-contrast",
      "prompt": "Which two values differ only by letter case — one meaning the tumor has come back after remission, the other grading what surgery left behind?",
      "explanation": "Case carries meaning in staging: lowercase r is recurrence at re-staging, uppercase R is residual disease after surgery.",
      "targets": [
        "R — residual tumor classification",
        "r — recurrent tumor"
      ],
      "reasons": {
        "R — residual tumor classification": "Uppercase R: residual tumor after surgery (R0 means none).",
        "r — recurrent tumor": "Lowercase r: a tumor re-appearing after a disease-free interval."
      }
    },
    {
      "id": "lens-neoadjuvant",
      "prompt": "Before any operation the chart reads cT2 N1 M0; months later the tumor is smaller. Which prefix marks a stage re-assessed after drugs or radiation shrank it?",
      "explanation": "y is the neoadjuvant re-staging — after chemotherapy or radiation have shrunk the tumor first. p upgrades after surgery; y re-times the stage after drugs or radiation.",
      "targets": [
        "y — after neoadjuvant therapy"
      ],
      "reasons": {
        "y — after neoadjuvant therapy": "Assessed after chemotherapy and/or radiation — the post-treatment re-stage."
      }
    },
    {
      "id": "lens-in-situ",
      "prompt": "Which value places abnormal cells still in their normal position — stage 0, before any invasion?",
      "explanation": "In situ is stage 0: the cells have not invaded beyond their normal place — the boundary every invasive cancer once stood before.",
      "targets": [
        "Tis — carcinoma in situ"
      ],
      "reasons": {
        "Tis — carcinoma in situ": "Carcinoma in situ — 'in its place' — wholly local, stage 0."
      }
    },
    {
      "id": "lens-small-spread",
      "prompt": "Which pair of codes together records a small primary that has already seeded one regional node?",
      "explanation": "The axes are recorded separately precisely so 'small but spread' reads honestly: neither number stands in for the other.",
      "targets": [
        "N1 — regional node metastasis",
        "T1 — small primary tumor"
      ],
      "reasons": {
        "N1 — regional node metastasis": "One positive regional hop — nodal metastasis present.",
        "T1 — small primary tumor": "The small primary itself."
      }
    },
    {
      "id": "lens-grade",
      "prompt": "Which value describes the cells themselves — how abnormal they look under the microscope — rather than where the cancer has reached?",
      "explanation": "Every T, N, and M is about place and extent; grade alone is about what the cells themselves look like — G1 well differentiated to G4 undifferentiated.",
      "targets": [
        "G — grade: cell abnormality"
      ],
      "reasons": {
        "G — grade: cell abnormality": "Differentiation of the cells: G1 well differentiated to G4 undifferentiated."
      }
    }
  ],
  "lensMode": "sequential",
  "preSolve": false,
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Reading a cancer's address",
    "summary": "How the TNM address — tumor, nodes, metastasis, plus prefixes and grade — locates a cancer and decides its stage.",
    "estimatedMinutes": 6,
    "content": {
      "mediaType": "text/markdown",
      "text": "Every cancer chart carries an address — cT2 N1 M0, sometimes with more letters after. Reading that address is the first skill in clinical oncology, because the address decides the plan.\r\n\r\nTNM — developed and maintained by the Union for International Cancer Control and used by the American Joint Committee on Cancer — gives every solid tumor three coordinates. T describes the original tumor: T0 means no evidence of a primary, Tis — carcinoma in situ — means abnormal cells still in their normal place, T1 a small tumor, T4 one that has grown into nearby structures; Tx means the primary cannot be assessed. N describes the regional lymph nodes: N0 none involved, N1 metastasis present, N3 numerous or more distant regional nodes, Nx unassessable. M is the stark one: M0 no distant spread, M1 spread beyond the regional nodes to other organs.\r\n\r\nThe three codes condense into stage groups — Roman numerals 0 through IV, chosen so that tumors in the same group behave alike in survival. Stage 0 is carcinoma in situ. Stage I is localized, and most of those tumors are curable. Stage IV has metastasized, and most are inoperable — any M1 makes the cancer stage IV, however small the primary or quiet the nodes.\r\n\r\nThe lowercase prefixes record when the address was taken. c is clinical: exam, blood tests, imaging, biopsy — everything gathered before treatment. p is pathological: a surgeon's specimen examined under the microscope, which adds what clinical evidence cannot see. y is a re-staging after chemotherapy or radiation has shrunk the tumor first. r marks a tumor that has come back after a disease-free interval. The uppercase neighbors add other information: R grades what surgery left behind — R0 in a staging line means none — and G is grade, how abnormal the cells look under the microscope, well differentiated and slow at G1, wildly disordered at G4. Grade is not anatomy, but modern prognostic stage groups may fold it in beside T, N, and M.\r\n\r\nWhy the precision? Because treatment hangs on it: whether surgery or drugs go first, how much surgery, whether adjuvant therapy follows — incorrect staging means improper treatment. That is also why the axes stay separate: a 1-centimeter tumor with an involved node is written T1 N1, small and spread, and neither number may stand in for the other."
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
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "tnm-cancer-staging",
      "puzzleRevision": "fnv1a32:46190ca0",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:Tis — carcinoma in situ": {
          "x": 504.97,
          "y": 154.22
        },
        "term:T4 — invades nearby structures": {
          "x": 890.79,
          "y": 35.9
        },
        "term:T0 — no evidence of tumor": {
          "x": 420.14,
          "y": 81.91
        },
        "term:T1 — small primary tumor": {
          "x": 888.25,
          "y": 103.85
        },
        "term:Tx — cannot be assessed": {
          "x": 563.89,
          "y": 22
        },
        "term:N0 — no regional node spread": {
          "x": 973.93,
          "y": 498.88
        },
        "term:N1 — regional node metastasis": {
          "x": 823.45,
          "y": 282.03
        },
        "term:N3 — numerous regional nodes": {
          "x": 801.67,
          "y": 544.98
        },
        "term:Nx — nodes cannot be assessed": {
          "x": 979.71,
          "y": 339.85
        },
        "term:M1 — distant organ metastasis": {
          "x": 673.26,
          "y": 646.3
        },
        "term:M0 — no distant metastasis": {
          "x": 409.68,
          "y": 648.72
        },
        "term:c — clinical staging": {
          "x": 428.57,
          "y": 394.6
        },
        "term:p — pathological staging": {
          "x": 119.43,
          "y": 619.03
        },
        "term:y — after neoadjuvant therapy": {
          "x": 317.96,
          "y": 225.84
        },
        "term:r — recurrent tumor": {
          "x": 339.69,
          "y": 454.97
        },
        "term:R — residual tumor classification": {
          "x": 136.86,
          "y": 172.66
        },
        "term:G — grade: cell abnormality": {
          "x": 259.8,
          "y": 540.07
        },
        "term:Stage groups": {
          "x": 651.23,
          "y": 412.3
        },
        "term:From c to p": {
          "x": 560.41,
          "y": 283.45
        },
        "term:Size is not spread": {
          "x": 824.04,
          "y": 185
        },
        "cluster:0": {
          "x": 673.66,
          "y": 96.9
        },
        "cluster:1": {
          "x": 860.7,
          "y": 416.52
        },
        "cluster:2": {
          "x": 551.24,
          "y": 549.01
        },
        "cluster:3": {
          "x": 173.01,
          "y": 323.31
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T23:32:09.443Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "tnm-cancer-staging",
      "puzzleRevision": "fnv1a32:46190ca0",
      "board": {
        "width": 1100,
        "height": 710
      },
      "nodes": {
        "term:Tis — carcinoma in situ": {
          "x": 651.74,
          "y": 263.68,
          "pinned": false
        },
        "term:T4 — invades nearby structures": {
          "x": 791.99,
          "y": 100.71,
          "pinned": false
        },
        "term:T0 — no evidence of tumor": {
          "x": 616.73,
          "y": 46.83,
          "pinned": true
        },
        "term:T1 — small primary tumor": {
          "x": 841.5,
          "y": 313.09,
          "pinned": false
        },
        "term:Tx — cannot be assessed": {
          "x": 1002.79,
          "y": 142.59,
          "pinned": false
        },
        "term:N0 — no regional node spread": {
          "x": 679.66,
          "y": 525.83,
          "pinned": true
        },
        "term:N1 — regional node metastasis": {
          "x": 945.46,
          "y": 532.88,
          "pinned": true
        },
        "term:N3 — numerous regional nodes": {
          "x": 835.24,
          "y": 666.15,
          "pinned": true
        },
        "term:Nx — nodes cannot be assessed": {
          "x": 591.11,
          "y": 676.18,
          "pinned": false
        },
        "term:M1 — distant organ metastasis": {
          "x": 405.88,
          "y": 489.67,
          "pinned": true
        },
        "term:M0 — no distant metastasis": {
          "x": 204.93,
          "y": 557.17,
          "pinned": false
        },
        "term:c — clinical staging": {
          "x": 282.66,
          "y": 206.76,
          "pinned": false
        },
        "term:p — pathological staging": {
          "x": 442.9,
          "y": 302.29,
          "pinned": false
        },
        "term:y — after neoadjuvant therapy": {
          "x": 371.81,
          "y": 36.9,
          "pinned": true
        },
        "term:r — recurrent tumor": {
          "x": 277.71,
          "y": 381.95,
          "pinned": false
        },
        "term:R — residual tumor classification": {
          "x": 130.91,
          "y": 95.45,
          "pinned": true
        },
        "term:G — grade: cell abnormality": {
          "x": 107.05,
          "y": 292.93,
          "pinned": false
        },
        "term:Stage groups": {
          "x": 562.96,
          "y": 410.14,
          "pinned": false
        },
        "term:From c to p": {
          "x": 485.6,
          "y": 149.96,
          "pinned": false
        },
        "term:Size is not spread": {
          "x": 956.77,
          "y": 399.11,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4670.72,
        "score": 4670.715777702771
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T23:32:45.509Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "tnm-cancer-staging",
      "puzzleRevision": "fnv1a32:46190ca0",
      "board": {
        "width": 1100,
        "height": 710
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 540.07,
          "y": 185.9,
          "pinned": true
        },
        "cluster:1": {
          "x": 924.21,
          "y": 366.97,
          "pinned": true
        },
        "cluster:2": {
          "x": 556.95,
          "y": 540.1,
          "pinned": true
        },
        "cluster:3": {
          "x": 188.7,
          "y": 369.95,
          "pinned": true
        }
      },
      "bridges": {
        "term:Stage groups": {
          "x": 686.26,
          "y": 382.8,
          "pinned": false
        },
        "term:From c to p": {
          "x": 415.1,
          "y": 381.95,
          "pinned": false
        },
        "term:Size is not spread": {
          "x": 789.65,
          "y": 163.2,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Tis — carcinoma in situ",
          "T4 — invades nearby structures",
          "T0 — no evidence of tumor",
          "T1 — small primary tumor",
          "Tx — cannot be assessed"
        ],
        "cluster:1": [
          "N0 — no regional node spread",
          "N1 — regional node metastasis",
          "N3 — numerous regional nodes",
          "Nx — nodes cannot be assessed"
        ],
        "cluster:2": [
          "M1 — distant organ metastasis",
          "M0 — no distant metastasis"
        ],
        "cluster:3": [
          "c — clinical staging",
          "p — pathological staging",
          "y — after neoadjuvant therapy",
          "r — recurrent tumor",
          "R — residual tumor classification",
          "G — grade: cell abnormality"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "Tis — carcinoma in situ",
          "T1 — small primary tumor",
          "T4 — invades nearby structures",
          "T0 — no evidence of tumor",
          "Tx — cannot be assessed"
        ],
        "cluster:1": [
          "N3 — numerous regional nodes",
          "N1 — regional node metastasis",
          "Nx — nodes cannot be assessed",
          "N0 — no regional node spread"
        ],
        "cluster:2": [
          "M1 — distant organ metastasis",
          "M0 — no distant metastasis"
        ],
        "cluster:3": [
          "c — clinical staging",
          "G — grade: cell abnormality",
          "R — residual tumor classification",
          "y — after neoadjuvant therapy",
          "p — pathological staging",
          "r — recurrent tumor"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 755.0646886757962
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T23:33:11.761Z"
    }
  },
  "board": {
    "sizeFactor": 1.15,
    "source": "author",
    "savedAt": "2026-10-15T23:30:38.517Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
