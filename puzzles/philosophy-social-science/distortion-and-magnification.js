// Concept Clusters puzzle: Distortion and magnification
// Manuscript-derived catalogue: The Struggle Against Dehumanization

export default {
  "id": "distortion-and-magnification",
  "title": "Distortion and magnification",
  "category": "Philosophy & Social Science",
  "large": true,
  "info": {
    "text": "A diagnostic map separating distorted perception and moral judgment from the institutional and identity structures that can amplify them.",
    "link": "wiki:Dehumanization"
  },
  "relatedPuzzles": {
    "info": {"text": "Apply the diagnostic framework to institutional blindness, then examine practices that interrupt its pathways."},
    "entries": [
      {"id": "when-systems-stop-seeing-people", "via": ["institutional magnification", "moral distance"], "reason": "See how authority, roles, and procedures can magnify distance from particular people."},
      {"id": "restorative-patterns", "via": ["moral judgment", "corrective practices"], "reason": "Turn from diagnosis toward recognition, restraint, accountability, and repair."}
    ]
  },
  "lenses": [
    {
      "id": "distorting-judgment",
      "prompt": "Which concepts directly alter what people perceive, believe, or treat as morally relevant?",
      "targets": ["information isolation", "threat misperception", "misinformation", "loss of context", "conditional dignity", "proportionality collapse"],
      "explanation": "Epistemic and moral distortions change the inputs or standards of judgment: what evidence is available, what danger is perceived, whose dignity counts, and what response seems proportionate.",
      "reasons": {
        "information isolation": "Relevant evidence and alternative interpretations are kept outside the person's information environment.",
        "threat misperception": "Risk is exaggerated, displaced, or attached to the wrong target.",
        "misinformation": "False or misleading claims alter the factual basis for judgment.",
        "loss of context": "A fragment is interpreted without the circumstances needed to understand it.",
        "conditional dignity": "Human worth is treated as dependent on status, conduct, identity, or usefulness.",
        "proportionality collapse": "Differences in severity and consequence no longer constrain the response."
      }
    },
    {
      "id": "magnifying-structures",
      "prompt": "Which concepts can amplify an existing orientation through institutions or group identity?",
      "targets": ["role authority", "procedural repetition", "technical framing", "diffusion of responsibility", "in-group loyalty", "betrayal framing"],
      "explanation": "Magnifying structures may not originate a distorted belief or value, but they can increase its reach, durability, legitimacy, and behavioral force.",
      "reasons": {
        "role authority": "An institutional position gives decisions additional force and presumed legitimacy.",
        "procedural repetition": "Repeated routines make an orientation ordinary and self-reproducing.",
        "technical framing": "Moral choices can be presented as neutral matters of expertise or administration.",
        "diffusion of responsibility": "Distributed action reduces each participant's felt responsibility.",
        "in-group loyalty": "Commitment to the group strengthens conformity with its judgments.",
        "betrayal framing": "Disagreement is recast as disloyalty, raising the cost of correction."
      }
    },
    {
      "id": "barriers-to-correction",
      "prompt": "Which concepts can make evidence, dissent, or moral reconsideration harder to receive?",
      "targets": ["information isolation", "role authority", "in-group loyalty", "betrayal framing", "normalization", "legitimacy"],
      "explanation": "Correction becomes difficult when contrary evidence cannot enter, authority discourages challenge, group loyalty punishes dissent, and repeated practices acquire the appearance of normality and legitimacy.",
      "reasons": {
        "information isolation": "Corrective evidence may never reach the group or decision-maker.",
        "role authority": "Challenges can be dismissed as improper resistance to an authorized role.",
        "in-group loyalty": "Belonging becomes tied to accepting the group's account.",
        "betrayal framing": "Criticism is interpreted as treachery rather than possible correction.",
        "normalization": "Repeated harm becomes familiar and therefore less visible as a problem.",
        "legitimacy": "Practices accepted as rightful receive deference even when their effects warrant review."
      }
    }
  ],
  "clusters": [
    {
      "name": "Epistemic distortion",
      "color": "teal",
      "fact": "Epistemic distortion weakens access to shared reality by narrowing information, misreading threats, circulating falsehoods, or stripping claims from the context needed to judge them.",
      "terms": ["information isolation", "threat misperception", "misinformation", "loss of context"],
      "seeds": ["misinformation", "threat misperception"],
      "termInfo": {
        "information isolation": {"text": "A condition in which relevant evidence and competing interpretations are absent or systematically excluded.", "link": "wiki:Echo chamber (media)"},
        "threat misperception": {"text": "An inaccurate judgment about the source, scale, likelihood, or meaning of danger.", "link": "wiki:Risk perception"},
        "misinformation": {"text": "False or misleading information, whether or not it was created with an intention to deceive.", "link": "wiki:Misinformation"},
        "loss of context": {"text": "Removal of the surrounding circumstances that determine how a statement, image, event, or action should be understood.", "link": "wiki:Context (language use)"}
      },
      "info": {"link": "wiki:Epistemology"}
    },
    {
      "name": "Moral distortion",
      "color": "blue",
      "fact": "Moral distortion changes the terms of regard by making dignity conditional, excluding people from moral concern, collapsing proportionality, or disengaging responsibility from harmful conduct.",
      "terms": ["conditional dignity", "moral exclusion", "proportionality collapse", "moral disengagement"],
      "seeds": ["moral exclusion", "moral disengagement"],
      "termInfo": {
        "conditional dignity": {"text": "The treatment of human worth as something that can be earned, lost, or withheld according to identity, conduct, status, or usefulness.", "link": "wiki:Dignity"},
        "moral exclusion": {"text": "Placing people outside the boundary within which ordinary rules of fairness, rights, and concern are understood to apply.", "link": "wiki:Moral exclusion"},
        "proportionality collapse": {"text": "A failure to distinguish levels of severity, responsibility, or consequence when judging what response is justified.", "link": "wiki:Proportionality (law)"},
        "moral disengagement": {"text": "Cognitive and social mechanisms that permit harmful conduct without corresponding self-condemnation.", "link": "wiki:Moral disengagement"}
      },
      "info": {"link": "wiki:Moral psychology"}
    },
    {
      "name": "Institutional magnification",
      "color": "amber",
      "fact": "Institutions magnify orientations by adding authority, repetition, technical language, and divided roles that extend decisions beyond any one person's judgment.",
      "terms": ["role authority", "procedural repetition", "technical framing", "diffusion of responsibility"],
      "seeds": ["role authority", "diffusion of responsibility"],
      "termInfo": {
        "role authority": {"text": "Power or deference attached to an institutional position rather than only to the individual who occupies it.", "link": "wiki:Authority"},
        "procedural repetition": {"text": "The recurrence of an approved routine until its assumptions and effects appear ordinary.", "link": "wiki:Normalization (sociology)"},
        "technical framing": {"text": "Presentation of a contested human choice as a neutral matter of administration, measurement, or specialized expertise.", "link": "wiki:Framing (social sciences)"},
        "diffusion of responsibility": {"text": "Reduced personal responsibility when many people participate in, witness, or authorize an outcome.", "link": "wiki:Diffusion of responsibility"}
      },
      "info": {"link": "wiki:Institution"}
    },
    {
      "name": "Identity magnification",
      "color": "magenta",
      "fact": "Group identity magnifies judgments when loyalty, betrayal, stereotypes, and fused identity make agreement a condition of belonging and opposition a threat to the self.",
      "terms": ["in-group loyalty", "betrayal framing", "out-group homogeneity", "identity fusion"],
      "seeds": ["in-group loyalty", "betrayal framing"],
      "termInfo": {
        "in-group loyalty": {"text": "Preferential commitment to the welfare, norms, and judgments of one's own group.", "link": "wiki:In-group and out-group"},
        "betrayal framing": {"text": "Interpretation of criticism, dissent, or departure as disloyalty to the group.", "link": "wiki:Betrayal"},
        "out-group homogeneity": {"text": "The tendency to perceive members of another group as more alike than members of one's own group.", "link": "wiki:Out-group homogeneity"},
        "identity fusion": {"text": "A strong alignment of personal and group identity in which threats to the group are experienced as threats to the self.", "link": "wiki:Identity fusion"}
      },
      "info": {"link": "wiki:Social identity theory"}
    }
  ],
  "bridges": [
    {
      "term": "threat narrative",
      "conceptId": "threat-narrative",
      "clusters": [0, 3],
      "relationKind": "dynamic",
      "fact": "A threat narrative converts epistemic distortion into identity pressure when uncertain or misleading claims portray an out-group or dissenter as an existential danger to the community.",
      "idealTerms": ["threat misperception", "betrayal framing"],
      "info": {"text": "A story that organizes events and identities around a claimed danger requiring collective response.", "link": "wiki:Moral panic"}
    },
    {
      "term": "normalization",
      "conceptId": "normalization",
      "clusters": [1, 2],
      "relationKind": "dynamic",
      "fact": "Institutional repetition can normalize moral distortion by making conditional dignity, exclusion, or disproportionate treatment appear routine rather than exceptional.",
      "idealTerms": ["conditional dignity", "procedural repetition"],
      "info": {"text": "The process by which a practice or judgment becomes familiar, expected, and treated as ordinary.", "link": "wiki:Normalization (sociology)"}
    },
    {
      "term": "legitimacy",
      "conceptId": "legitimacy",
      "clusters": [2, 3],
      "relationKind": "foundation",
      "fact": "Institutional authority and group loyalty can reinforce legitimacy: official endorsement validates the group's commitments, while group identification supplies consent and social enforcement.",
      "idealTerms": ["role authority", "in-group loyalty"],
      "info": {"text": "The recognized rightfulness of an authority, institution, rule, or social order.", "link": "wiki:Legitimacy (political)"}
    }
  ]
};