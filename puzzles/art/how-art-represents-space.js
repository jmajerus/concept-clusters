// Generated from content/puzzles/how-art-represents-space.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "how-art-represents-space",
  "title": "How Art Represents Space",
  "category": "Art",
  "subcategories": {
    "Art": "representation-and-interpretation"
  },
  "large": true,
  "info": {
    "text": "Explore how different artistic traditions and systems represent three-dimensional space on a two-dimensional surface.",
    "links": [
      {
        "href": "wiki:Perspective (graphical)"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-project-depth",
      "name": "Project depth",
      "color": "blue",
      "fact": "Geometric systems like linear perspective use a single fixed viewpoint and converging lines to project a convincing illusion of three-dimensional depth on a two-dimensional surface.",
      "terms": [
        "linear perspective",
        "vanishing point",
        "orthogonals",
        "foreshortening"
      ],
      "seeds": [
        "linear perspective",
        "vanishing point"
      ],
      "termInfo": {
        "linear perspective": {
          "text": "A geometric system for representing depth through converging parallel lines and one or more vanishing points."
        },
        "foreshortening": {
          "text": "The visual contraction of an object that extends back in space at an angle to the viewer."
        },
        "orthogonals": {
          "text": "Lines in a perspective drawing that point toward the vanishing point."
        },
        "vanishing point": {
          "text": "The point on the horizon where parallel lines appear to converge in a perspective drawing."
        }
      }
    },
    {
      "id": "cluster-stack-and-layer",
      "name": "Stack and layer",
      "color": "teal",
      "fact": "Artists can suggest depth through relative size, layering, and color shifts without using a formal geometric system.",
      "terms": [
        "overlap",
        "diminishing scale",
        "vertical placement",
        "atmospheric perspective"
      ],
      "seeds": [
        "overlap",
        "diminishing scale"
      ],
      "termInfo": {
        "vertical placement": {
          "text": "Positioning objects higher on the picture plane to indicate they are further away."
        },
        "diminishing scale": {
          "text": "The reduction in size of objects as they are represented further back in space."
        },
        "atmospheric perspective": {
          "text": "The use of hazy backgrounds and shifted colors to suggest vast distance."
        },
        "overlap": {
          "text": "A spatial cue where one object partially covers another, indicating it is closer to the viewer."
        }
      }
    },
    {
      "id": "cluster-multiple-viewpoints",
      "name": "Multiple viewpoints",
      "color": "amber",
      "fact": "Some artistic traditions represent subjects from multiple viewpoints at once or use parallel projections that do not converge, prioritizing clarity or symbolic relationship over a single optical moment.",
      "terms": [
        "simultaneous view",
        "composite pose",
        "planimetric composition",
        "isometric projection"
      ],
      "seeds": [
        "simultaneous view",
        "composite pose"
      ],
      "termInfo": {
        "planimetric composition": {
          "text": "Arranging elements in parallel planes rather than a continuous recession into depth."
        },
        "simultaneous view": {
          "text": "Representing multiple viewpoints of a single subject within one image."
        },
        "composite pose": {
          "text": "A figure represented from multiple viewpoints at once, such as profile and frontal combined."
        },
        "isometric projection": {
          "text": "A method of representing 3D objects in 2D where parallel lines stay parallel rather than converging."
        }
      }
    },
    {
      "id": "cluster-emphasize-surface",
      "name": "Emphasize surface",
      "color": "magenta",
      "fact": "Art may deliberately suppress depth to emphasize the literal flat surface, using scale to indicate importance rather than distance, or using patterns and backgrounds that resist spatial recession.",
      "terms": [
        "flatness",
        "hierarchical scale",
        "gold ground",
        "pattern"
      ],
      "seeds": [
        "flatness",
        "hierarchical scale"
      ],
      "termInfo": {
        "gold ground": {
          "text": "A flat, unmodulated gold leaf background that suppresses naturalistic space."
        },
        "pattern": {
          "text": "Repeating visual elements that emphasize the surface and decorative structure."
        },
        "hierarchical scale": {
          "text": "Representing figures in sizes that correspond to their importance rather than distance."
        },
        "flatness": {
          "text": "The literal two-dimensional surface of an artwork, sometimes emphasized over spatial illusion."
        }
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-illusion",
      "term": "illusion",
      "clusters": [
        0,
        1
      ],
      "fact": "Illusion links geometric systems with relational cues; both use visual patterns to trick the brain into seeing depth where there is only a flat surface.",
      "termRole": "connector",
      "relationKind": "dynamic",
      "idealTerms": [
        "linear perspective",
        "overlap"
      ]
    },
    {
      "id": "bridge-organization",
      "term": "organization",
      "clusters": [
        2,
        3
      ],
      "fact": "Organization connects composite views with surface-oriented art; both prioritize a structured, often symbolic arrangement of elements over a naturalistic \"window\" into depth.",
      "termRole": "connector",
      "relationKind": "foundation",
      "idealTerms": [
        "simultaneous view",
        "flatness"
      ]
    }
  ],
  "lenses": [
    {
      "id": "calculated-geometry",
      "prompt": "Which concepts rely on calculated geometric relationships to represent space?",
      "explanation": "These concepts rely on consistent geometric or mathematical relationships to construct a representation of depth or volume.",
      "targets": [
        "linear perspective",
        "vanishing point",
        "orthogonals",
        "foreshortening",
        "isometric projection"
      ]
    },
    {
      "id": "symbolic-arrangement",
      "prompt": "Which concepts prioritize symbolic or hierarchical meaning over realistic optical space?",
      "explanation": "These approaches prioritize clarity, importance, or composite information over the illusion of a single fixed optical moment.",
      "targets": [
        "hierarchical scale",
        "composite pose",
        "gold ground",
        "simultaneous view"
      ]
    }
  ],
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "How Art Represents Space",
    "content": {
      "mediaType": "text/markdown",
      "text": "# How Art Represents Space\\nImages are flat, but they can represent deep space. Artistic traditions have developed different ways to solve this problem, ranging from mathematical systems to symbolic arrangements.\\n\\n## The Window into Depth\\nIn the Renaissance, artists developed **linear perspective**, a geometric system that treats the picture like a window. By using a single **vanishing point** and converging lines (**orthogonals**), they created a convincing illusion of three-dimensional depth.\\n\\n## Relational Depth\\nEven without math, artists use visual cues like **overlap**, **diminishing scale**, and **atmospheric perspective** (shifting color and clarity) to suggest depth. These cues depend on how we naturally perceive relationships between objects.\\n\\n## Multiple Viewpoints and Surface\\nNot all art tries to create an illusion. Some traditions represent a subject from multiple angles at once (**simultaneous view**) or use **hierarchical scale** to show who is most important rather than who is closest. These approaches often emphasize the **flatness** of the surface and prioritize symbolic clarity over a single optical moment."
    }
  }
});
