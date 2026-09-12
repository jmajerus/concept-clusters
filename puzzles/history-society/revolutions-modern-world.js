// Generated from content/puzzles/revolutions-modern-world.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

export default definePuzzle(import.meta.url, {
  "id": "revolutions-modern-world",
  "title": "Revolutions of the modern world",
  "category": "history-society",
  "large": true,
  "clusters": [
    {
      "id": "american-revolution",
      "name": "American Revolution",
      "color": "teal",
      "fact": "The American Revolution overthrew British colonial rule in the name of natural rights and self-governance, founding a republic.",
      "terms": [
        "independence",
        "natural rights",
        "republic",
        "taxation"
      ],
      "seeds": [
        "independence",
        "natural rights"
      ],
      "termInfo": {
        "independence": {
          "links": [
            {
              "href": "wiki:Independence"
            }
          ]
        },
        "natural rights": {
          "links": [
            {
              "href": "wiki:Natural rights and legal rights"
            }
          ]
        },
        "republic": {
          "links": [
            {
              "href": "wiki:Republic"
            }
          ]
        },
        "taxation": {
          "links": [
            {
              "href": "wiki:Tax"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:American Revolution"
          }
        ]
      }
    },
    {
      "id": "french-revolution",
      "name": "French Revolution",
      "color": "blue",
      "fact": "The French Revolution overthrew the monarchy in the name of liberty and equality, but its radical phase descended into mass executions.",
      "terms": [
        "Estates-General",
        "guillotine",
        "Reign of Terror",
        "Declaration of the Rights of Man"
      ],
      "seeds": [
        "Estates-General",
        "guillotine"
      ],
      "termInfo": {
        "Estates-General": {
          "text": "France's traditional assembly of the three social estates (clergy, nobility, commoners) — its convening in 1789 triggered the Revolution.",
          "links": [
            {
              "href": "wiki:Estates General of 1789"
            }
          ]
        },
        "guillotine": {
          "links": [
            {
              "href": "wiki:Guillotine"
            }
          ]
        },
        "Reign of Terror": {
          "links": [
            {
              "href": "wiki:Reign of Terror"
            }
          ]
        },
        "Declaration of the Rights of Man": {
          "links": [
            {
              "href": "wiki:Declaration of the Rights of Man and of the Citizen"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:French Revolution"
          }
        ]
      }
    },
    {
      "id": "haitian-revolution",
      "name": "Haitian Revolution",
      "color": "amber",
      "fact": "The Haitian Revolution was the only successful slave revolt to found a nation, ending slavery in Saint-Domingue and establishing Haiti.",
      "terms": [
        "enslaved rebellion",
        "Toussaint Louverture",
        "Haitian independence",
        "Saint-Domingue"
      ],
      "seeds": [
        "enslaved rebellion",
        "Toussaint Louverture"
      ],
      "termInfo": {
        "enslaved rebellion": {
          "text": "An uprising by enslaved people against those who enslaved them — the Haitian Revolution is history's only one to succeed in founding a nation.",
          "links": [
            {
              "href": "wiki:Slave rebellion"
            }
          ]
        },
        "Toussaint Louverture": {
          "links": [
            {
              "href": "wiki:Toussaint Louverture"
            }
          ]
        },
        "Haitian independence": {
          "text": "Declared in 1804, ending French colonial rule and slavery in Saint-Domingue and founding Haiti.",
          "links": [
            {
              "href": "wiki:Haitian Declaration of Independence"
            }
          ]
        },
        "Saint-Domingue": {
          "links": [
            {
              "href": "wiki:Saint-Domingue"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Haitian Revolution"
          }
        ]
      }
    },
    {
      "id": "russian-revolution",
      "name": "Russian Revolution",
      "color": "magenta",
      "fact": "The Russian Revolution toppled the Tsar and, months later, brought the Bolsheviks to power, founding the world's first communist state.",
      "terms": [
        "Bolsheviks",
        "Tsar",
        "Lenin",
        "October Revolution"
      ],
      "seeds": [
        "Bolsheviks",
        "Tsar"
      ],
      "termInfo": {
        "Bolsheviks": {
          "links": [
            {
              "href": "wiki:Bolsheviks"
            }
          ]
        },
        "Tsar": {
          "links": [
            {
              "href": "wiki:Tsar"
            }
          ]
        },
        "Lenin": {
          "links": [
            {
              "href": "wiki:Vladimir Lenin"
            }
          ]
        },
        "October Revolution": {
          "links": [
            {
              "href": "wiki:October Revolution"
            }
          ]
        }
      },
      "info": {
        "links": [
          {
            "href": "wiki:Russian Revolution"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "enlightenment-ideals",
      "term": "Enlightenment ideals",
      "clusters": [
        0,
        1
      ],
      "fact": "Enlightenment ideals bridge the two: both revolutions drew on the same philosophy of natural rights and popular sovereignty, even as they produced very different outcomes.",
      "info": {
        "text": "The 18th-century intellectual movement that championed reason, natural rights, and popular sovereignty over inherited authority.",
        "links": [
          {
            "href": "wiki:Age of Enlightenment"
          }
        ]
      },
      "relationKind": "foundation",
      "idealTerms": [
        "natural rights",
        "Declaration of the Rights of Man"
      ]
    },
    {
      "id": "abolition-of-slavery",
      "term": "abolition of slavery",
      "clusters": [
        1,
        2
      ],
      "fact": "Abolition of slavery bridges the two: enslaved Haitians invoked the French Revolution's own Declaration of the Rights of Man to demand freedom, and the French Convention briefly abolished slavery in response in 1794.",
      "info": {
        "links": [
          {
            "href": "wiki:Abolitionism"
          }
        ]
      },
      "relationKind": "dynamic",
      "idealTerms": [
        "Declaration of the Rights of Man",
        "enslaved rebellion"
      ]
    },
    {
      "id": "provisional-government",
      "term": "provisional government",
      "clusters": [
        1,
        3
      ],
      "fact": "Provisional government bridges the two: both revolutions passed through an initial moderate government before radicals — Jacobins in France, Bolsheviks in Russia — overthrew it and seized full control.",
      "info": {
        "links": [
          {
            "href": "wiki:Provisional government"
          }
        ]
      },
      "relationKind": "cross-cutting",
      "idealTerms": [
        null,
        "Bolsheviks"
      ]
    }
  ]
});
