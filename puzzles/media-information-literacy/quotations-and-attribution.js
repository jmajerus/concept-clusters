// Concept Clusters puzzle: Quotations and attribution
// Standard size: 12 cluster terms + 2 bridge terms = 14 nodes.
// Includes relatedPuzzles navigation metadata and a shared provenance conceptId.

export default {
  "id": "quotations-and-attribution",
  "title": "Quotations and attribution",
  "category": "Media & Information Literacy",
  "relatedPuzzles": {
    "entries": [
      {
        "id": "images-out-of-context",
        "via": [
          "provenance",
          "context"
        ],
        "reason": "Compare how images and quotations lose meaning when detached from origins and context."
      },
      {
        "id": "ai-generated-synthetic-media",
        "via": [
          "provenance",
          "authentication"
        ],
        "reason": "Extend source tracing from altered words to synthetic media and technical authenticity signals."
      }
    ]
  },
  "clusters": [
    {
      "name": "Quotation evidence",
      "color": "green",
      "fact": "A quotation is strongest when it can be tied to direct evidence such as a transcript, recording, primary document or published interview.",
      "terms": [
        "transcript",
        "audio recording",
        "primary document",
        "published interview"
      ],
      "seeds": [
        "transcript",
        "audio recording"
      ],
      "termInfo": {
        "transcript": {
          "text": "A written representation of spoken words that can be checked against an original speech, hearing, interview or recording.",
          "link": "wiki:Transcription (linguistics)",
          "extraLink": "https://guides.loc.gov/quotations"
        },
        "audio recording": {
          "text": "Captured sound that may preserve the speaker's exact words, delivery and surrounding exchange.",
          "link": "wiki:Sound recording and reproduction",
          "extraLink": "https://guides.loc.gov/quotations"
        },
        "primary document": {
          "text": "An original text created at or near the time of the statement, such as a letter, speech, diary, court record or published work.",
          "link": "wiki:Primary source",
          "extraLink": "https://guides.loc.gov/quotations"
        },
        "published interview": {
          "text": "A documented question-and-answer exchange that identifies the speaker, interviewer, publication and date.",
          "link": "wiki:Interview",
          "extraLink": "https://guides.loc.gov/quotations"
        }
      },
      "info": {
        "link": "wiki:Quotation",
        "extraLink": "https://guides.loc.gov/quotations"
      }
    },
    {
      "name": "Attribution failures",
      "color": "blue",
      "fact": "Quotations can become unreliable through changed wording, attribution to the wrong person, selective excerpting or repeated paraphrase.",
      "terms": [
        "misquotation",
        "false attribution",
        "quote mining",
        "paraphrase drift"
      ],
      "seeds": [
        "misquotation",
        "false attribution"
      ],
      "termInfo": {
        "misquotation": {
          "text": "A quotation whose wording differs materially from what the source actually said or wrote.",
          "link": "wiki:Quotation",
          "extraLink": "https://guides.loc.gov/quotations/misquotations"
        },
        "false attribution": {
          "text": "Crediting words to a person who did not say or write them, often because a famous name makes the quotation more persuasive or memorable.",
          "link": "wiki:False attribution",
          "extraLink": "https://guides.loc.gov/quotations/misquotations"
        },
        "quote mining": {
          "text": "Selecting a fragment while omitting nearby words or qualifications that would change how the passage is understood.",
          "link": "wiki:Quoting out of context",
          "extraLink": "https://guides.loc.gov/quotations/misquotations"
        },
        "paraphrase drift": {
          "text": "A summary or remembered version that changes gradually as it is repeated until it is presented as an exact quotation.",
          "link": "wiki:Paraphrase",
          "extraLink": "https://guides.loc.gov/quotations/misquotations"
        }
      },
      "info": {
        "link": "wiki:False attribution",
        "extraLink": "https://guides.loc.gov/quotations/misquotations"
      }
    },
    {
      "name": "Verification practices",
      "color": "amber",
      "fact": "Quotation research uses exact-phrase searching, the earliest documented source, surrounding context and independent confirmation.",
      "terms": [
        "exact-phrase search",
        "earliest source",
        "surrounding context",
        "independent confirmation"
      ],
      "seeds": [
        "exact-phrase search",
        "surrounding context"
      ],
      "termInfo": {
        "exact-phrase search": {
          "text": "Searching distinctive words inside quotation marks, then trying shorter or variant phrases when the circulating wording may be imperfect.",
          "link": "wiki:Quotation mark",
          "extraLink": "https://guides.loc.gov/quotations/online"
        },
        "earliest source": {
          "text": "The oldest documented occurrence found so far, which may reveal the original wording, speaker and setting or show that attribution changed later.",
          "link": "wiki:Textual criticism",
          "extraLink": "https://guides.loc.gov/quotations/misquotations"
        },
        "surrounding context": {
          "text": "The nearby sentences, questions, circumstances and larger work needed to understand what the quoted words meant.",
          "link": "wiki:Context (language use)",
          "extraLink": "https://guides.loc.gov/quotations/misquotations"
        },
        "independent confirmation": {
          "text": "A second reliable record or source that supports the wording, attribution or circumstances of a quotation.",
          "link": "wiki:Corroborating evidence",
          "extraLink": "https://guides.loc.gov/quotations"
        }
      },
      "info": {
        "link": "wiki:Source criticism",
        "extraLink": "https://guides.loc.gov/quotations"
      }
    }
  ],
  "bridges": [
    {
      "term": "provenance",
      "conceptId": "provenance",
      "clusters": [
        0,
        2
      ],
      "fact": "Provenance bridges quotation evidence and verification: a traceable chain from the circulating words back to the earliest reliable record helps establish who said them, when and where.",
      "idealTerms": [
        "primary document",
        "earliest source"
      ],
      "info": {
        "text": "The documented history of a quotation's wording, attribution and transmission from its earliest reliable source to later repetitions.",
        "link": "wiki:Provenance",
        "extraLink": "https://guides.loc.gov/quotations"
      }
    },
    {
      "term": "context",
      "clusters": [
        1,
        2
      ],
      "fact": "Context bridges attribution failures and verification: quote mining distorts meaning by removing surrounding material, while restoring that material tests whether the excerpt represents the source fairly.",
      "idealTerms": [
        "quote mining",
        "surrounding context"
      ],
      "info": {
        "text": "The linguistic and situational surroundings that shape the meaning of quoted words.",
        "link": "wiki:Context (language use)",
        "extraLink": "https://guides.loc.gov/quotations/misquotations"
      }
    }
  ]
};
