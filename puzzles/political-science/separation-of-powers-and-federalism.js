// Generated from content/puzzles/separation-of-powers-and-federalism.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "separation-of-powers-and-federalism",
  "title": "Separation of Powers and Federalism",
  "category": "political-science",
  "info": {
    "text": "How constitutional government divides authority twice over: horizontally among branches, and vertically between national and subnational levels.",
    "links": [
      {
        "href": "wiki:Separation of powers"
      }
    ]
  },
  "clusters": [
    {
      "id": "branches-of-government",
      "name": "Branches of Government",
      "color": "blue",
      "fact": "Montesquieu's 1748 argument in The Spirit of the Laws split lawmaking, law-enforcing, and law-interpreting into three distinct branches so that no single actor could do all three.",
      "terms": [
        "legislative branch",
        "executive branch",
        "judicial branch"
      ],
      "seeds": [
        "legislative branch",
        "executive branch"
      ],
      "termInfo": {
        "executive branch": {
          "links": [
            {
              "href": "wiki:Executive (government)"
            }
          ]
        },
        "judicial branch": {
          "links": [
            {
              "href": "wiki:Judiciary"
            }
          ]
        },
        "legislative branch": {
          "links": [
            {
              "href": "wiki:Legislature"
            }
          ]
        }
      },
      "info": {
        "text": "The horizontal division of a government's core functions -- lawmaking, enforcement, and interpretation -- among distinct bodies.",
        "links": [
          {
            "href": "wiki:Separation of powers"
          }
        ]
      }
    },
    {
      "id": "checks-and-balances",
      "name": "Checks and Balances",
      "color": "olive",
      "fact": "Separation alone doesn't prevent one branch from dominating the others; checks and balances give each branch specific tools to constrain the other two.",
      "terms": [
        "veto",
        "judicial review",
        "override",
        "impeachment"
      ],
      "seeds": [
        "veto",
        "judicial review"
      ],
      "termInfo": {
        "impeachment": {
          "links": [
            {
              "href": "wiki:Impeachment"
            }
          ]
        },
        "judicial review": {
          "links": [
            {
              "href": "wiki:Judicial review"
            }
          ]
        },
        "veto": {
          "links": [
            {
              "href": "wiki:Veto"
            }
          ]
        }
      },
      "info": {
        "text": "The mechanisms that let each branch of government limit the power of the other two, so separated powers stay genuinely balanced rather than merely divided.",
        "links": [
          {
            "href": "wiki:Separation of powers"
          }
        ]
      }
    },
    {
      "id": "federalism",
      "name": "Federalism",
      "color": "cyan",
      "fact": "Power can also be divided vertically, between a national government and its constituent parts, rather than just horizontally among branches -- and countries differ sharply in how much authority they push down to that level.",
      "terms": [
        "federal system",
        "unitary system",
        "confederation",
        "subsidiarity"
      ],
      "seeds": [
        "federal system",
        "unitary system"
      ],
      "termInfo": {
        "confederation": {
          "links": [
            {
              "href": "wiki:Confederation"
            }
          ]
        },
        "federal system": {
          "links": [
            {
              "href": "wiki:Federation"
            }
          ]
        },
        "subsidiarity": {
          "links": [
            {
              "href": "wiki:Subsidiarity"
            }
          ]
        },
        "unitary system": {
          "links": [
            {
              "href": "wiki:Unitary state"
            }
          ]
        }
      },
      "info": {
        "text": "How authority is divided territorially between a central government and its constituent parts, from tightly centralized to loosely joined.",
        "links": [
          {
            "href": "wiki:Federalism"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-constitution",
      "term": "constitution",
      "clusters": [
        0,
        1,
        2
      ],
      "fact": "A single constitutional text typically does all three jobs at once: it creates the branches, hands each one specific tools to check the others, and divides authority between the national government and its constituent parts.",
      "info": {
        "links": [
          {
            "href": "wiki:Constitution"
          }
        ]
      },
      "relationKind": "foundation"
    },
    {
      "id": "bridge-gridlock",
      "term": "gridlock",
      "clusters": [
        1,
        2
      ],
      "fact": "Multiple veto points create the same trade-off whether they sit between branches or between levels of government: the same structural feature that guards against one actor seizing power can also let any one actor block collective action.",
      "info": {
        "links": [
          {
            "href": "wiki:Gridlock (politics)"
          }
        ]
      },
      "relationKind": "cross-cutting"
    }
  ],
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude"
      }
    ]
  }
});
