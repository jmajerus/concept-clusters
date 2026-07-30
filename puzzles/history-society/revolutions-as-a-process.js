// Concept Clusters puzzle: Revolutions as a process
// Large size: 16 cluster terms + 3 bridge terms = 19 nodes.
// Matrix design: process clusters + historical-case lenses.

export default {
  "id": "revolutions-as-a-process",
  "title": "Revolutions as a process",
  "category": "History & Society",
  "large": true,
  "info": {
    "text": "Revolutions develop through interacting crises, mobilization, institutional change, conflict, and state-building rather than following one universal sequence.",
    "link": "wiki:Revolution"
  },
  "relatedPuzzles": {
    "info": {
      "text": "Compare revolutions as historical cases, recurring processes, and sources of later political institutions.",
      "link": "wiki:Political revolution"
    },
    "entries": [
      {
        "id": "revolutions-modern-world",
        "via": [
          "revolution",
          "mass politics"
        ],
        "reason": "Reorganize the same broad subject by historical case and compare what becomes visible when cases, rather than processes, form the clusters."
      },
      {
        "id": "authoritarian-regimes",
        "via": [
          "revolutionary state",
          "new governing elite"
        ],
        "reason": "Examine how some states emerging from crisis and mass mobilization later concentrated coercive and political power."
      },
      {
        "id": "democracy-history",
        "via": [
          "constitution",
          "popular assemblies"
        ],
        "reason": "Trace how constitutions, assemblies, and political participation developed beyond revolutionary moments."
      }
    ]
  },
  "lenses": [
    {
      "id": "french-revolution-profile",
      "prompt": "Which concepts describe the French Revolution's fiscal and subsistence crises, political mobilization, and early institutional transformation?",
      "targets": [
        "fiscal crisis",
        "food shortage",
        "political exclusion",
        "popular assemblies",
        "abolition of privilege",
        "constitution"
      ],
      "explanation": "The French Revolution grew from a fiscal and political crisis intensified by food hardship, moved through representative and popular assemblies, abolished legal privileges, and repeatedly attempted to create constitutional government.",
      "reasons": {
        "fiscal crisis": "The monarchy's debt and inability to reform taxation helped force the calling of the Estates-General.",
        "food shortage": "Poor harvests and high bread prices sharpened popular distress and political unrest.",
        "political exclusion": "Legal privilege and unequal representation limited political power across estates and social groups.",
        "popular assemblies": "The Estates-General, National Assembly, sections, clubs, and crowds became arenas of revolutionary mobilization.",
        "abolition of privilege": "The August Decrees attacked feudal dues and legal privileges of the old order.",
        "constitution": "Revolutionary governments repeatedly tried to establish new constitutional arrangements."
      }
    },
    {
      "id": "haitian-revolution-profile",
      "prompt": "Which concepts describe the Haitian Revolution's racial and colonial exclusion, international war, slave uprising, emancipation, and state formation?",
      "targets": [
        "political exclusion",
        "imperial war",
        "slave uprising",
        "emancipation",
        "constitution",
        "new governing elite"
      ],
      "explanation": "The Haitian Revolution emerged from slavery and racial hierarchy in a colonial society, became entangled with wars among empires, achieved emancipation and independence, and produced new constitutional and governing orders.",
      "reasons": {
        "political exclusion": "Enslaved people and free people of color faced radically unequal legal and political status in Saint-Domingue.",
        "imperial war": "French, Spanish, and British conflict shaped alliances and military struggle in the colony.",
        "slave uprising": "The mass uprising that began in 1791 transformed the political possibilities of the revolution.",
        "emancipation": "The destruction of slavery became a defining achievement of the revolution.",
        "constitution": "Leaders drafted constitutional frameworks while negotiating autonomy, authority, and relations with France.",
        "new governing elite": "Military and political leaders built new institutions and hierarchies during and after the struggle for independence."
      }
    },
    {
      "id": "russian-revolution-profile",
      "prompt": "Which concepts describe the Russian Revolution's wartime crisis, party-led seizure of power, economic transformation, civil war, and new ruling order?",
      "targets": [
        "food shortage",
        "imperial war",
        "revolutionary party",
        "nationalization",
        "civil war",
        "new governing elite"
      ],
      "explanation": "World War I and acute shortages weakened the imperial state; the Bolshevik Party seized power, nationalized major assets, prevailed through civil war, and helped form a new political elite and state structure.",
      "reasons": {
        "food shortage": "Urban scarcity and failures in wartime supply intensified unrest in 1917.",
        "imperial war": "The costs and defeats of World War I destabilized the empire and provisional government.",
        "revolutionary party": "The Bolsheviks organized around a party capable of contesting and seizing state power.",
        "nationalization": "The revolutionary government transferred major banks, industries, and other assets into state ownership.",
        "civil war": "Armed conflict between Red, White, nationalist, peasant, and foreign forces shaped the emerging regime.",
        "new governing elite": "Party and state institutions elevated a new group of political and administrative leaders."
      }
    },
    {
      "id": "shared-revolutionary-patterns",
      "prompt": "Which concepts appeared in more than one of the French, Haitian, and Russian revolutionary profiles?",
      "targets": [
        "food shortage",
        "political exclusion",
        "imperial war",
        "constitution",
        "new governing elite"
      ],
      "explanation": "The profiles overlap without becoming identical: material hardship, exclusion, international war, constitutional experimentation, and the formation of new elites recur in different combinations and with very different meanings.",
      "reasons": {
        "food shortage": "Food hardship appears in the French and Russian profiles.",
        "political exclusion": "Political exclusion appears in the French and Haitian profiles, though the legal and racial structures were profoundly different.",
        "imperial war": "International and imperial warfare appears in the Haitian and Russian profiles.",
        "constitution": "Constitution-making appears in the French and Haitian profiles.",
        "new governing elite": "New ruling groups appear in the Haitian and Russian profiles."
      }
    },
    {
      "id": "new-political-order",
      "prompt": "Which concepts directly dismantle an old legal-economic order or construct a new governing one?",
      "targets": [
        "abolition of privilege",
        "emancipation",
        "land redistribution",
        "nationalization",
        "constitution",
        "revolutionary state"
      ],
      "explanation": "Revolutions transform institutions through legal abolition, emancipation, redistribution, changes in ownership, constitutional design, and the creation of a state able to enforce the new order.",
      "reasons": {
        "abolition of privilege": "It removes inherited legal distinctions and obligations from the old regime.",
        "emancipation": "It ends a status of legal bondage or subordination.",
        "land redistribution": "It changes who controls a central productive resource.",
        "nationalization": "It transfers assets or industries into state ownership.",
        "constitution": "It defines institutions, powers, rights, and procedures for a new political order.",
        "revolutionary state": "It gives organized authority to the revolution's institutional program."
      }
    }
  ],
  "clusters": [
    {
      "name": "Crisis of the old order",
      "color": "green",
      "fact": "Revolutionary situations often combine state weakness with hardship, exclusion, and war, but the balance among those pressures differs sharply from one society to another.",
      "terms": [
        "fiscal crisis",
        "food shortage",
        "political exclusion",
        "imperial war"
      ],
      "seeds": [
        "fiscal crisis",
        "food shortage"
      ],
      "termInfo": {
        "fiscal crisis": {
          "text": "A breakdown in a government's ability to raise revenue, service debt, or sustain expected spending.",
          "link": "wiki:Fiscal crisis"
        },
        "food shortage": {
          "text": "A condition in which available food is insufficient, inaccessible, or sharply more expensive for part of a population.",
          "link": "wiki:Food security"
        },
        "political exclusion": {
          "text": "The denial or severe restriction of participation, representation, rights, or public power to particular groups.",
          "link": "wiki:Political participation"
        },
        "imperial war": {
          "text": "War involving empires, colonies, or struggles for control across imperial boundaries.",
          "link": "wiki:Imperialism"
        }
      },
      "info": {
        "link": "wiki:Revolutionary situation"
      }
    },
    {
      "name": "Political mobilization",
      "color": "blue",
      "fact": "Ideas become revolutionary forces through communication, assembly, organization, and collective action rather than through dissatisfaction alone.",
      "terms": [
        "pamphlet networks",
        "popular assemblies",
        "slave uprising",
        "revolutionary party"
      ],
      "seeds": [
        "popular assemblies",
        "revolutionary party"
      ],
      "termInfo": {
        "pamphlet networks": {
          "text": "The production and circulation of short printed arguments through writers, printers, sellers, clubs, and readers.",
          "link": "wiki:Pamphlet"
        },
        "popular assemblies": {
          "text": "Gatherings in which citizens, workers, soldiers, or local communities debate, decide, petition, or organize collectively.",
          "link": "wiki:Popular assembly"
        },
        "slave uprising": {
          "text": "Collective armed or organized resistance by enslaved people against slavery and those enforcing it.",
          "link": "wiki:Slave rebellion"
        },
        "revolutionary party": {
          "text": "A political organization committed to taking or transforming state power through revolutionary change.",
          "link": "wiki:Political party"
        }
      },
      "info": {
        "link": "wiki:Collective action"
      }
    },
    {
      "name": "Social and institutional transformation",
      "color": "amber",
      "fact": "Revolutionary programs become concrete when they change legal status, property, landholding, institutions, and control over economic resources.",
      "terms": [
        "abolition of privilege",
        "emancipation",
        "land redistribution",
        "nationalization"
      ],
      "seeds": [
        "emancipation",
        "nationalization"
      ],
      "termInfo": {
        "abolition of privilege": {
          "text": "The removal of inherited legal exemptions, status rights, or feudal obligations attached to estates or social orders.",
          "link": "wiki:August Decrees"
        },
        "emancipation": {
          "text": "The legal liberation of a person or group from slavery, serfdom, or another subordinated status.",
          "link": "wiki:Emancipation"
        },
        "land redistribution": {
          "text": "The transfer or reallocation of land to change patterns of ownership, tenancy, or access.",
          "link": "wiki:Land reform"
        },
        "nationalization": {
          "text": "The transfer of privately owned assets or industries into public or state ownership.",
          "link": "wiki:Nationalization"
        }
      },
      "info": {
        "link": "wiki:Social revolution"
      }
    },
    {
      "name": "Consolidation and aftermath",
      "color": "rose",
      "fact": "After an old regime breaks, constitutions, armed resistance, civil conflict, and new elites shape which revolutionary aims survive and how power is institutionalized.",
      "terms": [
        "constitution",
        "counterrevolution",
        "civil war",
        "new governing elite"
      ],
      "seeds": [
        "constitution",
        "civil war"
      ],
      "termInfo": {
        "constitution": {
          "text": "A fundamental framework defining political institutions, powers, procedures, and often rights.",
          "link": "wiki:Constitution"
        },
        "counterrevolution": {
          "text": "Organized action intended to reverse, defeat, or substantially limit a revolution.",
          "link": "wiki:Counter-revolution"
        },
        "civil war": {
          "text": "Sustained armed conflict among organized groups within a state or former state.",
          "link": "wiki:Civil war"
        },
        "new governing elite": {
          "text": "A newly ascendant group that occupies influential political, military, or administrative positions after a transfer of power.",
          "link": "wiki:Political class"
        }
      },
      "info": {
        "link": "wiki:State-building"
      }
    }
  ],
  "bridges": [
    {
      "term": "legitimacy crisis",
      "clusters": [
        0,
        1
      ],
      "relationKind": "dynamic",
      "fact": "A legitimacy crisis connects structural breakdown with mobilization when existing rulers and institutions lose enough acceptance that alternatives become thinkable and collective action expands.",
      "idealTerms": [
        "political exclusion",
        "popular assemblies"
      ],
      "info": {
        "text": "A condition in which substantial groups no longer accept the rightfulness or authority of existing political institutions.",
        "link": "wiki:Legitimacy (political)"
      }
    },
    {
      "term": "mass politics",
      "clusters": [
        1,
        2
      ],
      "relationKind": "dynamic",
      "fact": "Mass politics connects mobilization with transformation because assemblies, movements, parties, and armed groups press demands that revolutionary institutions attempt to enact.",
      "info": {
        "text": "Political participation and organization involving large populations beyond a narrow governing elite.",
        "link": "wiki:Mass politics"
      }
    },
    {
      "term": "revolutionary state",
      "clusters": [
        2,
        3
      ],
      "relationKind": "dynamic",
      "fact": "A revolutionary state connects institutional transformation with consolidation by turning new laws, property arrangements, and political claims into enforceable administration and authority.",
      "idealTerms": [
        null,
        "constitution"
      ],
      "info": {
        "text": "A state whose institutions and legitimacy are reorganized through a revolution and tasked with defending or implementing its program.",
        "link": "wiki:Revolution"
      }
    }
  ]
};
