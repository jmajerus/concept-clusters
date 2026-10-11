// Generated from content/puzzles/reproducible-bioinformatics-workflows.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "reproducible-bioinformatics-workflows",
  "title": "Reproducible bioinformatics workflows",
  "category": "computer-science",
  "categories": [
    "computer-science",
    "biology"
  ],
  "subcategories": {
    "computer-science": "bioinformatics",
    "biology": "bioinformatics"
  },
  "tags": [
    "bioinformatics",
    "workflows",
    "reproducibility",
    "provenance"
  ],
  "info": {
    "text": "A script that ran once is not yet a reproducible analysis. Reproduction depends on identified inputs, explicit parameters, versioned software and reference data, recorded execution, validated outputs, and enough provenance to explain every result.",
    "citations": [
      {
        "title": "Why create workflows?",
        "author": "EMBL-EBI Training",
        "url": "https://www.ebi.ac.uk/training/online/courses/workflows-combining-tools-for-data-analysis/why-create-workflows/"
      },
      {
        "title": "Creating tools for workflows",
        "author": "EMBL-EBI Training",
        "url": "https://www.ebi.ac.uk/training/online/courses/workflows-combining-tools-for-data-analysis/getting-data-from-resource-name/"
      }
    ]
  },
  "clusters": [
    {
      "id": "defining-an-analysis",
      "name": "Defining an analysis",
      "color": "teal",
      "fact": "A reproducible analysis begins with an explicit input manifest, parameter set, reference dataset, and quality-control criteria rather than relying on filenames and remembered defaults.",
      "terms": [
        "input manifest",
        "parameter set",
        "reference dataset",
        "quality-control checkpoint"
      ],
      "seeds": [
        "input manifest",
        "parameter set"
      ],
      "termInfo": {
        "input manifest": {
          "text": "A structured inventory connecting sample identifiers with the files and attributes supplied to a run.",
          "links": [
            {
              "href": "wiki:Manifest file"
            }
          ]
        },
        "parameter set": {
          "text": "The explicit configuration values and thresholds supplied to tools in an analysis.",
          "links": [
            {
              "href": "wiki:Parameter (computer programming)"
            }
          ]
        },
        "reference dataset": {
          "text": "A versioned external sequence, annotation, or database used as a comparison or interpretation resource.",
          "links": [
            {
              "href": "wiki:Reference genome"
            }
          ]
        },
        "quality-control checkpoint": {
          "text": "A defined test and acceptance rule applied before downstream analysis proceeds or results are accepted.",
          "links": [
            {
              "href": "wiki:Quality control"
            }
          ]
        }
      }
    },
    {
      "id": "fixing-the-software-environment",
      "name": "Fixing the software environment",
      "color": "blue",
      "fact": "Pinned dependency versions and environment lockfiles identify software, while a versioned container image captures a fuller runtime environment.",
      "terms": [
        "dependency version",
        "environment lockfile",
        "container image"
      ],
      "seeds": [
        "dependency version",
        "container image"
      ],
      "termInfo": {
        "dependency version": {
          "text": "The precise release or revision of a tool or library required by an analysis.",
          "links": [
            {
              "href": "wiki:Software versioning"
            }
          ]
        },
        "environment lockfile": {
          "text": "A machine-readable record that resolves requested software dependencies to exact versions or artifacts.",
          "links": [
            {
              "href": "wiki:Package manager"
            }
          ]
        },
        "container image": {
          "text": "A versioned package of filesystem and runtime dependencies used to create consistent execution environments.",
          "links": [
            {
              "href": "wiki:Containerization (computing)"
            }
          ]
        }
      }
    },
    {
      "id": "orchestrating-execution",
      "name": "Orchestrating execution",
      "color": "cyan",
      "fact": "A workflow definition connects tasks; task dependencies establish order, resource declarations expose computational needs, and retry policy defines how selected failures are handled.",
      "terms": [
        "workflow definition",
        "task dependency",
        "compute resource",
        "retry policy"
      ],
      "seeds": [
        "workflow definition",
        "task dependency"
      ],
      "termInfo": {
        "workflow definition": {
          "text": "A machine-readable description of analysis tasks, dependencies, inputs, outputs, and execution rules.",
          "links": [
            {
              "href": "wiki:Scientific workflow system"
            }
          ]
        },
        "task dependency": {
          "text": "A declared relationship requiring one task or its outputs to be ready before another task can run.",
          "links": [
            {
              "href": "wiki:Dependency graph"
            }
          ]
        },
        "compute resource": {
          "text": "Declared CPU, memory, storage, accelerator, or scheduling requirements for a task.",
          "links": [
            {
              "href": "wiki:Computational resource"
            }
          ]
        },
        "retry policy": {
          "text": "A rule specifying which failed tasks may be attempted again, how often, and under what conditions.",
          "links": [
            {
              "href": "wiki:Fault tolerance"
            }
          ]
        }
      }
    },
    {
      "id": "recording-what-happened",
      "name": "Recording what happened",
      "color": "amber",
      "fact": "Run logs record execution, checksums verify artifact identity, intermediate outputs support diagnosis, and a results manifest identifies the products delivered by a particular run.",
      "terms": [
        "run log",
        "checksum",
        "intermediate artifact",
        "results manifest"
      ],
      "seeds": [
        "run log",
        "checksum"
      ],
      "termInfo": {
        "run log": {
          "text": "A timestamped record of commands, status, warnings, errors, and other events from an execution.",
          "links": [
            {
              "href": "wiki:Logging (computing)"
            }
          ]
        },
        "checksum": {
          "text": "A digest calculated from data and used to detect whether an artifact's bytes differ.",
          "links": [
            {
              "href": "wiki:Checksum"
            }
          ]
        },
        "intermediate artifact": {
          "text": "A file or dataset produced between final endpoints that can support caching, inspection, and fault diagnosis.",
          "links": [
            {
              "href": "wiki:Intermediate representation"
            }
          ]
        },
        "results manifest": {
          "text": "A structured inventory of the outputs, identifiers, and integrity information associated with a completed run.",
          "links": [
            {
              "href": "wiki:Manifest file"
            }
          ]
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "workflow-engine",
      "term": "workflow engine",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "A workflow engine interprets the declared analysis graph, schedules ready tasks, passes identified inputs and parameters, and manages failures or retries on available resources.",
      "info": {
        "text": "Software that resolves task dependencies and coordinates execution of a computational workflow.",
        "links": [
          {
            "href": "wiki:Workflow management system"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "input manifest",
        "container image",
        "workflow definition"
      ]
    },
    {
      "id": "version-control",
      "term": "version control",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "Version control connects analysis intent to implementation history by preserving changes to workflow definitions, configuration, and supporting code—though large data artifacts need separate versioning strategies.",
      "info": {
        "text": "A system for recording and identifying changes to files such as code, workflow definitions, and configuration.",
        "links": [
          {
            "href": "wiki:Version control"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "parameter set",
        "dependency version",
        "workflow definition"
      ]
    },
    {
      "id": "provenance",
      "term": "provenance",
      "clusters": [
        0,
        1,
        3
      ],
      "fact": "Provenance joins declared inputs and parameters, the software and environment actually executed, and the artifacts produced into an inspectable lineage for each result.",
      "info": {
        "text": "Structured lineage describing the entities, activities, software, and relationships that produced a data result.",
        "links": [
          {
            "href": "wiki:Data lineage"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "reference dataset",
        "dependency version",
        "results manifest"
      ]
    }
  ],
  "lenses": [
    {
      "id": "what-must-be-fixed",
      "prompt": "Which concepts identify the data and computational choices needed to repeat the same analysis?",
      "explanation": "Inputs, parameters, references, dependencies, and runtime environments must all be identifiable before a run starts -- an environment lockfile and a container image are two different ways of pinning that runtime.",
      "targets": [
        "input manifest",
        "parameter set",
        "reference dataset",
        "dependency version",
        "environment lockfile",
        "container image"
      ],
      "reasons": {
        "input manifest": "It enumerates the samples and files entering a run.",
        "parameter set": "It records choices that can alter tool behavior and results.",
        "reference dataset": "Its exact release or build can change coordinates and annotations.",
        "dependency version": "Different software releases can implement different behavior.",
        "environment lockfile": "It resolves requested dependencies to exact versions before a run starts.",
        "container image": "It packages a defined execution environment more completely than a tool name alone."
      }
    },
    {
      "id": "automation-is-not-reproducibility",
      "prompt": "Which concepts show why merely automating commands is insufficient for reproducibility?",
      "explanation": "Automation specifies steps, but reproduction also needs the software and data identities, execution record, integrity checks, lineage, and explicit criteria that determine whether a run is acceptable.",
      "targets": [
        "workflow definition",
        "dependency version",
        "run log",
        "checksum",
        "provenance",
        "quality-control checkpoint"
      ],
      "reasons": {
        "workflow definition": "It describes the dependency graph and commands but may not pin everything they use.",
        "dependency version": "Unpinned software can make the same commands behave differently.",
        "run log": "It records what actually happened rather than only what was intended.",
        "checksum": "It detects silent substitution or corruption of an artifact.",
        "provenance": "It connects each output to the inputs and transformations that produced it.",
        "quality-control checkpoint": "It makes acceptance criteria part of the process rather than an undocumented judgment."
      }
    },
    {
      "id": "debugging-a-different-result",
      "prompt": "Which concepts help locate why two nominally identical runs produced different outputs?",
      "explanation": "Differences can arise from parameters, reference releases, software, resource-dependent execution, or failures visible in logs; a checksum can confirm whether the runs' inputs were actually identical bytes in the first place.",
      "targets": [
        "parameter set",
        "reference dataset",
        "dependency version",
        "compute resource",
        "run log",
        "checksum"
      ],
      "reasons": {
        "parameter set": "It reveals configuration differences between runs.",
        "reference dataset": "It identifies changes in external biological knowledge or coordinates.",
        "dependency version": "It exposes implementation changes.",
        "compute resource": "Threads, memory, hardware, or distributed scheduling can affect some tools.",
        "run log": "It reveals warnings, retries, failures, and executed commands.",
        "checksum": "It confirms or rules out the simplest explanation: that the two runs did not actually share identical inputs."
      }
    },
    {
      "id": "declared-versus-observed-run",
      "prompt": "Which concepts distinguish what an analysis was instructed to do from the record of what it actually produced?",
      "explanation": "Manifests, parameters, and workflow definitions declare intended inputs and work. Logs and artifacts record the realized execution, while the results manifest identifies the outputs that actually emerged.",
      "targets": [
        "input manifest",
        "parameter set",
        "workflow definition",
        "run log",
        "intermediate artifact",
        "results manifest"
      ],
      "reasons": {
        "input manifest": "It declares the samples and files intended to enter a run.",
        "parameter set": "It declares the configuration intended to govern tool behavior.",
        "workflow definition": "It declares tasks and their dependency structure.",
        "run log": "It records execution events, warnings, and failures that actually occurred.",
        "intermediate artifact": "It is tangible evidence produced during execution.",
        "results manifest": "It inventories the outputs associated with the completed run."
      }
    }
  ],
  "relatedPuzzles": {
    "info": {
      "text": "Use reproducibility to connect biological records with sequence-analysis decisions."
    },
    "entries": [
      {
        "id": "when-biology-becomes-data",
        "reason": "See why identifiers, schemas, and metadata are prerequisites for traceable inputs."
      },
      {
        "id": "aligning-biological-sequences",
        "reason": "Apply versioned databases, scoring parameters, and recorded outputs to sequence search."
      },
      {
        "id": "from-reads-to-a-genome",
        "reason": "Follow a representative multi-stage genomics analysis from raw reads through annotation."
      }
    ]
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Codex"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "reproducible-bioinformatics-workflows",
      "puzzleRevision": "fnv1a32:1ed03601",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:input manifest": {
          "x": 307.77,
          "y": 62.44,
          "pinned": true
        },
        "term:parameter set": {
          "x": 85.72,
          "y": 64.68,
          "pinned": true
        },
        "term:reference dataset": {
          "x": 320.01,
          "y": 173.62,
          "pinned": true
        },
        "term:quality-control checkpoint": {
          "x": 532.85,
          "y": 60.99,
          "pinned": true
        },
        "term:dependency version": {
          "x": 427.4,
          "y": 359.59,
          "pinned": true
        },
        "term:environment lockfile": {
          "x": 385.35,
          "y": 464.92,
          "pinned": true
        },
        "term:container image": {
          "x": 556.05,
          "y": 463.33,
          "pinned": true
        },
        "term:workflow definition": {
          "x": 723.87,
          "y": 556.58,
          "pinned": true
        },
        "term:task dependency": {
          "x": 850.89,
          "y": 394.58,
          "pinned": true
        },
        "term:compute resource": {
          "x": 731.53,
          "y": 338.33,
          "pinned": true
        },
        "term:retry policy": {
          "x": 887.08,
          "y": 483.01,
          "pinned": true
        },
        "term:run log": {
          "x": 185.03,
          "y": 353.18,
          "pinned": true
        },
        "term:checksum": {
          "x": 217.1,
          "y": 408.61,
          "pinned": true
        },
        "term:intermediate artifact": {
          "x": 197.27,
          "y": 231.59,
          "pinned": true
        },
        "term:results manifest": {
          "x": 275.36,
          "y": 291.31,
          "pinned": true
        },
        "term:workflow engine": {
          "x": 596.41,
          "y": 279.25,
          "pinned": true
        },
        "term:version control": {
          "x": 79.6,
          "y": 552.39,
          "pinned": true
        },
        "term:provenance": {
          "x": 435.04,
          "y": 281.92,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 5174.22,
        "score": 5174.217036409963
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-08T20:53:16.103Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "reproducible-bioinformatics-workflows",
      "puzzleRevision": "fnv1a32:1ed03601",
      "board": {
        "width": 1050,
        "height": 780
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 525,
          "y": 217.8,
          "pinned": false
        },
        "cluster:1": {
          "x": 525,
          "y": 578.2,
          "pinned": false
        },
        "cluster:2": {
          "x": 822.04,
          "y": 398,
          "pinned": false
        },
        "cluster:3": {
          "x": 227.96,
          "y": 398,
          "pinned": false
        }
      },
      "bridges": {
        "term:workflow engine": {
          "x": 624.01,
          "y": 398,
          "pinned": false
        },
        "term:version control": {
          "x": 488.01,
          "y": 398,
          "pinned": false
        },
        "term:provenance": {
          "x": 406.09,
          "y": 446.04,
          "pinned": false
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "input manifest",
          "parameter set",
          "reference dataset",
          "quality-control checkpoint"
        ],
        "cluster:1": [
          "dependency version",
          "environment lockfile",
          "container image"
        ],
        "cluster:2": [
          "workflow definition",
          "task dependency",
          "compute resource",
          "retry policy"
        ],
        "cluster:3": [
          "run log",
          "checksum",
          "intermediate artifact",
          "results manifest"
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
        "totalLength": 719.0228230914773
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "source": "auto",
      "fixed": true,
      "savedAt": "2026-10-08T00:58:40.479Z"
    },
    "star": {
      "schemaVersion": 1,
      "puzzleId": "reproducible-bioinformatics-workflows",
      "puzzleRevision": "fnv1a32:1ed03601",
      "board": {
        "width": 960,
        "height": 620
      },
      "nodes": {
        "term:input manifest": {
          "x": 813.15,
          "y": 88.49
        },
        "term:parameter set": {
          "x": 60.95,
          "y": 163.95
        },
        "term:reference dataset": {
          "x": 439.1,
          "y": 154.32
        },
        "term:quality-control checkpoint": {
          "x": 342.26,
          "y": 22
        },
        "term:dependency version": {
          "x": 447.29,
          "y": 405.66
        },
        "term:environment lockfile": {
          "x": 573.94,
          "y": 233.41
        },
        "term:container image": {
          "x": 676.76,
          "y": 277.15
        },
        "term:workflow definition": {
          "x": 644.66,
          "y": 491.75
        },
        "term:task dependency": {
          "x": 866.56,
          "y": 543.89
        },
        "term:compute resource": {
          "x": 863.15,
          "y": 372.84
        },
        "term:retry policy": {
          "x": 723.53,
          "y": 558.92
        },
        "term:run log": {
          "x": 174.68,
          "y": 215.56
        },
        "term:checksum": {
          "x": 125.37,
          "y": 277.95
        },
        "term:intermediate artifact": {
          "x": 244.03,
          "y": 396.34
        },
        "term:results manifest": {
          "x": 295.11,
          "y": 238.74
        },
        "term:workflow engine": {
          "x": 813.58,
          "y": 192.96
        },
        "term:version control": {
          "x": 67.25,
          "y": 502.8
        },
        "term:provenance": {
          "x": 443.26,
          "y": 275.16
        },
        "cluster:0": {
          "x": 354.64,
          "y": 88.23
        },
        "cluster:1": {
          "x": 579.69,
          "y": 333.58
        },
        "cluster:2": {
          "x": 826.89,
          "y": 425.15
        },
        "cluster:3": {
          "x": 258.37,
          "y": 325.3
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-08T20:49:03.393Z"
    }
  },
  "board": {
    "sizeFactor": 1,
    "source": "auto",
    "savedAt": "2026-10-08T00:58:34.722Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
