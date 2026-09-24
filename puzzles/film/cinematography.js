// Generated from content/puzzles/cinematography.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "cinematography",
  "title": "Cinematography: the visual language of film",
  "category": "film",
  "info": {
    "text": "How a cinematographer shapes meaning through composition of the frame, movement of the camera, and control of light.",
    "links": [
      {
        "href": "wiki:Cinematography"
      }
    ]
  },
  "clusters": [
    {
      "id": "cluster-composition",
      "name": "Composition",
      "color": "teal",
      "fact": "Cinematographic composition organizes visual elements within the frame: framing establishes what falls inside the shot boundary and what is excluded; rule of thirds distributes visual tension across the image by aligning subjects with a grid's lines and intersections; negative space surrounds a subject and gives the frame room to breathe; and deep focus keeps foreground and background simultaneously sharp, allowing meaning to accumulate at multiple depths.",
      "terms": [
        "framing",
        "deep focus",
        "rule of thirds",
        "negative space"
      ],
      "seeds": [
        "framing",
        "deep focus"
      ],
      "termInfo": {
        "framing": {
          "text": "The decision of what falls within the shot's borders -- who stands where, how much of the body appears, what angle the lens takes -- and what the frame implies beyond its edges.",
          "links": [
            {
              "href": "wiki:Shot (filmmaking)"
            }
          ]
        },
        "deep focus": {
          "text": "A technique, associated with cinematographer Gregg Toland and Citizen Kane, in which a short focal length and small aperture keep objects at widely different distances from the camera simultaneously sharp.",
          "links": [
            {
              "href": "wiki:Deep focus"
            }
          ]
        },
        "rule of thirds": {
          "text": "A compositional guideline that divides the frame into a 3x3 grid and places subjects or horizons along its lines or at its intersections rather than dead-center.",
          "links": [
            {
              "href": "wiki:Rule of thirds"
            }
          ]
        },
        "negative space": {
          "text": "The empty or background area surrounding the main subject, used actively by cinematographers to create breathing room, isolation, or weight.",
          "links": [
            {
              "href": "wiki:Negative space"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Film frame"
          }
        ]
      }
    },
    {
      "id": "cluster-camera-movement",
      "name": "Camera movement",
      "color": "blue",
      "fact": "Camera movement shapes the viewer's spatial and emotional relationship to the scene: a pan rotates the camera horizontally on its axis to survey an environment; a tracking shot moves the whole camera bodily alongside or toward action; a crane shot ascends or descends to reframe the scene from above or below; and handheld camera creates an unstable, bodily immediacy to its subjects.",
      "terms": [
        "tracking shot",
        "pan",
        "crane shot",
        "handheld camera"
      ],
      "seeds": [
        "tracking shot",
        "pan"
      ],
      "termInfo": {
        "tracking shot": {
          "text": "A shot in which the camera moves bodily through space alongside or toward a subject, typically mounted on a dolly, tracks, or vehicle.",
          "links": [
            {
              "href": "wiki:Tracking shot"
            }
          ]
        },
        "pan": {
          "text": "A horizontal rotation of the camera on its vertical axis, used to survey a space or follow a subject while the camera's base position stays fixed.",
          "links": [
            {
              "href": "wiki:Panning (camera)"
            }
          ]
        },
        "crane shot": {
          "text": "A shot achieved by mounting the camera on a crane or jib, allowing it to ascend, descend, or arc through the air above the action.",
          "links": [
            {
              "href": "wiki:Crane shot"
            }
          ]
        },
        "handheld camera": {
          "text": "A shooting style in which the operator carries the camera by hand or on the shoulder, producing visible shake and sway that conveys immediacy, instability, or documentary realism.",
          "links": [
            {
              "href": "wiki:Handheld camera"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Camera angle"
          }
        ]
      }
    },
    {
      "id": "cluster-lighting",
      "name": "Lighting design",
      "color": "amber",
      "fact": "Lighting design shapes a scene's tone and the hierarchy of subject and background: three-point lighting uses a key, fill, and back light to separate a subject cleanly and legibly from its setting; chiaroscuro exploits extreme contrast between illuminated and shadowed areas for dramatic or psychological effect; motivated lighting derives its apparent source from a visible or implied fixture within the scene; and low-key lighting withholds fill to build shadow and dread.",
      "terms": [
        "chiaroscuro",
        "three-point lighting",
        "motivated lighting",
        "low-key lighting"
      ],
      "seeds": [
        "chiaroscuro",
        "three-point lighting"
      ],
      "termInfo": {
        "chiaroscuro": {
          "text": "From Italian for 'light-dark': the use of strong contrasts between illuminated and shadowed areas to model form, create atmosphere, or externalize psychological states -- adapted from Renaissance painting into film.",
          "links": [
            {
              "href": "wiki:Chiaroscuro"
            }
          ]
        },
        "three-point lighting": {
          "text": "The standard studio-lighting setup of a key light (primary illumination), fill light (softens shadows cast by the key), and back light (separates subject from background) -- a neutral baseline that cinematographers adapt or subvert.",
          "links": [
            {
              "href": "wiki:Three-point lighting"
            }
          ]
        },
        "motivated lighting": {
          "text": "Lighting whose apparent source is justified by a fixture visible or implied in the scene -- a lamp, a window, a fire -- rather than placed for purely technical reasons.",
          "links": [
            {
              "href": "wiki:Film Lighting"
            }
          ]
        },
        "low-key lighting": {
          "text": "A lighting setup dominated by a key light with minimal or no fill, producing deep shadows and high contrast -- the signature look of film noir and horror.",
          "links": [
            {
              "href": "wiki:Low-key lighting"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Cinematography"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-steadicam",
      "term": "Steadicam",
      "clusters": [
        0,
        1
      ],
      "fact": "The Steadicam's spring-loaded harness and gyroscopically stabilized arm allow the camera to move continuously through space while isolating it from the operator's body movements, producing shots with the spatial range of a tracking shot while preserving enough compositional control to frame action precisely.",
      "info": {
        "text": "A camera-stabilization system worn as a body harness, using a spring arm and gimbal to absorb movement and produce smooth, gliding shots without a dolly track.",
        "links": [
          {
            "href": "wiki:Steadicam"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "framing",
        "tracking shot"
      ]
    }
  ],
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "generative assistance",
        "kind": "generative"
      }
    ]
  }
});
