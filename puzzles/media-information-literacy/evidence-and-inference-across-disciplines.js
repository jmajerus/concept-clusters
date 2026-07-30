// Concept Clusters puzzle: Evidence and inference across disciplines
// Large size: 16 cluster terms + 3 bridge terms = 19 nodes.
// Matrix design: disciplinary clusters + cross-disciplinary evidence lenses.

export default {
  "id": "evidence-and-inference-across-disciplines",
  "title": "Evidence and inference across disciplines",
  "category": "Media & Information Literacy",
  "large": true,
  "info": {
    "text": "Science, history, law, and journalism use different kinds of evidence, but all must ask where information came from, how it was preserved, and what supports an inference.",
    "link": "wiki:Evidence"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Follow evidence from source and attribution through verification, interpretation, and public claims.",
      "link": "wiki:Information literacy"
    },
    "entries": [
      {
        "id": "quotations-and-attribution",
        "via": [
          "provenance",
          "attribution"
        ],
        "reason": "Apply provenance and source verification to claims about who said or wrote particular words."
      },
      {
        "id": "images-out-of-context",
        "via": [
          "provenance",
          "independent verification"
        ],
        "reason": "Use source history and external corroboration to evaluate visual evidence separated from its original setting."
      },
      {
        "id": "media-literacy",
        "via": [
          "verification",
          "evidence"
        ],
        "reason": "Connect disciplinary evidence practices with everyday habits for evaluating public information."
      }
    ]
  },
  "lenses": [
    {
      "id": "person-statement-evidence",
      "prompt": "Which concepts use a named person's statement or interpretation as evidence?",
      "targets": [
        "sworn testimony",
        "on-record interview",
        "eyewitness account",
        "expert testimony"
      ],
      "explanation": "Courts and journalism often rely on attributable statements, while expert testimony adds specialized interpretation. Such statements still require evaluation for perception, competence, incentives, consistency, and corroboration.",
      "reasons": {
        "sworn testimony": "A witness gives an attributable statement under oath or affirmation.",
        "on-record interview": "The speaker agrees that the statement and identity may be reported.",
        "eyewitness account": "A person reports what they perceived directly.",
        "expert testimony": "A qualified specialist offers an opinion grounded in relevant knowledge and methods."
      }
    },
    {
      "id": "origin-and-authenticity",
      "prompt": "Which concepts help establish the origin, authenticity, or handling history of evidence?",
      "targets": [
        "archival document",
        "material artifact",
        "physical evidence",
        "public record",
        "chain of custody",
        "provenance"
      ],
      "explanation": "Documents, artifacts, physical evidence, and public records become more trustworthy when their origin and handling can be traced through archival description, custody records, or other provenance evidence.",
      "reasons": {
        "archival document": "Archival context can record who created a document and how it entered a collection.",
        "material artifact": "An object's origin, excavation context, ownership, and alterations affect what can be inferred from it.",
        "physical evidence": "Authenticity and integrity matter when an object is offered as evidence.",
        "public record": "Official creation, custody, and certification can support a record's authenticity.",
        "chain of custody": "A documented handling history helps show that evidence was not substituted or materially altered.",
        "provenance": "Provenance directly names the history of origin, ownership, custody, or transmission."
      }
    },
    {
      "id": "independent-confirmation",
      "prompt": "Which concepts strengthen a claim by checking it against independent results or sources?",
      "targets": [
        "replication",
        "source criticism",
        "independent verification",
        "corroboration"
      ],
      "explanation": "Repeated studies, critical comparison of historical sources, independent reporting, and corroboration all test whether a claim survives contact with evidence beyond its first presentation.",
      "reasons": {
        "replication": "A new study tests whether a reported finding can be obtained again.",
        "source criticism": "Historians compare a source's origin, purpose, context, and claims with other evidence.",
        "independent verification": "A journalist seeks confirmation that does not merely repeat the original source.",
        "corroboration": "Separate evidence agrees with or materially supports a claim."
      }
    },
    {
      "id": "inspectable-record",
      "prompt": "Which concepts create or preserve an attributable record that other people can later inspect?",
      "targets": [
        "archival document",
        "sworn testimony",
        "precedent",
        "chain of custody",
        "on-record interview",
        "public record"
      ],
      "explanation": "These concepts preserve words, decisions, documents, or handling histories in forms that later investigators can inspect, compare, cite, or challenge.",
      "reasons": {
        "archival document": "The document is preserved as part of an identifiable collection or record.",
        "sworn testimony": "Proceedings ordinarily preserve testimony in an official record or transcript.",
        "precedent": "Published or recorded decisions preserve legal reasoning for later cases.",
        "chain of custody": "The chain is itself a record of who controlled evidence and when.",
        "on-record interview": "The source permits attribution, allowing the statement to remain inspectable and contestable.",
        "public record": "A public body creates or maintains the record for official purposes."
      }
    },
    {
      "id": "repeated-evidence-roles",
      "prompt": "Which concepts appeared in more than one of the preceding evidence lenses?",
      "targets": [
        "archival document",
        "sworn testimony",
        "chain of custody",
        "on-record interview",
        "public record"
      ],
      "explanation": "These concepts do more than one epistemic job: they can serve as evidence while also preserving attribution, provenance, custody, or an inspectable record.",
      "reasons": {
        "archival document": "It is both an evidence item and a preserved record whose origin can be studied.",
        "sworn testimony": "It is a personal statement and part of an attributable proceeding record.",
        "chain of custody": "It helps establish authenticity and creates an inspectable handling record.",
        "on-record interview": "It is a person's statement and an attributable record for later checking.",
        "public record": "It is both a source of evidence and an officially preserved record whose origin can be verified."
      }
    }
  ],
  "clusters": [
    {
      "name": "Scientific investigation",
      "color": "green",
      "fact": "Scientific inference links controlled observation and measurement to analysis, while replication tests whether a result depends on one sample, method, or laboratory.",
      "terms": [
        "controlled experiment",
        "measurement",
        "replication",
        "statistical analysis"
      ],
      "seeds": [
        "controlled experiment",
        "measurement"
      ],
      "termInfo": {
        "controlled experiment": {
          "text": "A study that changes an independent variable while holding other relevant conditions constant or comparing against a control.",
          "link": "wiki:Scientific control"
        },
        "measurement": {
          "text": "The assignment of values to observations according to defined units, instruments, and procedures.",
          "link": "wiki:Measurement"
        },
        "replication": {
          "text": "An independent repetition of a study or analysis to test whether its result can be obtained again.",
          "link": "wiki:Reproducibility"
        },
        "statistical analysis": {
          "text": "Methods for summarizing data, estimating uncertainty, testing models, and drawing inferences from variation.",
          "link": "wiki:Statistical inference"
        }
      },
      "info": {
        "link": "wiki:Scientific method"
      }
    },
    {
      "name": "Historical inquiry",
      "color": "blue",
      "fact": "Historians construct accounts by placing documents and artifacts in chronological and social context, then critically comparing what different sources can and cannot support.",
      "terms": [
        "archival document",
        "material artifact",
        "chronology",
        "source criticism"
      ],
      "seeds": [
        "archival document",
        "chronology"
      ],
      "termInfo": {
        "archival document": {
          "text": "A document preserved within an archive or manuscript collection together with information about its creator and context.",
          "link": "wiki:Archive"
        },
        "material artifact": {
          "text": "A human-made or modified object studied as evidence about past activity and culture.",
          "link": "wiki:Artifact (archaeology)"
        },
        "chronology": {
          "text": "The ordering and dating of events so that sequence, duration, and possible relationships can be examined.",
          "link": "wiki:Chronology"
        },
        "source criticism": {
          "text": "The evaluation of a source's origin, purpose, context, transmission, reliability, and relation to other evidence.",
          "link": "wiki:Source criticism"
        }
      },
      "info": {
        "link": "wiki:Historical method"
      }
    },
    {
      "name": "Legal adjudication",
      "color": "amber",
      "fact": "Courts evaluate testimony, objects, records, and prior decisions through rules governing relevance, reliability, authentication, custody, and permissible inference.",
      "terms": [
        "sworn testimony",
        "physical evidence",
        "precedent",
        "chain of custody"
      ],
      "seeds": [
        "sworn testimony",
        "physical evidence"
      ],
      "termInfo": {
        "sworn testimony": {
          "text": "Evidence given by a witness under oath or affirmation in a legal proceeding.",
          "link": "wiki:Testimony"
        },
        "physical evidence": {
          "text": "A tangible object offered to help prove or disprove a fact in a legal investigation or proceeding.",
          "link": "wiki:Physical evidence"
        },
        "precedent": {
          "text": "An earlier judicial decision used as authority or guidance in deciding a later case.",
          "link": "wiki:Precedent"
        },
        "chain of custody": {
          "text": "The documented sequence of possession, transfer, analysis, and storage of evidence.",
          "link": "wiki:Chain of custody"
        }
      },
      "info": {
        "link": "wiki:Evidence (law)"
      }
    },
    {
      "name": "Journalistic verification",
      "color": "rose",
      "fact": "Journalists strengthen public claims by attributing statements, consulting records, checking eyewitness accounts, and seeking confirmation independent of the original source.",
      "terms": [
        "on-record interview",
        "public record",
        "eyewitness account",
        "independent verification"
      ],
      "seeds": [
        "on-record interview",
        "public record"
      ],
      "termInfo": {
        "on-record interview": {
          "text": "An interview in which the source agrees that the information and the source's identity may be published.",
          "link": "wiki:Interview"
        },
        "public record": {
          "text": "Information created or maintained by a government body and made available under applicable law or policy.",
          "link": "wiki:Public records"
        },
        "eyewitness account": {
          "text": "A first-person report from someone who directly perceived an event.",
          "link": "wiki:Eyewitness testimony"
        },
        "independent verification": {
          "text": "Confirmation obtained through evidence or sources that do not merely repeat the original claim.",
          "link": "wiki:Fact-checking"
        }
      },
      "info": {
        "link": "wiki:Journalism ethics and standards"
      }
    }
  ],
  "bridges": [
    {
      "term": "provenance",
      "conceptId": "provenance",
      "clusters": [
        1,
        2,
        3
      ],
      "relationKind": "foundation",
      "fact": "Provenance links history, law, and journalism because the origin, custody, and transmission of a document, object, record, or media item shape whether it is authentic and what claims it can support.",
      "info": {
        "text": "The documented history of an item's origin, ownership, custody, or transmission.",
        "link": "wiki:Provenance"
      }
    },
    {
      "term": "expert testimony",
      "clusters": [
        0,
        2
      ],
      "relationKind": "evaluation",
      "fact": "Expert testimony connects scientific or technical knowledge with legal adjudication when a qualified specialist explains methods, evidence, and inferences relevant to a case.",
      "idealTerms": [
        "statistical analysis",
        "sworn testimony"
      ],
      "info": {
        "text": "Opinion evidence offered by a qualified person whose specialized knowledge may help a court understand evidence or decide a fact.",
        "link": "wiki:Expert witness"
      }
    },
    {
      "term": "corroboration",
      "clusters": [
        1,
        3
      ],
      "relationKind": "evaluation",
      "fact": "Corroboration connects historical and journalistic inquiry because separate sources can support, qualify, or contradict an account rather than merely repeating it.",
      "idealTerms": [
        "source criticism",
        "independent verification"
      ],
      "info": {
        "text": "Support for a claim supplied by additional evidence or an independent source.",
        "link": "wiki:Corroborating evidence"
      }
    }
  ]
};
