// Generated from content/puzzles/infection-syndromes-bedside.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "infection-syndromes-bedside",
  "title": "Where the Infection Lives — Four Bedside Syndromes",
  "category": "medicine",
  "subcategories": {
    "medicine": "infectious-disease"
  },
  "info": {
    "text": "Infectious disease reasons from the body site: where an infection lives predicts which organisms arrive, which test confirms it, and what the first dose of antibiotics covers. This board walks four bedside syndromes — lung, meninges, urinary tract, and heart valves — and the shared organism doors between them.",
    "citations": [
      {
        "title": "Community-acquired pneumonia",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Community-acquired_pneumonia"
      },
      {
        "title": "Meningitis (bacterial section)",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Meningitis"
      },
      {
        "title": "Urinary tract infection",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Urinary_tract_infection"
      },
      {
        "title": "Infective endocarditis",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Infective_endocarditis"
      }
    ]
  },
  "clusters": [
    {
      "id": "pneumonia",
      "name": "Community-acquired pneumonia — the lung parenchyma",
      "color": "teal",
      "fact": "Infection in the alveoli shows up as cough and fever, crackles with dull percussion, lobar consolidation on film, and a first dose that covers both the pneumococcus and the atypicals.",
      "terms": [
        "Lobar consolidation on chest X-ray",
        "Beta-lactam plus macrolide",
        "Atypicals: Mycoplasma and Legionella",
        "Crackles and dullness to percussion"
      ],
      "seeds": [
        "Lobar consolidation on chest X-ray",
        "Beta-lactam plus macrolide"
      ],
      "termInfo": {
        "Atypicals: Mycoplasma and Legionella": "So-called because penicillins miss them — Mycoplasma has no cell wall and Legionella grows inside cells; the reason the first dose pairs a beta-lactam with a macrolide.",
        "Beta-lactam plus macrolide": "Guideline empirics for CAP: a beta-lactam such as amoxicillin for the pneumococcus plus a macrolide such as azithromycin or clarithromycin for the atypicals.",
        "Crackles and dullness to percussion": "Consolidated lung transmits sound differently: crackles on auscultation, dull non-resonant percussion, and increased transmission of whispered voice.",
        "Lobar consolidation on chest X-ray": "A whole lobe turns white as alveoli fill with fluid and pus — the classic CAP pattern rather than a diffuse infiltrate."
      },
      "info": {
        "text": "Acute infection of the lung parenchyma acquired outside hospital; the most common bacterial cause is the pneumococcus.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Community-acquired_pneumonia",
            "label": "Community-acquired pneumonia"
          }
        ]
      }
    },
    {
      "id": "meningitis",
      "name": "Bacterial meningitis — the meninges",
      "color": "blue",
      "fact": "Infection of the meningeal space announces itself with fever, neck stiffness, and confusion, meningeal signs, a non-blanching rash when the meningococcus invades, CSF full of neutrophils with low glucose — and immediate empiric cephalosporin, vancomycin, and dexamethasone.",
      "terms": [
        "Neisseria meningitidis",
        "Non-blanching petechial rash",
        "Kernig and Brudzinski signs",
        "CSF neutrophils with low glucose",
        "Ceftriaxone, vancomycin, dexamethasone"
      ],
      "seeds": [
        "Neisseria meningitidis",
        "Non-blanching petechial rash"
      ],
      "termInfo": {
        "Ceftriaxone, vancomycin, dexamethasone": "Immediate empirics: a third-generation cephalosporin, vancomycin added (US practice) for cephalosporin-resistant pneumococcus, and dexamethasone just before the first dose — benefit shown mainly in pneumococcal disease.",
        "CSF neutrophils with low glucose": "Bacterial CSF: cloudy, opening pressure elevated, neutrophils often above 300/mm³, CSF-to-blood glucose ratio of 0.4 or less, protein high.",
        "Kernig and Brudzinski signs": "Meningeal irritation tests: pain limits passive knee extension with the hip flexed (Kernig); neck flexion provokes involuntary hip and knee flexion (Brudzinski). Present in few cases but highly specific.",
        "Neisseria meningitidis": "The meningococcus: colonizes the nasopharynx, invades the bloodstream, and causes meningitis with its characteristic rash; with the pneumococcus it causes 80% of adult cases.",
        "Non-blanching petechial rash": "A rapidly spreading petechial, non-blanching rash — relatively specific for meningococcal disease and possible before other symptoms."
      },
      "info": {
        "text": "Bacterial infection of the protective membranes; a medical emergency measured in hours.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Meningitis",
            "label": "Meningitis — bacterial"
          }
        ]
      }
    },
    {
      "id": "uti",
      "name": "Urinary tract infection — the urothelium",
      "color": "amber",
      "fact": "Infection of the urinary tract is mostly uropathogenic E. coli ascending a short urethra: dysuria and frequency without systemic signs for cystitis, flank pain with fever once it reaches the kidney, a positive dipstick, and nitrofurantoin for uncomplicated cystitis.",
      "terms": [
        "Escherichia coli (uropathogenic)",
        "Dysuria and urinary frequency",
        "Flank pain with fever (pyelonephritis)",
        "Nitrites and leukocyte esterase",
        "Nitrofurantoin"
      ],
      "seeds": [
        "Escherichia coli (uropathogenic)",
        "Dysuria and urinary frequency"
      ],
      "termInfo": {
        "Dysuria and urinary frequency": "Cystitis: burning with urination, urgency, and suprapubic pain without systemic upset; in healthy young women, symptoms alone can make the diagnosis.",
        "Escherichia coli (uropathogenic)": "Gut flora ascending a short urethra: uropathogenic E. coli causes about 75% of uncomplicated UTIs (65% of complicated ones).",
        "Flank pain with fever (pyelonephritis)": "Upper-tract infection: the same dysuria plus flank pain, fever, and nausea — systemic signs that change the therapy and the setting.",
        "Nitrites and leukocyte esterase": "Dipstick clues: leukocyte esterase marks white cells; nitrites appear when gram-negative organisms reduce nitrate. A negative test does not exclude a UTI.",
        "Nitrofurantoin": "First-line for uncomplicated cystitis over 3–5 days; pivmecillinam and single-dose fosfomycin are alternatives; trimethoprim-sulfamethoxazole only where local E. coli resistance is low."
      },
      "info": {
        "text": "Infection anywhere along the urinary tract; women are affected roughly four times as often because the urethra is shorter and closer to the anus.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Urinary_tract_infection",
            "label": "Urinary tract infection"
          }
        ]
      }
    },
    {
      "id": "endocarditis",
      "name": "Infective endocarditis — the valves",
      "color": "magenta",
      "fact": "Infection of the valve surface is a slow-burn seeder: staphylococci and viridans streptococci landing on damaged endothelium, peripheral stigmata from emboli and immune complexes, diagnosis by blood cultures plus a vegetation on echo, and weeks of intravenous antibiotics drawn before the first dose.",
      "terms": [
        "Staphylococcus aureus",
        "Vegetation on echocardiography",
        "Viridans streptococci after dental work",
        "Janeway lesions and Osler nodes",
        "Blood cultures before antibiotics",
        "Weeks of intravenous antibiotics"
      ],
      "seeds": [
        "Staphylococcus aureus",
        "Vegetation on echocardiography"
      ],
      "termInfo": {
        "Blood cultures before antibiotics": "Draw the cultures, then start empirics immediately: the culture identifies the organism and its sensitivities, while antibiotics given first turn cultures negative and blind the diagnosis.",
        "Janeway lesions and Osler nodes": "Vascular and immunologic stigmata: painless hemorrhagic lesions on palms and soles (Janeway) and painful nodular erythema of hands and feet (Osler), with splinter hemorrhages and Roth spots.",
        "Staphylococcus aureus": "The leading cause worldwide (about 31% of cases) and the classic organism in injection drug use, where it seeds the tricuspid valve on the right side of the heart.",
        "Vegetation on echocardiography": "A major Duke criterion: an oscillating intracardiac mass on the valve — the vegetation that embolizes and lacks its own blood supply.",
        "Viridans streptococci after dental work": "Oral flora entering through tissue disrupted in the mouth — the community-acquired, subacute endocarditis organism.",
        "Weeks of intravenous antibiotics": "Two to six weeks of high-dose IV therapy, because vegetations have no internal blood supply; surgery for heart failure, uncontrolled infection, or recurrent emboli."
      },
      "info": {
        "text": "Infection of the inner heart surface, usually a valve; without treatment it is almost universally fatal.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Infective_endocarditis",
            "label": "Infective endocarditis"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-pneumococcus",
      "term": "The pneumococcus at both doors",
      "clusters": [
        0,
        1
      ],
      "fact": "Streptococcus pneumoniae is the most common cause of community-acquired pneumonia and, with the meningococcus, causes 80% of bacterial meningitis — one organism, two doors, and the reason pneumococcal vaccination guards both.",
      "info": "The dual membership that makes the pneumococcus unsortable on the board — and unforgettable as a bridge.",
      "relationKind": "continuity"
    },
    {
      "id": "bridge-culture-first",
      "term": "Culture before the first dose",
      "clusters": [
        1,
        3
      ],
      "fact": "Both sites are sterility-critical: meningitis empirics start immediately after cultures and lumbar puncture, and endocarditis antibiotics start immediately after blood is drawn — the culture result, not the first dose, chooses the definitive regimen.",
      "info": "Drawing cultures first is the discipline that keeps definitive therapy possible.",
      "relationKind": "cross-cutting"
    },
    {
      "id": "bridge-ecoli",
      "term": "E. coli at two ages, two doors",
      "clusters": [
        1,
        2
      ],
      "fact": "Uropathogenic E. coli ascends the urinary tract in adults, while E. coli K1 from the gut seeds neonatal meningitis — the same species entering by ascending and hematogenous routes at different ages.",
      "info": "One species, two doors: ascending uropathy and hematogenous neonatal meningitis.",
      "relationKind": "continuity"
    },
    {
      "id": "bridge-enterococcus",
      "term": "Enterococcus: gut, urine, valves",
      "clusters": [
        2,
        3
      ],
      "fact": "Enterococcus faecalis appears among catheter-associated urinary pathogens and enters the bloodstream through gastrointestinal or genitourinary abnormalities to seed valves — the gut as a shared reservoir.",
      "info": "The gut flora that links urinary infection to valve infection.",
      "relationKind": "continuity"
    }
  ],
  "lenses": [
    {
      "id": "lens-entry-doors",
      "prompt": "Which two organisms reach their sites through a body opening's own route — one ascending the urethra, one entering through tissue disrupted in the mouth?",
      "explanation": "Entry route separates organisms that look similar on a Gram stain: the same genus can arrive by ascending, inhalation, blood-borne, or inoculation doors.",
      "targets": [
        "Escherichia coli (uropathogenic)",
        "Viridans streptococci after dental work"
      ],
      "reasons": {
        "Escherichia coli (uropathogenic)": "Gut flora ascending the short female urethra — the urothelial door.",
        "Viridans streptococci after dental work": "Oral flora entering through disrupted mouth tissue — the dental door."
      }
    },
    {
      "id": "lens-pyelo",
      "prompt": "Which presentation means a urinary infection has climbed beyond the bladder — the point where fever joins dysuria?",
      "explanation": "The dividing line is the kidney: once infection climbs beyond the bladder, systemic signs appear and management changes.",
      "targets": [
        "Flank pain with fever (pyelonephritis)"
      ],
      "reasons": {
        "Flank pain with fever (pyelonephritis)": "Upper-tract infection adds flank pain, fever, and nausea to the lower-tract symptoms."
      }
    },
    {
      "id": "lens-skin-stigmata",
      "prompt": "Which two syndromes announce themselves on the skin — one with a rapidly spreading non-blanching rash, one with painless palm and sole lesions and painful nodules?",
      "explanation": "Both are blood-borne signatures on skin — meningococcal septicemia versus emboli and immune complexes from vegetations — but one is non-blanching petechiae, the other palm-and-sole lesions plus painful nodules.",
      "targets": [
        "Janeway lesions and Osler nodes",
        "Non-blanching petechial rash"
      ],
      "reasons": {
        "Janeway lesions and Osler nodes": "Vascular and immunologic stigmata of endocarditis: painless Janeway lesions, painful Osler nodes.",
        "Non-blanching petechial rash": "Meningococcal septicemia's relatively specific, rapidly spreading petechiae."
      }
    },
    {
      "id": "lens-csf-glucose",
      "prompt": "Which test result most strongly separates bacterial from viral infection at its site — neutrophils crowding the fluid while glucose falls?",
      "explanation": "Neutrophils with a CSF-to-blood glucose ratio of 0.4 or less point to bacteria; viruses give lymphocytes with normal glucose.",
      "targets": [
        "CSF neutrophils with low glucose"
      ],
      "reasons": {
        "CSF neutrophils with low glucose": "Bacterial meningitis CSF: neutrophils above 300/mm³, glucose ratio ≤0.4, protein high."
      }
    },
    {
      "id": "lens-first-dose-pairs",
      "prompt": "Which two first-dose regimens deliberately pair several drugs — one to cover the resistant-and-atypical causes at its site, one adding a steroid against inflammatory injury?",
      "explanation": "Both pair drugs because one site, one organism is not the whole story: the lung hides atypicals the beta-lactam cannot touch, and the meninges face resistant pneumococcus plus inflammatory injury.",
      "targets": [
        "Beta-lactam plus macrolide",
        "Ceftriaxone, vancomycin, dexamethasone"
      ],
      "reasons": {
        "Beta-lactam plus macrolide": "Beta-lactam for the pneumococcus, macrolide for Mycoplasma and Legionella.",
        "Ceftriaxone, vancomycin, dexamethasone": "Cephalosporin plus vancomycin for coverage; dexamethasone just before the first dose against pneumococcal inflammation."
      }
    },
    {
      "id": "lens-staph-tricuspid",
      "prompt": "Which organism rides the venous return to seed the tricuspid valve in injection drug use — the leading cause of the syndrome worldwide?",
      "explanation": "The venous return carries injected contaminants to the right heart first — which is why tricuspid vegetations point to injection drug use and S. aureus.",
      "targets": [
        "Staphylococcus aureus"
      ],
      "reasons": {
        "Staphylococcus aureus": "Skin flora on dirty needles; the right-sided, tricuspid classic."
      }
    }
  ],
  "lensMode": "sequential",
  "preSolve": false,
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Follow the site: four infections, one logic",
    "summary": "How infection's location — lung, meninges, urinary tract, valves — predicts its organisms, its test, and its first antibiotic dose.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "At the bedside, infectious disease starts with a question of geography: where does the infection live? The body has doors — airways, the urethra, the mouth, punctures through skin — and once an organism passes one, the anatomy of that site decides what the patient feels, which test confirms it, and what the first dose of antibiotics must cover.\r\n\r\nIn the lung, community-acquired pneumonia fills the alveoli with fluid and pus: cough, fever, sharp chest pain, crackles on auscultation with dullness to percussion, and a lobe turned white on the film — lobar consolidation. The most common bacterial cause is Streptococcus pneumoniae, the pneumococcus, but Mycoplasma and Legionella — the atypicals — resist penicillins, one because it has no cell wall, the other because it grows inside cells. That is why the first dose pairs a beta-lactam with a macrolide.\r\n\r\nIn the meninges, bacterial meningitis is measured in hours. The classic triad is neck stiffness, sudden high fever, and altered mental status — all three together in fewer than half of cases, and severe headache in almost nine in ten. Meningeal irritation provokes Kernig's and Brudzinski's signs, rare but highly specific. When Neisseria meningitidis, the meningococcus, invades the blood, a rapidly spreading non-blanching petechial rash may appear before anything else. Lumbar puncture confirms: cloudy cerebrospinal fluid under elevated pressure, neutrophils often above 300 per cubic millimeter, a CSF-to-blood glucose ratio of 0.4 or less. Empirics start immediately — ceftriaxone, vancomycin added for resistant pneumococcus, dexamethasone just before the first dose.\r\n\r\nIn the urinary tract, uropathogenic Escherichia coli — the cause of about three-quarters of uncomplicated infections — ascends a urethra that is shorter and closer to the anus in women, who are infected roughly four times as often as men. Cystitis is dysuria, urgency, and suprapubic pain without systemic upset; when infection climbs to the kidney, flank pain and fever announce pyelonephritis. A dipstick reads leukocyte esterase and nitrites; uncomplicated cystitis takes nitrofurantoin.\r\n\r\nOn the heart valves, infective endocarditis is a slow-burn seeder. Staphylococcus aureus — the leading cause worldwide, classically seeding the tricuspid valve in injection drug use — and viridans streptococci entering through tissue disrupted in the mouth land on damaged endothelium and grow as vegetations. Emboli and immune complexes mark the skin: painless Janeway lesions on palms and soles, painful Osler nodes, splinter hemorrhages, Roth spots. The Duke criteria need a typical organism in the blood cultures and a vegetation on echocardiography — and the cultures are drawn before the first dose, because antibiotics given first turn them negative. Treatment is then two to six weeks of intravenous antibiotics: the vegetations have no blood supply of their own.\r\n\r\nThe doors connect the rooms. The pneumococcus causes both pneumonia and — with the meningococcus — most bacterial meningitis, which is why vaccination guards both. E. coli ascends the urinary tract in adults yet seeds neonatal meningitis from the gut. Enterococcus, a gut resident, turns up in catheterized urine and passes through gastrointestinal or genitourinary openings to reach valves. Same species, several doors — and always, cultures before the first dose."
    }
  },
  "provenance": {
    "collaboration": "ai",
    "contributors": [
      {
        "name": "ZCode (GLM 5.3 Flash)",
        "reasoning": "high"
      }
    ]
  }
});
puzzle.layout = {
  "schemaVersion": 1,
  "modes": {
    "star": {
      "schemaVersion": 1,
      "puzzleId": "infection-syndromes-bedside",
      "puzzleRevision": "fnv1a32:9f6748be",
      "board": {
        "width": 1450,
        "height": 940
      },
      "nodes": {
        "term:Lobar consolidation on chest X-ray": {
          "x": 661.4,
          "y": 54.51
        },
        "term:Beta-lactam plus macrolide": {
          "x": 762.57,
          "y": 193.63
        },
        "term:Atypicals: Mycoplasma and Legionella": {
          "x": 449.37,
          "y": 107.7
        },
        "term:Crackles and dullness to percussion": {
          "x": 250.43,
          "y": 184.54
        },
        "term:Neisseria meningitidis": {
          "x": 1338.04,
          "y": 309.79
        },
        "term:Non-blanching petechial rash": {
          "x": 1015.26,
          "y": 93.91
        },
        "term:Kernig and Brudzinski signs": {
          "x": 1344.95,
          "y": 177.13
        },
        "term:CSF neutrophils with low glucose": {
          "x": 1306.54,
          "y": 396.87
        },
        "term:Ceftriaxone, vancomycin, dexamethasone": {
          "x": 1280.97,
          "y": 91.94
        },
        "term:Escherichia coli (uropathogenic)": {
          "x": 669.95,
          "y": 848.06
        },
        "term:Dysuria and urinary frequency": {
          "x": 1195.56,
          "y": 657.85
        },
        "term:Flank pain with fever (pyelonephritis)": {
          "x": 1071.19,
          "y": 866.78
        },
        "term:Nitrites and leukocyte esterase": {
          "x": 1289.99,
          "y": 777.14
        },
        "term:Nitrofurantoin": {
          "x": 850.02,
          "y": 901.25
        },
        "term:Staphylococcus aureus": {
          "x": 477.42,
          "y": 523.17
        },
        "term:Vegetation on echocardiography": {
          "x": 353.13,
          "y": 873.67
        },
        "term:Viridans streptococci after dental work": {
          "x": 142.85,
          "y": 811.61
        },
        "term:Janeway lesions and Osler nodes": {
          "x": 397.9,
          "y": 441.89
        },
        "term:Blood cultures before antibiotics": {
          "x": 123.95,
          "y": 528.97
        },
        "term:Weeks of intravenous antibiotics": {
          "x": 230.14,
          "y": 374.46
        },
        "term:The pneumococcus at both doors": {
          "x": 715.79,
          "y": 360.26
        },
        "term:Culture before the first dose": {
          "x": 736.36,
          "y": 474.93
        },
        "term:E. coli at two ages, two doors": {
          "x": 1062.64,
          "y": 490.95
        },
        "term:Enterococcus: gut, urine, valves": {
          "x": 759.89,
          "y": 611.99
        },
        "cluster:0": {
          "x": 523.79,
          "y": 281.57
        },
        "cluster:1": {
          "x": 1129.91,
          "y": 246.22
        },
        "cluster:2": {
          "x": 861.8,
          "y": 714.52
        },
        "cluster:3": {
          "x": 302.23,
          "y": 690.47
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-15T23:37:44.583Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "infection-syndromes-bedside",
      "puzzleRevision": "fnv1a32:9f6748be",
      "board": {
        "width": 1450,
        "height": 940
      },
      "nodes": {
        "term:Lobar consolidation on chest X-ray": {
          "x": 1112.98,
          "y": 483.63,
          "pinned": false
        },
        "term:Beta-lactam plus macrolide": {
          "x": 1338.22,
          "y": 398.93,
          "pinned": true
        },
        "term:Atypicals: Mycoplasma and Legionella": {
          "x": 1303,
          "y": 248.52,
          "pinned": true
        },
        "term:Crackles and dullness to percussion": {
          "x": 1229.38,
          "y": 614.68,
          "pinned": true
        },
        "term:Neisseria meningitidis": {
          "x": 793.38,
          "y": 197.79,
          "pinned": true
        },
        "term:Non-blanching petechial rash": {
          "x": 1053.03,
          "y": 82.1,
          "pinned": true
        },
        "term:Kernig and Brudzinski signs": {
          "x": 892.35,
          "y": 368.76,
          "pinned": true
        },
        "term:CSF neutrophils with low glucose": {
          "x": 814.06,
          "y": 23,
          "pinned": false
        },
        "term:Ceftriaxone, vancomycin, dexamethasone": {
          "x": 547.8,
          "y": 55.66,
          "pinned": false
        },
        "term:Escherichia coli (uropathogenic)": {
          "x": 403.87,
          "y": 435.48,
          "pinned": false
        },
        "term:Dysuria and urinary frequency": {
          "x": 196.6,
          "y": 545.3,
          "pinned": true
        },
        "term:Flank pain with fever (pyelonephritis)": {
          "x": 141.7,
          "y": 380.69,
          "pinned": false
        },
        "term:Nitrites and leukocyte esterase": {
          "x": 210.86,
          "y": 186.82,
          "pinned": true
        },
        "term:Nitrofurantoin": {
          "x": 391.67,
          "y": 246.47,
          "pinned": true
        },
        "term:Staphylococcus aureus": {
          "x": 685.09,
          "y": 738.56,
          "pinned": false
        },
        "term:Vegetation on echocardiography": {
          "x": 555.23,
          "y": 904.49,
          "pinned": false
        },
        "term:Viridans streptococci after dental work": {
          "x": 917.34,
          "y": 680.89,
          "pinned": false
        },
        "term:Janeway lesions and Osler nodes": {
          "x": 811.53,
          "y": 886.46,
          "pinned": true
        },
        "term:Blood cultures before antibiotics": {
          "x": 312.51,
          "y": 861.92,
          "pinned": false
        },
        "term:Weeks of intravenous antibiotics": {
          "x": 1030.99,
          "y": 836.22,
          "pinned": true
        },
        "term:The pneumococcus at both doors": {
          "x": 1022.49,
          "y": 251.09,
          "pinned": false
        },
        "term:Culture before the first dose": {
          "x": 681.26,
          "y": 533.19,
          "pinned": false
        },
        "term:E. coli at two ages, two doors": {
          "x": 612.12,
          "y": 309.8,
          "pinned": true
        },
        "term:Enterococcus: gut, urine, valves": {
          "x": 449.86,
          "y": 635.54,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 6995.19,
        "score": 6995.187022746295
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": false,
      "source": "author",
      "savedAt": "2026-10-15T15:56:58.200Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "infection-syndromes-bedside",
      "puzzleRevision": "fnv1a32:9f6748be",
      "board": {
        "width": 1450,
        "height": 940
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 1185.53,
          "y": 474.06,
          "pinned": true
        },
        "cluster:1": {
          "x": 720.07,
          "y": 727.64,
          "pinned": true
        },
        "cluster:2": {
          "x": 225.07,
          "y": 505.58,
          "pinned": true
        },
        "cluster:3": {
          "x": 737.81,
          "y": 196.84,
          "pinned": true
        }
      },
      "bridges": {
        "term:The pneumococcus at both doors": {
          "x": 863.01,
          "y": 509.58,
          "pinned": false
        },
        "term:Culture before the first dose": {
          "x": 720.8,
          "y": 440.69,
          "pinned": true
        },
        "term:E. coli at two ages, two doors": {
          "x": 586.99,
          "y": 509.58,
          "pinned": false
        },
        "term:Enterococcus: gut, urine, valves": {
          "x": 396.6,
          "y": 275.73,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Lobar consolidation on chest X-ray",
          "Beta-lactam plus macrolide",
          "Atypicals: Mycoplasma and Legionella",
          "Crackles and dullness to percussion"
        ],
        "cluster:1": [
          "Neisseria meningitidis",
          "Non-blanching petechial rash",
          "Kernig and Brudzinski signs",
          "CSF neutrophils with low glucose",
          "Ceftriaxone, vancomycin, dexamethasone"
        ],
        "cluster:2": [
          "Escherichia coli (uropathogenic)",
          "Dysuria and urinary frequency",
          "Flank pain with fever (pyelonephritis)",
          "Nitrites and leukocyte esterase",
          "Nitrofurantoin"
        ],
        "cluster:3": [
          "Staphylococcus aureus",
          "Vegetation on echocardiography",
          "Viridans streptococci after dental work",
          "Janeway lesions and Osler nodes",
          "Blood cultures before antibiotics",
          "Weeks of intravenous antibiotics"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "Lobar consolidation on chest X-ray",
          "Atypicals: Mycoplasma and Legionella",
          "Crackles and dullness to percussion",
          "Beta-lactam plus macrolide"
        ],
        "cluster:1": [
          "Neisseria meningitidis",
          "Non-blanching petechial rash",
          "Ceftriaxone, vancomycin, dexamethasone",
          "CSF neutrophils with low glucose",
          "Kernig and Brudzinski signs"
        ],
        "cluster:2": [
          "Nitrofurantoin",
          "Nitrites and leukocyte esterase",
          "Flank pain with fever (pyelonephritis)",
          "Escherichia coli (uropathogenic)",
          "Dysuria and urinary frequency"
        ],
        "cluster:3": [
          "Vegetation on echocardiography",
          "Weeks of intravenous antibiotics",
          "Viridans streptococci after dental work",
          "Blood cultures before antibiotics",
          "Janeway lesions and Osler nodes",
          "Staphylococcus aureus"
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
        "totalLength": 1080.8835915568548
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-15T15:57:58.976Z"
    }
  },
  "board": {
    "sizeFactor": 0.95,
    "source": "author",
    "savedAt": "2026-10-15T15:53:39.016Z"
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
