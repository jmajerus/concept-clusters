// Generated from content/puzzles/freedom-from-freedom-to.ccpuzzle.jsonld.
// Edit the JSON-LD source and re-import it rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "freedom-from-freedom-to",
  "title": "Freedom From, Freedom To",
  "category": "Political Science",
  "categories": [
    "Political Science",
    "Philosophy"
  ],
  "subcategories": {
    "Philosophy": "political-philosophy"
  },
  "tags": [
    "book"
  ],
  "info": {
    "text": "Isaiah Berlin's argument that 'freedom' names two entirely legitimate but incompatible things -- and his warning that one of them, positive liberty, is far more easily turned into an alibi for coercion than the other.",
    "citations": [
      {
        "title": "Two Concepts of Liberty, in Four Essays on Liberty",
        "author": "Isaiah Berlin",
        "publisher": "Oxford University Press",
        "year": "1969"
      }
    ]
  },
  "lenses": [
    {
      "id": "requires-a-claim-about-your-true-self",
      "prompt": "Which of these depend on someone else claiming to know your 'real' interests better than you do?",
      "explanation": "Self-mastery already requires believing a person has a higher, truer self distinct from their everyday one; the divided self is that belief made explicit; forced to be free is what happens once someone else claims authority to speak for the higher self against the empirical one; and the general will is the collective version of the same move. Negative liberty never has to make a claim like this about anyone -- which is exactly Berlin's point about where it stays safer.",
      "targets": [
        "self-mastery",
        "divided self",
        "forced to be free",
        "the general will"
      ],
      "reasons": {
        "divided self": "That assumed split, made explicit as a higher, rational self and a lower, empirical one.",
        "forced to be free": "What happens once someone else claims authority to speak for the higher self against the empirical one.",
        "self-mastery": "Already assumes a split between a truer self and an everyday one -- the assumption the rest of this lens builds on.",
        "the general will": "The collective version of the same move: an individual's true interest identified with the group's, licensing the same coercion."
      }
    },
    {
      "id": "genuine-senses-of-liberty",
      "prompt": "Which of these are legitimate senses of freedom in Berlin's own account, rather than the corruption of one of them?",
      "explanation": "Berlin defended both negative and positive liberty as real, legitimate human goals -- his warning was never that positive liberty is inherently false, only that its logic is more easily hijacked than negative liberty's. Non-interference, self-mastery, freedom to, and autonomy are all still on the legitimate side of that line; forced to be free and the general will are what happen once the positive side gets hijacked.",
      "targets": [
        "non-interference",
        "self-mastery",
        "freedom to",
        "autonomy"
      ],
      "reasons": {
        "autonomy": "Self-rule as opposed to dependence on others -- still a legitimate form of freedom in Berlin's own account.",
        "freedom to": "The straightforward positive sense: the real ability to pursue and achieve what one wills.",
        "non-interference": "Negative liberty's core claim, and the one Berlin thought hardest to weaponize.",
        "self-mastery": "Positive liberty's legitimate core, before any claim about someone else's 'truer' self enters."
      }
    }
  ],
  "clusters": [
    {
      "id": "negative-liberty",
      "name": "Negative Liberty",
      "color": "teal",
      "fact": "Negative liberty asks a single question: within what area can a person act without other people getting in the way? Berlin traced it to Hobbes's idea that liberty lives in the silence of the law -- wherever no rule or person obstructs you, you are free, regardless of whether you have the means, talent, or luck to actually achieve anything with that freedom.",
      "terms": [
        "non-interference",
        "coercion by others",
        "silence of the law",
        "area of unobstructed action"
      ],
      "seeds": [
        "non-interference",
        "coercion by others"
      ],
      "termInfo": {
        "area of unobstructed action": "Berlin's own phrasing: the region within which a person is left to do or be what they are able to do or be, without others interfering.",
        "coercion by others": "The only thing negative liberty counts as a genuine threat to freedom -- deliberate interference by another person, not misfortune, poverty, or a lack of ability.",
        "silence of the law": "Hobbes's phrase, which Berlin invokes approvingly: liberty exists precisely in whatever a law or rule does not reach."
      },
      "info": {
        "text": "Freedom as the absence of deliberate interference by other people -- the area within which a person can act unobstructed, whatever they choose to do with it.",
        "link": "wiki:Negative and positive liberty"
      }
    },
    {
      "id": "positive-liberty",
      "name": "Positive Liberty",
      "color": "amber",
      "fact": "Positive liberty asks a different question: who, or what, is actually in charge of a person's choices? Its answer is self-mastery -- being directed by one's own rational will rather than by impulse, habit, or someone else's command. Berlin treated this as a real and legitimate freedom, not a lesser one, right up until it gets appropriated for a very different purpose.",
      "terms": [
        "self-mastery",
        "the rational will",
        "freedom to",
        "autonomy"
      ],
      "seeds": [
        "self-mastery",
        "the rational will"
      ],
      "termInfo": {
        "autonomy": "Self-rule, as opposed to dependence on someone else's decisions -- a second, related sense in which Berlin used positive liberty.",
        "freedom to": "The straightforward positive sense: not just being unobstructed, but actually having the power and resources to pursue and achieve what one wills.",
        "the rational will": "The part of a person positive liberty identifies as the one that ought to be doing the choosing."
      },
      "info": {
        "text": "Freedom as self-direction: being the author of one's own choices, ruled by one's own rational will rather than by external command or internal impulse."
      }
    },
    {
      "id": "the-totalitarian-opening",
      "name": "The Totalitarian Opening",
      "color": "magenta",
      "fact": "Berlin's central warning was historical, not hypothetical: positive liberty's logic has been used to justify oppression far more often than negative liberty's has. Once you grant that a person has a higher, rational self distinct from their everyday one, someone else can claim to speak for that higher self -- and Rousseau's own phrase for the result was that a person could rightly be forced to be free.",
      "terms": [
        "divided self",
        "forced to be free",
        "the general will"
      ],
      "seeds": [
        "divided self",
        "forced to be free"
      ],
      "termInfo": {
        "divided self": "The split between a 'higher,' rational self and a 'lower,' empirical one -- a split Berlin reports rather than endorses, since granting it is what makes the rest of this cluster possible.",
        "forced to be free": "Rousseau's phrase, taken up by later regimes: coercing someone's everyday self is redescribed as liberating their true, rational self.",
        "the general will": "The collective version of the same move -- an individual's real interest identified with the group's, licensing coercion in the name of an interest the person may not recognize as their own."
      },
      "info": {
        "text": "Berlin's warning about how positive liberty's own internal logic -- not a distortion of it, but a short step from it -- has historically been used to justify coercion in freedom's own name.",
        "link": "wiki:Isaiah Berlin"
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-obstacle",
      "term": "obstacle",
      "clusters": [
        0,
        1
      ],
      "fact": "The two traditions disagree about what actually counts as an obstacle to freedom. Negative liberty counts only deliberate interference by other people -- poverty, weak willpower, or a bad habit are misfortunes, not unfreedom. Positive liberty extends the count to obstacles inside a person too: an irrational passion or an undisciplined lower self can be exactly what freedom requires overcoming.",
      "relationKind": "contrast",
      "idealTerms": [
        "coercion by others",
        "self-mastery"
      ]
    },
    {
      "id": "bridge-the-true-self",
      "term": "the true self",
      "clusters": [
        1,
        2
      ],
      "fact": "Self-mastery already assumes a split between a higher, rational self and a lower, empirical one -- Berlin's whole warning is that this split, once granted, creates an opening: if someone else can claim to know your higher self better than your everyday self does, coercing the everyday self can be redescribed as liberation rather than force.",
      "relationKind": "dynamic",
      "idealTerms": [
        "self-mastery",
        "divided self"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "bridge-silence",
      "term": "silence",
      "clusters": [
        0,
        2
      ],
      "fact": "This is exactly the opening negative liberty refuses to create. Because it asks only whether someone else is interfering, and never claims to know what a person's true interests actually are, it gives a would-be liberator no foothold for insisting that coercion is really freedom in disguise.",
      "relationKind": "contrast",
      "idealTerms": [
        "silence of the law",
        "forced to be free"
      ]
    }
  ],
  "generativeAssistance": [
    {
      "system": "Claude",
      "scope": "puzzle",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-11"
    },
    {
      "system": "Claude",
      "scope": "lenses",
      "role": "drafted",
      "provider": "Anthropic",
      "date": "2026-08-11"
    }
  ]
});
