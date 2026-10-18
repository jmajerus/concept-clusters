// Generated from content/puzzles/excitation-contraction-coupling.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "excitation-contraction-coupling",
  "title": "Excitation–contraction coupling",
  "category": "physiology-medicine",
  "subcategories": {
    "physiology-medicine": "muscle"
  },
  "info": {
    "text": "Calcium carries the order from membrane to myosin: released by voltage in skeletal muscle, by calcium itself in the heart, and read through myosin rather than actin in smooth muscle.",
    "links": [
      {
        "href": "wiki:Muscle contraction"
      }
    ],
    "citations": [
      {
        "title": "Guyton and Hall Textbook of Medical Physiology, 14th ed., chapters 6–9",
        "author": "John E. Hall, Michael E. Hall",
        "publisher": "Elsevier",
        "year": "2021"
      },
      {
        "title": "Cardiac excitation–contraction coupling",
        "author": "Donald M. Bers",
        "publisher": "Nature 415:198–205",
        "year": "2002",
        "url": "https://pubmed.ncbi.nlm.nih.gov/11805843/"
      },
      {
        "title": "Smooth muscle contraction and relaxation",
        "author": "R. Clinton Webb",
        "publisher": "Advances in Physiology Education 27:201–206",
        "year": "2003",
        "url": "https://pubmed.ncbi.nlm.nih.gov/14627618/"
      },
      {
        "title": "Anatomy and Physiology 2e, §10.2 Skeletal Muscle",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-2-skeletal-muscle"
      },
      {
        "title": "Anatomy and Physiology 2e, §10.3 Muscle Fiber Contraction and Relaxation",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation"
      },
      {
        "title": "Anatomy and Physiology 2e, §10.8 Smooth Muscle",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-8-smooth-muscle"
      },
      {
        "title": "Anatomy and Physiology 2e, §19.2 Cardiac Muscle and Electrical Activity",
        "publisher": "OpenStax",
        "year": "2022",
        "url": "https://openstax.org/books/anatomy-and-physiology-2e/pages/19-2-cardiac-muscle-and-electrical-activity"
      }
    ]
  },
  "clusters": [
    {
      "id": "skeletal-calcium-release",
      "name": "Skeletal calcium release",
      "color": "teal",
      "fact": "The muscle action potential runs down the T tubules into the fiber's interior. At each triad, where a tubule meets two sacs of sarcoplasmic reticulum, voltage sensors in the tubule wall are physically linked to ryanodine receptors in the store, so depolarization pulls the release channels open and calcium floods the cytosol.",
      "terms": [
        "T tubules",
        "ryanodine receptors",
        "triad"
      ],
      "seeds": [
        "T tubules",
        "ryanodine receptors"
      ],
      "termInfo": {
        "T tubules": {
          "text": "Transverse tubules: inward folds of the cell membrane that carry the action potential deep into the fiber, close to every myofibril.",
          "links": [
            {
              "href": "wiki:T-tubule"
            }
          ]
        },
        "ryanodine receptors": {
          "text": "The calcium-release channels in the membrane of the sarcoplasmic reticulum. Skeletal muscle uses the RyR1 form, heart the RyR2 form.",
          "links": [
            {
              "href": "wiki:Ryanodine receptor"
            }
          ]
        },
        "triad": "One T tubule flanked by two terminal cisternae of the sarcoplasmic reticulum: the junction where the voltage sensor meets the release channel."
      },
      "info": {
        "text": "How a surface voltage change opens calcium stores deep inside a skeletal fiber.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-2-skeletal-muscle"
          }
        ]
      }
    },
    {
      "id": "thin-filament-switch",
      "name": "Thin-filament switch",
      "color": "blue",
      "fact": "At rest, tropomyosin lies along actin over the sites myosin needs. The troponin complex holds it there: troponin I binds actin, troponin T binds tropomyosin, and troponin C binds calcium. When calcium binds troponin C, the complex shifts and drags tropomyosin aside.",
      "terms": [
        "tropomyosin",
        "troponin C",
        "troponin I",
        "troponin T"
      ],
      "seeds": [
        "tropomyosin",
        "troponin C"
      ],
      "termInfo": {
        "tropomyosin": {
          "text": "A long rod lying in the groove of the actin filament, covering myosin's binding sites while the muscle rests.",
          "links": [
            {
              "href": "wiki:Tropomyosin"
            }
          ]
        },
        "troponin C": {
          "text": "The calcium-binding subunit of troponin; calcium binding here starts the shift that uncovers actin.",
          "links": [
            {
              "href": "wiki:Troponin C"
            }
          ]
        },
        "troponin I": {
          "text": "The inhibitory subunit, which binds actin and helps hold tropomyosin in its blocking position.",
          "links": [
            {
              "href": "wiki:Troponin I"
            }
          ]
        },
        "troponin T": {
          "text": "The subunit that binds the troponin complex to tropomyosin.",
          "links": [
            {
              "href": "wiki:Troponin T"
            }
          ]
        }
      },
      "info": {
        "text": "The calcium-operated latch on the actin filament of skeletal and cardiac muscle.",
        "links": [
          {
            "href": "wiki:Troponin"
          }
        ]
      }
    },
    {
      "id": "cross-bridge-cycle",
      "name": "Cross-bridge cycle",
      "color": "amber",
      "fact": "Each myosin head cycles: ATP binding releases it from actin, myosin ATPase splits the ATP and cocks the head, the cocked head binds actin, and phosphate release drives the power stroke. Without fresh ATP the head stays locked on actin in the rigor state.",
      "terms": [
        "power stroke",
        "myosin ATPase",
        "cocked myosin head",
        "cross-bridge detachment",
        "rigor state"
      ],
      "seeds": [
        "power stroke",
        "myosin ATPase"
      ],
      "termInfo": {
        "cocked myosin head": "Guyton's term for the head after ATP is split: ADP and phosphate stay bound and the head is set at a right angle, storing energy for the next pull.",
        "cross-bridge detachment": "The release of the myosin head from actin when a new ATP binds it.",
        "myosin ATPase": {
          "text": "The enzyme activity of the myosin head itself, splitting ATP into ADP and phosphate; its speed sets how fast a muscle can shorten.",
          "links": [
            {
              "href": "wiki:Myosin ATPase"
            }
          ]
        },
        "power stroke": {
          "text": "The head's pivot while bound to actin, pulling the thin filament toward the center of the sarcomere.",
          "links": [
            {
              "href": "wiki:Sliding filament theory"
            }
          ]
        },
        "rigor state": {
          "text": "Myosin bound tightly to actin with no ATP to release it; after death this produces rigor mortis.",
          "links": [
            {
              "href": "wiki:Rigor mortis"
            }
          ]
        }
      },
      "info": {
        "text": "The repeating attach–pull–release cycle of each myosin head.",
        "links": [
          {
            "href": "wiki:Sliding filament theory"
          }
        ]
      }
    },
    {
      "id": "relaxation-and-reloading",
      "name": "Relaxation and reloading",
      "color": "magenta",
      "fact": "Contraction ends when the signal and the calcium are removed. Acetylcholinesterase destroys acetylcholine at the neuromuscular junction, the SERCA pump spends ATP to drive calcium back into the sarcoplasmic reticulum, and calsequestrin binds that calcium inside the store so it can hold a large reserve for the next twitch.",
      "terms": [
        "SERCA pump",
        "acetylcholinesterase",
        "calsequestrin"
      ],
      "seeds": [
        "SERCA pump",
        "acetylcholinesterase"
      ],
      "termInfo": {
        "SERCA pump": {
          "text": "Sarco/endoplasmic reticulum Ca²⁺-ATPase, the calcium pump Guyton describes in the reticulum wall. Each cycle spends one ATP to move two calcium ions into the store. In the heart, phospholamban brakes it and sympathetic stimulation releases the brake.",
          "links": [
            {
              "href": "wiki:SERCA"
            }
          ]
        },
        "acetylcholinesterase": {
          "text": "The enzyme at the neuromuscular junction that splits acetylcholine within milliseconds, so one nerve impulse produces one muscle action potential.",
          "links": [
            {
              "href": "wiki:Acetylcholinesterase"
            }
          ]
        },
        "calsequestrin": {
          "text": "A calcium-binding protein inside the sarcoplasmic reticulum that holds stored calcium bound, letting the store keep many times more calcium than it could hold free.",
          "links": [
            {
              "href": "wiki:Calsequestrin"
            }
          ]
        }
      },
      "info": {
        "text": "Ending the signal and refilling the calcium store.",
        "links": [
          {
            "href": "wiki:SERCA"
          }
        ]
      }
    },
    {
      "id": "cardiac-trigger",
      "name": "Cardiac trigger",
      "color": "olive",
      "fact": "Cardiac muscle needs calcium from outside the cell to open its stores. During the action potential plateau, trigger calcium enters from the extracellular fluid and opens the ryanodine receptors. This calcium-induced calcium release is graded: more trigger calcium releases more stored calcium and strengthens the beat.",
      "terms": [
        "calcium-induced calcium release",
        "trigger calcium"
      ],
      "seeds": [
        "calcium-induced calcium release"
      ],
      "termInfo": {
        "calcium-induced calcium release": {
          "text": "Release of stored calcium through ryanodine receptors opened by a rise in nearby calcium, the heart's amplifier.",
          "links": [
            {
              "href": "wiki:Calcium-induced calcium release"
            }
          ]
        },
        "trigger calcium": "The small calcium current that enters a cardiac cell during the plateau of its action potential, much of it through the T tubules."
      },
      "info": {
        "text": "How heart muscle uses a small calcium entry to release a large calcium store.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/19-2-cardiac-muscle-and-electrical-activity"
          }
        ]
      }
    },
    {
      "id": "smooth-muscle-activation",
      "name": "Smooth-muscle activation",
      "color": "brown",
      "fact": "Smooth muscle has no troponin; its calcium switch acts on myosin. Calcium binds calmodulin, which activates myosin light-chain kinase to phosphorylate myosin and let its heads cycle; myosin phosphatase reverses that step. Actin filaments anchor to dense bodies, and hormones can trigger contraction without an action potential through pharmacomechanical coupling.",
      "terms": [
        "calmodulin",
        "myosin light-chain kinase",
        "myosin phosphatase",
        "dense bodies",
        "pharmacomechanical coupling"
      ],
      "seeds": [
        "calmodulin",
        "myosin light-chain kinase"
      ],
      "termInfo": {
        "calmodulin": {
          "text": "The calcium-binding protein smooth muscle uses in place of troponin; four calcium ions bind each molecule.",
          "links": [
            {
              "href": "wiki:Calmodulin"
            }
          ]
        },
        "dense bodies": "Anchor points in the cytoplasm and on the cell membrane where smooth muscle's actin filaments attach, playing the part of Z discs.",
        "myosin light-chain kinase": {
          "text": "MLCK: activated by calcium–calmodulin, it uses ATP to phosphorylate myosin's regulatory light chain, which lets the head cycle.",
          "links": [
            {
              "href": "wiki:Myosin light-chain kinase"
            }
          ]
        },
        "myosin phosphatase": {
          "text": "Removes the phosphate from myosin's light chain and stops cycling. Its activity can be raised or lowered by signals such as nitric oxide and Rho kinase, changing force at a given calcium level.",
          "links": [
            {
              "href": "wiki:Myosin-light-chain phosphatase"
            }
          ]
        },
        "pharmacomechanical coupling": "Contraction started by a hormone or transmitter acting on receptors, through second messengers that release calcium or sensitize the contractile machinery, with no action potential needed."
      },
      "info": {
        "text": "A calcium switch on the thick filament, in cells built for slow, sustained force.",
        "links": [
          {
            "href": "https://openstax.org/books/anatomy-and-physiology-2e/pages/10-8-smooth-muscle"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "dihydropyridine-receptors",
      "term": "dihydropyridine receptors",
      "clusters": [
        0,
        4
      ],
      "fact": "Dihydropyridine receptors are the voltage sensors in the T-tubule wall of both skeletal and cardiac muscle, used two ways. In skeletal muscle each is linked directly to a ryanodine receptor and opens it by changing shape; in cardiac muscle it works as a calcium channel, admitting the trigger calcium that opens ryanodine receptors chemically.",
      "info": {
        "text": "Also called L-type calcium channels: the Cav1.1 form in skeletal muscle, Cav1.2 in the heart.",
        "links": [
          {
            "href": "wiki:L-type calcium channel"
          }
        ]
      },
      "relationKind": "contrast",
      "idealTerms": [
        "ryanodine receptors",
        "trigger calcium"
      ]
    },
    {
      "id": "calcium-transient",
      "term": "calcium transient",
      "clusters": [
        0,
        1
      ],
      "fact": "The calcium transient is the brief rise in cytosolic calcium after each action potential: calcium released through the ryanodine receptors reaches troponin C and moves tropomyosin. Contraction lasts as long as the transient does.",
      "info": "The rise and fall of free calcium in the cytosol over one twitch or beat.",
      "relationKind": "dynamic",
      "idealTerms": [
        "ryanodine receptors",
        "troponin C"
      ],
      "direction": {
        "kind": "through",
        "from": 0,
        "to": 1
      }
    },
    {
      "id": "myosin-binding-sites",
      "term": "myosin-binding sites",
      "clusters": [
        1,
        2
      ],
      "fact": "Myosin-binding sites on actin are what the thin-filament switch controls: covered by tropomyosin at rest, exposed when calcium binds troponin C. A myosin head can make its power stroke only after binding an exposed site.",
      "info": "Guyton calls them the active sites of the actin filament.",
      "relationKind": "foundation",
      "idealTerms": [
        "tropomyosin",
        "power stroke"
      ],
      "direction": {
        "kind": "through",
        "from": 1,
        "to": 2
      }
    },
    {
      "id": "sodium-calcium-exchanger",
      "term": "sodium–calcium exchanger",
      "clusters": [
        4,
        3
      ],
      "fact": "Calcium that enters a cardiac cell as trigger calcium must leave again every beat. The sodium–calcium exchanger carries it out, letting three sodium ions in for each calcium ion it pushes out, while the SERCA pump returns the rest of the released calcium to the sarcoplasmic reticulum.",
      "info": {
        "text": "NCX: in human ventricle it removes roughly a quarter of each beat's calcium, the SERCA pump most of the rest.",
        "links": [
          {
            "href": "wiki:Sodium-calcium exchanger"
          }
        ]
      },
      "relationKind": "continuity",
      "idealTerms": [
        "trigger calcium",
        "SERCA pump"
      ],
      "direction": {
        "kind": "through",
        "from": 4,
        "to": 3
      }
    },
    {
      "id": "latch-state",
      "term": "latch state",
      "clusters": [
        2,
        5
      ],
      "fact": "In the latch state, smooth-muscle myosin heads dephosphorylated by myosin phosphatase while still attached to actin detach very slowly. The cross-bridge cycle slows almost to a stop, so tension holds for long periods with little ATP spent, keeping vessels and sphincters toned cheaply.",
      "info": "Guyton calls it the latch mechanism.",
      "relationKind": "contrast",
      "idealTerms": [
        "cross-bridge detachment",
        "myosin phosphatase"
      ]
    }
  ],
  "lenses": [
    {
      "id": "surface-to-store",
      "prompt": "Which concepts carry a skeletal fiber's electrical signal from its surface to the ryanodine receptors?",
      "explanation": "The tubules take the action potential inward, the triad brings tubule and store together, and the dihydropyridine receptor senses the voltage and pulls the release channel open. The calcium transient comes after the channels open.",
      "targets": [
        "T tubules",
        "triad",
        "dihydropyridine receptors"
      ],
      "reasons": {
        "T tubules": "They conduct the action potential from the surface into the fiber's depth.",
        "dihydropyridine receptors": "They sense the depolarization and, linked to the ryanodine receptors, open them.",
        "triad": "It is the junction where each tubule lies against the store's release channels."
      }
    },
    {
      "id": "malignant-hyperthermia",
      "prompt": "In malignant hyperthermia, certain anesthetics hold mutant release channels open. Which two concepts carry that fault to the contractile machinery?",
      "explanation": "A mutation in the skeletal ryanodine receptor lets anesthetic gases keep it open, so the calcium transient never ends: muscles stay contracted and burn ATP, generating heat. Dantrolene treats it by blocking the receptor.",
      "targets": [
        "ryanodine receptors",
        "calcium transient"
      ],
      "reasons": {
        "calcium transient": "With the channel stuck open, the calcium rise is sustained instead of brief.",
        "ryanodine receptors": "The mutant channel is the release channel that stays open."
      }
    },
    {
      "id": "storing-calcium",
      "prompt": "Which protein lets the sarcoplasmic reticulum store far more calcium than it could hold free?",
      "explanation": "Calsequestrin binds calcium inside the store, keeping free calcium there low so the SERCA pump can keep loading it. The SERCA pump moves calcium in; calsequestrin is what lets the store hold so much.",
      "targets": [
        "calsequestrin"
      ],
      "reasons": {
        "calsequestrin": "It binds stored calcium, multiplying the store's capacity."
      }
    },
    {
      "id": "troponin-anchors",
      "prompt": "Which troponin subunits bind the complex to the thin filament's other proteins instead of to calcium?",
      "explanation": "Troponin I grips actin and troponin T grips tropomyosin; troponin C is the calcium sensor between them.",
      "targets": [
        "troponin I",
        "troponin T"
      ],
      "reasons": {
        "troponin I": "It binds actin and helps hold the blocking position.",
        "troponin T": "It binds the complex to tropomyosin."
      }
    },
    {
      "id": "what-calcium-uncovers",
      "prompt": "When calcium binds troponin C and tropomyosin shifts, what does the shift expose?",
      "explanation": "Tropomyosin's move uncovers the sites on actin where myosin heads attach, which is the step the switch exists to control.",
      "targets": [
        "myosin-binding sites"
      ],
      "reasons": {
        "myosin-binding sites": "They are covered at rest and exposed by the shift."
      }
    },
    {
      "id": "phosphate-release",
      "prompt": "Which step of the cycle does phosphate release from the bound myosin head drive?",
      "explanation": "Once the cocked head binds actin, releasing phosphate lets it pivot and pull the thin filament; ADP leaves afterward.",
      "targets": [
        "power stroke"
      ],
      "reasons": {
        "power stroke": "The pivot that pulls actin follows phosphate release."
      }
    },
    {
      "id": "fresh-atp",
      "prompt": "What happens when a fresh ATP binds a myosin head that is attached to actin?",
      "explanation": "ATP binding lowers myosin's affinity for actin and frees the head. Splitting that ATP comes next, and it re-cocks the head.",
      "targets": [
        "cross-bridge detachment"
      ],
      "reasons": {
        "cross-bridge detachment": "ATP binding is what releases the head from actin."
      }
    },
    {
      "id": "stored-energy",
      "prompt": "Which state holds the energy from splitting ATP, ready for the next pull?",
      "explanation": "Hydrolysis happens before the head rebinds; the energy is held in the head's cocked position until the power stroke spends it.",
      "targets": [
        "cocked myosin head"
      ],
      "reasons": {
        "cocked myosin head": "ADP and phosphate stay bound and the head is set to pull."
      }
    },
    {
      "id": "back-to-rest",
      "prompt": "Once its motor neuron falls silent, which concepts return a skeletal fiber to rest?",
      "explanation": "Acetylcholinesterase ends the signal at the junction, the SERCA pump clears calcium from the cytosol, and tropomyosin slides back over actin as calcium leaves troponin C. Calsequestrin holds calcium already in the store but does not lower cytosolic calcium itself.",
      "targets": [
        "acetylcholinesterase",
        "SERCA pump",
        "tropomyosin"
      ],
      "reasons": {
        "SERCA pump": "It pumps calcium back into the store, ending the calcium transient.",
        "acetylcholinesterase": "It destroys acetylcholine, so no new action potentials start.",
        "tropomyosin": "It re-covers actin's binding sites once calcium falls."
      }
    },
    {
      "id": "outside-calcium",
      "prompt": "Remove calcium from the fluid around the cells, and the heart soon stops contracting while skeletal muscle keeps working. Which concepts explain the difference?",
      "explanation": "Skeletal dihydropyridine receptors open the store mechanically and need no outside calcium. In the heart the same receptors act as channels: the trigger calcium they admit is what opens the store, so without it there is no calcium-induced calcium release. Ryanodine receptors serve both muscles and do not explain the difference.",
      "targets": [
        "dihydropyridine receptors",
        "trigger calcium",
        "calcium-induced calcium release"
      ],
      "reasons": {
        "calcium-induced calcium release": "The heart's store opens only in response to that trigger.",
        "dihydropyridine receptors": "Their role differs: mechanical link in skeletal muscle, calcium channel in the heart.",
        "trigger calcium": "It must come from outside the cell, so removing outside calcium removes it."
      }
    },
    {
      "id": "clearing-cardiac-calcium",
      "prompt": "Which transporters lower cytosolic calcium after each heartbeat?",
      "explanation": "The SERCA pump returns most of the calcium to the sarcoplasmic reticulum, and the exchanger sends the rest, about as much as entered, out of the cell. Calsequestrin binds calcium inside the store; it does not move calcium across a membrane.",
      "targets": [
        "SERCA pump",
        "sodium–calcium exchanger"
      ],
      "reasons": {
        "SERCA pump": "It pumps calcium back into the store.",
        "sodium–calcium exchanger": "It carries calcium out across the cell membrane."
      }
    },
    {
      "id": "smooth-switch",
      "prompt": "In smooth muscle, which proteins turn a rise in calcium into phosphorylated myosin?",
      "explanation": "Calcium binds calmodulin, and the calcium–calmodulin complex activates the kinase that phosphorylates myosin's light chain. Myosin phosphatase works in the opposite direction.",
      "targets": [
        "calmodulin",
        "myosin light-chain kinase"
      ],
      "reasons": {
        "calmodulin": "It binds the calcium.",
        "myosin light-chain kinase": "Activated by calmodulin, it phosphorylates myosin."
      }
    },
    {
      "id": "relax-at-high-calcium",
      "prompt": "Which enzyme can relax smooth muscle even while its calcium stays high?",
      "explanation": "Force depends on the balance between phosphorylating and dephosphorylating myosin. Raising phosphatase activity, as nitric oxide does through cGMP, relaxes the cell without lowering calcium.",
      "targets": [
        "myosin phosphatase"
      ],
      "reasons": {
        "myosin phosphatase": "It removes myosin's phosphate, stopping cycling regardless of calcium."
      }
    },
    {
      "id": "no-action-potential",
      "prompt": "Which concept names a hormone contracting smooth muscle with no action potential?",
      "explanation": "Receptor-activated second messengers, such as IP₃, release stored calcium or sensitize myosin without any change in membrane voltage being needed.",
      "targets": [
        "pharmacomechanical coupling"
      ],
      "reasons": {
        "pharmacomechanical coupling": "Contraction driven by receptor signaling rather than by depolarization."
      }
    },
    {
      "id": "z-disc-stand-in",
      "prompt": "Which structures anchor smooth muscle's actin filaments, as Z discs do in skeletal muscle?",
      "explanation": "Dense bodies in the cytoplasm and on the membrane hold actin filaments, so contraction pulls the cell's surface inward from many points.",
      "targets": [
        "dense bodies"
      ],
      "reasons": {
        "dense bodies": "They are the anchor points for smooth muscle's thin filaments."
      }
    },
    {
      "id": "calcium-sensors",
      "prompt": "Which proteins sense the calcium rise that starts contraction?",
      "explanation": "Striated muscle reads calcium on the actin filament through troponin C; smooth muscle reads it through calmodulin and then acts on myosin. Calsequestrin also binds calcium, but only to store it.",
      "targets": [
        "troponin C",
        "calmodulin"
      ],
      "reasons": {
        "calmodulin": "The calcium sensor of smooth muscle.",
        "troponin C": "The calcium sensor of skeletal and cardiac muscle."
      }
    },
    {
      "id": "atp-spenders",
      "prompt": "Which enzymes or pumps spend ATP during a cycle of contraction and relaxation?",
      "explanation": "Myosin splits ATP to power cross-bridges, the SERCA pump spends it to reload calcium, and the kinase uses it to phosphorylate smooth-muscle myosin. The sodium–calcium exchanger runs on the sodium gradient instead.",
      "targets": [
        "myosin ATPase",
        "SERCA pump",
        "myosin light-chain kinase"
      ],
      "reasons": {
        "SERCA pump": "One ATP for every two calcium ions moved into the store.",
        "myosin ATPase": "One ATP per cross-bridge cycle.",
        "myosin light-chain kinase": "It transfers phosphate from ATP onto myosin."
      }
    },
    {
      "id": "attached-cheaply",
      "prompt": "Which states keep myosin heads attached to actin while spending little or no ATP?",
      "explanation": "In rigor the head cannot let go because no ATP is left to release it. In the latch state smooth-muscle heads hang on deliberately, detaching slowly, so tone is held at low cost.",
      "targets": [
        "rigor state",
        "latch state"
      ],
      "reasons": {
        "latch state": "Dephosphorylated heads detach very slowly, holding tension cheaply.",
        "rigor state": "No ATP means no detachment."
      }
    }
  ],
  "relatedPuzzles": {
    "entries": [
      {
        "id": "muscular-system",
        "reason": "Start with the overview of the muscle fiber, its nerve command, fiber types, and fuel before the calcium details here."
      },
      {
        "id": "rhythmic-excitation-of-the-heart",
        "reason": "See the cardiac action potential whose plateau admits the trigger calcium.",
        "via": [
          "trigger calcium"
        ]
      },
      {
        "id": "membranes-set-cell-conditions",
        "reason": "See the calcium pump and the sodium–calcium exchanger as transporters, and where the sodium gradient comes from.",
        "via": [
          "SERCA pump",
          "sodium–calcium exchanger"
        ]
      },
      {
        "id": "gastrointestinal-motility",
        "reason": "See the electrical rhythm that sets when gut smooth muscle contracts."
      }
    ]
  },
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Calcium carries the order",
    "summary": "How an action potential becomes myosin pulling on actin, and how skeletal, cardiac, and smooth muscle each release and read calcium.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "Every contraction starts as an electrical change at the cell surface and ends with myosin pulling on actin. Excitation–contraction coupling is the chain between those two events, and calcium is the messenger at its center. Skeletal, cardiac, and smooth muscle all use calcium, but they release it and read it in different ways, and those differences explain much of how each kind of muscle behaves.\r\n\r\n## Releasing calcium in skeletal muscle\r\n\r\nA skeletal fiber is too thick for a signal at its surface to reach its center quickly. **T tubules** (transverse tubules) solve this: they are inward folds of the cell membrane that carry the action potential deep into the fiber. Each tubule runs between two sacs of the sarcoplasmic reticulum, the fiber's calcium store, forming a **triad**.\r\n\r\nAt the triad, voltage sensors in the tubule wall called **dihydropyridine receptors** sit directly against the store's release channels, the **ryanodine receptors**. When the action potential arrives, the sensors change shape and pull the release channels open. Calcium pours into the cytosol, producing the **calcium transient**: a brief rise in free calcium that lasts as long as the contraction does. In malignant hyperthermia, a mutant ryanodine receptor stays open in response to certain anesthetics, the transient never ends, and the muscles stay contracted and generate dangerous heat.\r\n\r\n## The thin-filament switch\r\n\r\nAt rest, myosin cannot grip actin because **tropomyosin**, a long protein lying along the actin filament, covers the **myosin-binding sites** (Guyton's active sites). The troponin complex holds it in place. **Troponin I** binds actin, **troponin T** binds tropomyosin, and **troponin C** binds calcium. When calcium binds troponin C, the complex changes shape and drags tropomyosin aside, exposing the sites.\r\n\r\n## The cross-bridge cycle\r\n\r\nEach myosin head then works through a repeating cycle. A fresh ATP binding the head causes **cross-bridge detachment** from actin. The head's own enzyme activity, **myosin ATPase**, splits that ATP; ADP and phosphate stay bound, and the head is left as a **cocked myosin head**, storing the energy for one pull. The cocked head binds an exposed site, phosphate is released, and the head pivots in the **power stroke**, pulling the thin filament along. If no new ATP arrives, the head stays locked onto actin in the **rigor state**; this is why muscles stiffen after death in rigor mortis.\r\n\r\n## Relaxation and reloading\r\n\r\nRelaxation needs both the signal and the calcium removed. **Acetylcholinesterase** at the neuromuscular junction destroys acetylcholine within milliseconds, so new action potentials stop. The **SERCA pump** in the reticulum wall spends ATP to drive calcium back into the store, and as calcium leaves troponin C, tropomyosin slides back over actin. Inside the store, **calsequestrin** binds the returning calcium, which lets the reticulum hold a large reserve for the next twitch.\r\n\r\n## The heart: calcium-induced calcium release\r\n\r\nCardiac muscle has the same tubules, sensors, release channels, and troponin switch, but its sensors are not mechanically linked to its release channels. During the long plateau of the cardiac action potential, the dihydropyridine receptors act as calcium channels and admit **trigger calcium** from the fluid outside the cell. That calcium opens the ryanodine receptors: **calcium-induced calcium release**. The release is graded, so more trigger calcium releases more stored calcium and produces a stronger beat. It also means the heart, unlike skeletal muscle, depends on calcium outside its cells to contract.\r\n\r\nWhat comes in must go out. Each beat, the **sodium–calcium exchanger** carries calcium out of the cell, letting three sodium ions in for each calcium ion it removes, while the SERCA pump returns the rest to the store.\r\n\r\n## Smooth muscle: a switch on myosin\r\n\r\nSmooth muscle has no troponin. Its calcium, from outside the cell and from its smaller reticulum, binds **calmodulin**. The calcium–calmodulin complex activates **myosin light-chain kinase**, which uses ATP to phosphorylate part of the myosin head and so lets it cycle. **Myosin phosphatase** removes that phosphate. The balance between the two enzymes sets force, so signals that change phosphatase activity, such as nitric oxide, can relax smooth muscle without lowering its calcium.\r\n\r\nWhen myosin is dephosphorylated while still attached, the heads let go very slowly. In this **latch state** smooth muscle holds tension for long periods at little ATP cost, which suits blood vessels and sphincters that must stay partly contracted all day. Smooth muscle's actin filaments anchor to **dense bodies** instead of Z discs. Many smooth muscles can also contract without any action potential: hormones and transmitters acting on receptors release calcium or sensitize the contractile machinery through second messengers, a route called **pharmacomechanical coupling**."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "Claude (Opus 5.5)",
        "model": "Claude Opus 5.5",
        "reasoning": "medium"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "excitation-contraction-coupling",
      "puzzleRevision": "fnv1a32:ce72084d",
      "board": {
        "width": 1190,
        "height": 770
      },
      "nodes": {
        "term:T tubules": {
          "x": 385.19,
          "y": 37
        },
        "term:ryanodine receptors": {
          "x": 645.32,
          "y": 182.68
        },
        "term:triad": {
          "x": 561.98,
          "y": 35.01
        },
        "term:tropomyosin": {
          "x": 758.78,
          "y": 273.72
        },
        "term:troponin C": {
          "x": 911.28,
          "y": 53.87
        },
        "term:troponin I": {
          "x": 1014.49,
          "y": 103.3
        },
        "term:troponin T": {
          "x": 1045.02,
          "y": 213.86
        },
        "term:power stroke": {
          "x": 998.08,
          "y": 305.88
        },
        "term:myosin ATPase": {
          "x": 1107.54,
          "y": 378.38
        },
        "term:cocked myosin head": {
          "x": 1088.3,
          "y": 588.72
        },
        "term:cross-bridge detachment": {
          "x": 837.67,
          "y": 541.54
        },
        "term:rigor state": {
          "x": 960.16,
          "y": 639.66
        },
        "term:SERCA pump": {
          "x": 323.41,
          "y": 265.13
        },
        "term:acetylcholinesterase": {
          "x": 152.31,
          "y": 250.87
        },
        "term:calsequestrin": {
          "x": 182.82,
          "y": 68.08
        },
        "term:calcium-induced calcium release": {
          "x": 173.67,
          "y": 638.62
        },
        "term:trigger calcium": {
          "x": 343.4,
          "y": 450.63
        },
        "term:calmodulin": {
          "x": 897.74,
          "y": 733
        },
        "term:myosin light-chain kinase": {
          "x": 736,
          "y": 733
        },
        "term:myosin phosphatase": {
          "x": 605.68,
          "y": 464.17
        },
        "term:dense bodies": {
          "x": 565.98,
          "y": 726.55
        },
        "term:pharmacomechanical coupling": {
          "x": 390.39,
          "y": 733
        },
        "term:dihydropyridine receptors": {
          "x": 533.76,
          "y": 308.96
        },
        "term:calcium transient": {
          "x": 748.83,
          "y": 55.92
        },
        "term:myosin-binding sites": {
          "x": 847.72,
          "y": 384.93
        },
        "term:sodium–calcium exchanger": {
          "x": 154.19,
          "y": 374.85
        },
        "term:latch state": {
          "x": 672.82,
          "y": 573.47
        },
        "cluster:0": {
          "x": 517.56,
          "y": 103.24
        },
        "cluster:1": {
          "x": 864.81,
          "y": 192.71
        },
        "cluster:2": {
          "x": 1008.63,
          "y": 470.3
        },
        "cluster:3": {
          "x": 321.83,
          "y": 163.38
        },
        "cluster:4": {
          "x": 250.46,
          "y": 559.7
        },
        "cluster:5": {
          "x": 461.12,
          "y": 562.17
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-17T08:15:28.935Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "excitation-contraction-coupling",
      "puzzleRevision": "fnv1a32:ce72084d",
      "board": {
        "width": 1190,
        "height": 770
      },
      "nodes": {
        "term:T tubules": {
          "x": 492.3,
          "y": 107.97,
          "pinned": true
        },
        "term:ryanodine receptors": {
          "x": 602.55,
          "y": 43.02,
          "pinned": false
        },
        "term:triad": {
          "x": 378.06,
          "y": 41.92,
          "pinned": true
        },
        "term:tropomyosin": {
          "x": 914.83,
          "y": 185.15,
          "pinned": false
        },
        "term:troponin C": {
          "x": 805.36,
          "y": 250.07,
          "pinned": true
        },
        "term:troponin I": {
          "x": 947.27,
          "y": 83.47,
          "pinned": true
        },
        "term:troponin T": {
          "x": 1044.34,
          "y": 234.01,
          "pinned": true
        },
        "term:power stroke": {
          "x": 907.06,
          "y": 487.98,
          "pinned": false
        },
        "term:myosin ATPase": {
          "x": 1059.24,
          "y": 550.48,
          "pinned": true
        },
        "term:cocked myosin head": {
          "x": 992.33,
          "y": 662.96,
          "pinned": true
        },
        "term:cross-bridge detachment": {
          "x": 780.19,
          "y": 658.43,
          "pinned": true
        },
        "term:rigor state": {
          "x": 767.82,
          "y": 553.7,
          "pinned": true
        },
        "term:SERCA pump": {
          "x": 333.27,
          "y": 202.06,
          "pinned": true
        },
        "term:acetylcholinesterase": {
          "x": 215.45,
          "y": 266.02,
          "pinned": true
        },
        "term:calsequestrin": {
          "x": 216.71,
          "y": 123.62,
          "pinned": true
        },
        "term:calcium-induced calcium release": {
          "x": 587.01,
          "y": 484.24,
          "pinned": true
        },
        "term:trigger calcium": {
          "x": 606.49,
          "y": 402.66,
          "pinned": true
        },
        "term:calmodulin": {
          "x": 118.45,
          "y": 515.68,
          "pinned": true
        },
        "term:myosin light-chain kinase": {
          "x": 115.81,
          "y": 662.74,
          "pinned": true
        },
        "term:myosin phosphatase": {
          "x": 293.2,
          "y": 466.58,
          "pinned": true
        },
        "term:dense bodies": {
          "x": 112.38,
          "y": 406.08,
          "pinned": true
        },
        "term:pharmacomechanical coupling": {
          "x": 266.36,
          "y": 572.57,
          "pinned": true
        },
        "term:dihydropyridine receptors": {
          "x": 614.92,
          "y": 222.91,
          "pinned": true
        },
        "term:calcium transient": {
          "x": 775.68,
          "y": 128.49,
          "pinned": true
        },
        "term:myosin-binding sites": {
          "x": 910.09,
          "y": 363.67,
          "pinned": true
        },
        "term:sodium–calcium exchanger": {
          "x": 450.42,
          "y": 311.6,
          "pinned": true
        },
        "term:latch state": {
          "x": 494.19,
          "y": 629.22,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 4882.66,
        "score": 4882.660426485005
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T08:20:27.619Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "excitation-contraction-coupling",
      "puzzleRevision": "fnv1a32:ce72084d",
      "board": {
        "width": 1190,
        "height": 770
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 595,
          "y": 166.8,
          "pinned": false
        },
        "cluster:1": {
          "x": 1009.97,
          "y": 182.31,
          "pinned": true
        },
        "cluster:2": {
          "x": 1009.97,
          "y": 590.74,
          "pinned": true
        },
        "cluster:3": {
          "x": 251.44,
          "y": 611.23,
          "pinned": true
        },
        "cluster:4": {
          "x": 184.82,
          "y": 305.16,
          "pinned": true
        },
        "cluster:5": {
          "x": 620.09,
          "y": 601.96,
          "pinned": true
        }
      },
      "bridges": {
        "term:dihydropyridine receptors": {
          "x": 377.91,
          "y": 99.43,
          "pinned": true
        },
        "term:calcium transient": {
          "x": 795.59,
          "y": 97.62,
          "pinned": true
        },
        "term:myosin-binding sites": {
          "x": 904.11,
          "y": 367.65,
          "pinned": true
        },
        "term:sodium–calcium exchanger": {
          "x": 413.58,
          "y": 449.02,
          "pinned": true
        },
        "term:latch state": {
          "x": 803.89,
          "y": 476.86,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "T tubules",
          "ryanodine receptors",
          "triad"
        ],
        "cluster:1": [
          "tropomyosin",
          "troponin C",
          "troponin I",
          "troponin T"
        ],
        "cluster:2": [
          "power stroke",
          "myosin ATPase",
          "cocked myosin head",
          "cross-bridge detachment",
          "rigor state"
        ],
        "cluster:3": [
          "SERCA pump",
          "acetylcholinesterase",
          "calsequestrin"
        ],
        "cluster:4": [
          "calcium-induced calcium release",
          "trigger calcium"
        ],
        "cluster:5": [
          "calmodulin",
          "myosin light-chain kinase",
          "myosin phosphatase",
          "dense bodies",
          "pharmacomechanical coupling"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "T tubules",
          "ryanodine receptors",
          "triad"
        ],
        "cluster:1": [
          "troponin C",
          "troponin I",
          "tropomyosin",
          "troponin T"
        ],
        "cluster:2": [
          "power stroke",
          "cross-bridge detachment",
          "cocked myosin head",
          "myosin ATPase",
          "rigor state"
        ],
        "cluster:3": [
          "SERCA pump",
          "acetylcholinesterase",
          "calsequestrin"
        ],
        "cluster:4": [
          "trigger calcium",
          "calcium-induced calcium release"
        ],
        "cluster:5": [
          "dense bodies",
          "myosin phosphatase",
          "pharmacomechanical coupling",
          "myosin light-chain kinase",
          "calmodulin"
        ]
      },
      "metrics": {
        "hardOverlaps": 0,
        "circleOverlaps": 0,
        "headingOverlaps": 0,
        "bridgeCircleOverlaps": 0,
        "bridgeHeadingOverlaps": 0,
        "bridgeBridgeOverlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "lineHeadingIntersections": 0,
        "lineCircleIntersections": 0,
        "totalLength": 1715.6211081966148
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-17T08:20:03.803Z"
    }
  },
  "board": {
    "sizeFactor": 1.2,
    "source": "author",
    "savedAt": "2026-10-17T08:14:21.348Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
