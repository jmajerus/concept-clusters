// Generated from content/puzzles/what-the-camera-knows.ccpuzzle.json.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "what-the-camera-knows",
  "title": "What the camera knows",
  "category": "Film",
  "info": {
    "text": "How cinematography takes a position on knowledge: sharing a character's perception, surveying the scene from above, or signalling that the camera itself cannot be trusted.",
    "link": "wiki:Cinematography"
  },
  "clusters": [
    {
      "id": "cluster-alignment",
      "name": "Alignment",
      "color": "teal",
      "fact": "Cinematographic alignment positions the viewer to share a character's perceptual experience: a point-of-view shot shows the world exactly as a character sees it; an eyeline match cuts between a glancing character and what they see; a reaction shot cuts to their face as they respond to what they have just seen; and a subjective camera renders the character's inner state so completely that the viewer's look becomes their own.",
      "terms": [
        "point-of-view shot",
        "eyeline match",
        "reaction shot",
        "subjective camera"
      ],
      "seeds": [
        "point-of-view shot",
        "eyeline match"
      ],
      "termInfo": {
        "point-of-view shot": {
          "text": "A shot explicitly representing what a character sees from their optical position, aligning the viewer's perception with theirs.",
          "link": "wiki:Point of view shot"
        },
        "eyeline match": {
          "text": "A continuity cut that follows a character looking with a shot of what they look at, using spatial logic to structure the viewer's alignment with their gaze.",
          "link": "wiki:Eyeline match"
        },
        "reaction shot": {
          "text": "A cut to a character's face (typically a close-up) as they receive what they have seen or heard, inviting the viewer to read and align with their response.",
          "link": "wiki:Reaction shot"
        },
        "subjective camera": {
          "text": "The broader technique family in which camera choices -- tilting, blurring, distorting -- render a character's perceptual or psychological state rather than showing only what they literally see.",
          "link": "wiki:Subjective camera"
        }
      },
      "info": {
        "link": "wiki:Film theory"
      }
    },
    {
      "id": "cluster-survey",
      "name": "The surveying camera",
      "color": "blue",
      "fact": "The surveying camera occupies a position no character in the scene can share: an establishing shot surveys a location before any character enters it; a high-angle shot looks down from a height no participant occupies; a long shot diminishes figures within their environment, giving the viewer more contextual knowledge than any character has; and a bird's-eye view provides an overhead, god's-eye perspective entirely removed from human scale.",
      "terms": [
        "establishing shot",
        "high-angle shot",
        "long shot",
        "bird's-eye view"
      ],
      "seeds": [
        "establishing shot",
        "high-angle shot"
      ],
      "termInfo": {
        "establishing shot": {
          "text": "A wide or long shot that surveys a setting before or between scenes, giving the viewer spatial knowledge that precedes and exceeds any character's entry into the space.",
          "link": "wiki:Establishing shot"
        },
        "high-angle shot": {
          "text": "A shot taken from above the subject's eye level, looking down -- a position inaccessible to any character in the scene, surveying them from a height they cannot occupy.",
          "link": "wiki:Camera angle"
        },
        "long shot": {
          "text": "A shot that situates a human figure within a wider environment, giving the viewer environmental knowledge that dwarfs the character's own field of view.",
          "link": "wiki:Long shot"
        },
        "bird's-eye view": {
          "text": "A shot taken from directly overhead, giving a completely top-down perspective -- the most extreme form of the surveying camera, representing a vantage point no character could occupy.",
          "link": "wiki:Bird's-eye view"
        }
      },
      "info": {
        "link": "wiki:Camera angle"
      }
    },
    {
      "id": "cluster-disturbance",
      "name": "Disturbance",
      "color": "amber",
      "fact": "The camera can declare its own unreliability: a Dutch tilt cants the frame off its horizontal axis to signal psychological unease or moral distortion; a dolly zoom keeps a subject at constant screen size while the background warps, producing a disorientation of space that defies normal perception; a whip pan moves the camera so fast the image blurs into abstraction; and a slow zoom imperceptibly advances on a subject until the viewer senses, before they consciously register, that something has changed.",
      "terms": [
        "Dutch tilt",
        "dolly zoom",
        "whip pan",
        "slow zoom"
      ],
      "seeds": [
        "Dutch tilt",
        "dolly zoom"
      ],
      "termInfo": {
        "Dutch tilt": {
          "text": "A shot in which the camera is canted sideways so the frame is no longer level, used to signal psychological instability, moral distortion, or impending threat.",
          "link": "wiki:Dutch angle"
        },
        "dolly zoom": {
          "text": "A technique in which the camera moves toward or away from a subject while the lens zooms in the opposite direction, keeping the subject constant while the background warps -- producing the disorientation associated with vertigo and dread.",
          "link": "wiki:Dolly zoom"
        },
        "whip pan": {
          "text": "An extremely rapid pan that blurs the image into abstraction, used to create disorientation, suggest time passing, or jolt the viewer's spatial orientation.",
          "link": "wiki:Whip pan"
        },
        "slow zoom": {
          "text": "A barely perceptible zoom, typically toward a subject, that creates a growing sense of unease before the viewer consciously registers the movement -- associated with directors like Kubrick and Spielberg.",
          "link": "wiki:Zoom lens"
        }
      },
      "info": {
        "link": "wiki:Film technique"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-surveillance",
      "term": "surveillance shot",
      "clusters": [
        0,
        1
      ],
      "fact": "A surveillance shot fuses both positions: the viewer is aligned with the watcher's point of view, sharing their look, but from a high-angle or concealed position the watched subject cannot see or reciprocate. The combination -- alignment without exchange, survey without disclosure -- captures the voyeuristic dynamic that film theorists have tied to cinema's structural power over its subjects.",
      "info": {
        "text": "A shot that represents the act of watching an unknowing subject, typically from an elevated or concealed position, aligning the viewer with the watcher's perspective while establishing the subject's unawareness.",
        "link": "wiki:Surveillance in film"
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        "point-of-view shot",
        "high-angle shot"
      ]
    }
  ],
  "lenses": [
    {
      "id": "lens-geometric-distortion",
      "prompt": "Which two Disturbance techniques work by making space itself look geometrically wrong -- not just unstable or overwhelming, but showing spatial relationships that couldn't physically exist?",
      "explanation": "A Dutch tilt cants the frame off its horizontal axis so the world's geometry appears fundamentally skewed. A dolly zoom keeps a subject at constant screen size while the background warps in the opposite direction, producing depth relationships that defy physical reality. Both make space itself unreliable. The other two Disturbance terms work differently: a whip pan obscures space through speed; a slow zoom advances on it. Neither distorts its geometry.",
      "targets": [
        "Dutch tilt",
        "dolly zoom"
      ],
      "reasons": {
        "Dutch tilt": "Cants the frame so the world's horizontal is wrong -- the geometry of the scene itself is skewed.",
        "dolly zoom": "Moves camera and focal length in opposite directions, producing a depth relationship between subject and background that has no physical equivalent."
      }
    }
  ],
  "lensMode": "sequential"
});
