// Concept Clusters puzzle: Revolutions of the modern world
// Category: History & Society
// Generated from the original puzzles.js by split_puzzles.py.

export default {
  "id": "revolutions-modern-world",
  "title": "Revolutions of the modern world",
  "category": "History & Society",
  "large": true,
  "clusters": [
    {
      "name": "American Revolution",
      "info": {
        "link": "wiki:American Revolution"
      },
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
          "link": "wiki:Independence"
        },
        "natural rights": {
          "link": "wiki:Natural rights and legal rights"
        },
        "republic": {
          "link": "wiki:Republic"
        },
        "taxation": {
          "link": "wiki:Tax"
        }
      }
    },
    {
      "name": "French Revolution",
      "info": {
        "link": "wiki:French Revolution"
      },
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
          "link": "wiki:Estates General of 1789"
        },
        "guillotine": {
          "link": "wiki:Guillotine"
        },
        "Reign of Terror": {
          "link": "wiki:Reign of Terror"
        },
        "Declaration of the Rights of Man": {
          "link": "wiki:Declaration of the Rights of Man and of the Citizen"
        }
      }
    },
    {
      "name": "Haitian Revolution",
      "info": {
        "link": "wiki:Haitian Revolution"
      },
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
          "link": "wiki:Slave rebellion"
        },
        "Toussaint Louverture": {
          "link": "wiki:Toussaint Louverture"
        },
        "Haitian independence": {
          "text": "Declared in 1804, ending French colonial rule and slavery in Saint-Domingue and founding Haiti.",
          "link": "wiki:Haitian Declaration of Independence"
        },
        "Saint-Domingue": {
          "link": "wiki:Saint-Domingue"
        }
      }
    },
    {
      "name": "Russian Revolution",
      "info": {
        "link": "wiki:Russian Revolution"
      },
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
          "link": "wiki:Bolsheviks"
        },
        "Tsar": {
          "link": "wiki:Tsar"
        },
        "Lenin": {
          "link": "wiki:Vladimir Lenin"
        },
        "October Revolution": {
          "link": "wiki:October Revolution"
        }
      }
    }
  ],
  "bridges": [
    {
      "term": "Enlightenment ideals",
      "clusters": [
        0,
        1
      ],
      "relationKind": "foundation",
      "fact": "Enlightenment ideals bridge the two: both revolutions drew on the same philosophy of natural rights and popular sovereignty, even as they produced very different outcomes.",
      "idealTerms": [
        "natural rights",
        "Declaration of the Rights of Man"
      ],
      "info": {
        "text": "The 18th-century intellectual movement that championed reason, natural rights, and popular sovereignty over inherited authority.",
        "link": "wiki:Age of Enlightenment"
      }
    },
    {
      "term": "abolition of slavery",
      "clusters": [
        1,
        2
      ],
      "relationKind": "dynamic",
      "fact": "Abolition of slavery bridges the two: enslaved Haitians invoked the French Revolution's own Declaration of the Rights of Man to demand freedom, and the French Convention briefly abolished slavery in response in 1794.",
      "idealTerms": [
        "Declaration of the Rights of Man",
        "enslaved rebellion"
      ],
      "info": {
        "link": "wiki:Abolitionism"
      }
    },
    {
      "term": "provisional government",
      "clusters": [
        1,
        3
      ],
      "relationKind": "cross-cutting",
      "fact": "Provisional government bridges the two: both revolutions passed through an initial moderate government before radicals — Jacobins in France, Bolsheviks in Russia — overthrew it and seized full control.",
      "idealTerms": [
        null,
        "Bolsheviks"
      ],
      "info": {
        "link": "wiki:Provisional government"
      }
    }
  ]
};
