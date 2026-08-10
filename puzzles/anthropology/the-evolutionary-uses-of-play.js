// Generated from content/puzzles/the-evolutionary-uses-of-play.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "the-evolutionary-uses-of-play",
  "title": "The Evolutionary Uses of Play",
  "category": "Anthropology",
  "lenses": [
    {
      "explanation": "These four describe the same condition from three angles: the theory that a protected childhood lets behavior detach from required outcomes, the experimental design that let children explore without a demonstrated 'right' way, and the calm persistence that resulted when a solution failed. The demonstration condition is the opposite case -- it fixes one correct method to imitate.",
      "id": "low-stakes-exploration",
      "prompt": "Which concepts describe a condition or response where getting it wrong carries little cost, rather than one where there's a single correct outcome to match?",
      "reasons": {
        "means-ends uncoupling": "This bridge concept names the condition directly: behavior separated from a required outcome.",
        "persistence at goal": "Children in the free-play group treated a failed attempt as information to try again, not as a fixed test they had failed -- the same low-stakes orientation the theory predicts."
      },
      "targets": [
        "low-stakes rehearsal",
        "free-play condition",
        "means-ends uncoupling",
        "persistence at goal"
      ]
    }
  ],
  "clusters": [
    {
      "id": "extended-immaturity",
      "name": "Extended Immaturity",
      "color": "teal",
      "fact": "Bruner argued that species with unusually long childhoods buy time for young animals to rehearse and recombine behaviors under low stakes, producing flexible, tool-using intelligence rather than fixed instinct -- and that the length of this period itself evolves as habitats grow more unpredictable.",
      "terms": [
        "prolonged juvenile period",
        "low-stakes rehearsal",
        "behavioral recombination",
        "habitat adaptability"
      ],
      "seeds": [
        "prolonged juvenile period",
        "low-stakes rehearsal"
      ]
    },
    {
      "id": "social-intelligence",
      "name": "Social Intelligence",
      "color": "blue",
      "fact": "Comparing ring-tailed lemurs -- socially organized but poor at handling objects -- against capuchin monkeys skilled at manipulating them, Jolly argued that primate intelligence first evolved to manage the demands of social life, since lemurs show that complex primate society can exist without complex object skill.",
      "terms": [
        "ring-tailed lemur",
        "capuchin monkey",
        "social complexity",
        "object manipulation"
      ],
      "seeds": [
        "ring-tailed lemur",
        "capuchin monkey"
      ],
      "termInfo": {
        "capuchin monkey": {
          "link": "wiki:Capuchin monkey",
          "text": "A New World monkey genus known for unusually skilled, dexterous object handling and tool use."
        },
        "ring-tailed lemur": {
          "link": "wiki:Ring-tailed lemur",
          "text": "A highly social lemur species from Madagascar that lives in large troops of both sexes."
        }
      }
    },
    {
      "id": "play-and-problem-solving",
      "name": "Play and Problem-Solving",
      "color": "amber",
      "fact": "In this 1976 study, three-to-five-year-olds who freely played with sticks and a clamp before trying to retrieve a marble solved the retrieval task about as often as children shown a demonstration, but treated a failed attempt as information to try again rather than as defeat.",
      "terms": [
        "stick-and-clamp task",
        "free-play condition",
        "demonstration condition",
        "persistence at goal"
      ],
      "seeds": [
        "stick-and-clamp task",
        "free-play condition"
      ]
    }
  ],
  "bridges": [
    {
      "id": "bridge-means-ends-uncoupling",
      "term": "means-ends uncoupling",
      "clusters": [
        0,
        2
      ],
      "fact": "Bruner's claim that extended immaturity lets behavior separate from required outcomes is directly tested by Sylva, Bruner, and Genova's design: children given free access to sticks and a clamp, with no demonstrated 'right' way to use them, explored more varied combinations than children who watched a demonstration first.",
      "relationKind": "evaluation",
      "idealTerms": [
        "low-stakes rehearsal",
        "free-play condition"
      ]
    },
    {
      "id": "bridge-social-learning",
      "term": "social learning",
      "clusters": [
        1,
        0
      ],
      "fact": "Jolly located primate intelligence in the demands of social life; Bruner located flexible intelligence in a long, protected childhood -- but both point to the same setting, the primate social group, as where either capacity is actually exercised and passed on.",
      "relationKind": "cross-cutting",
      "info": {
        "link": "wiki:Social learning in animals",
        "text": "Acquiring behavior by observing and participating in a social group, rather than through solitary trial and error."
      },
      "idealTerms": [
        "social complexity",
        "prolonged juvenile period"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "date": "2026-08-10",
      "provider": "Anthropic",
      "role": "drafted",
      "scope": "puzzle",
      "system": "Claude"
    }
  ]
});
