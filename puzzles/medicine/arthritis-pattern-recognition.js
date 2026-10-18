// Generated from content/puzzles/arthritis-pattern-recognition.ccpuzzle.json.
// Edit the canonical simplified source rather than editing this file directly.

import { definePuzzle } from "../../modules/puzzleManifest.js";

const puzzle = definePuzzle(import.meta.url, {
  "id": "arthritis-pattern-recognition",
  "title": "Four Arthritides, Four Patterns",
  "category": "medicine",
  "subcategories": {
    "medicine": "rheumatology"
  },
  "info": {
    "text": "Four joint diseases, four bedside patterns: rheumatoid arthritis (autoimmune, symmetric, erosive), osteoarthritis (mechanical, degenerative, joints only), gout (crystal, episodic, metabolic), and axial spondyloarthritis (inflammatory spine, HLA-B27). The board teaches how distribution, stiffness rhythm, serology, imaging, and systemic signs tell them apart — and why NSAIDs recur in all while disease control differs.",
    "citations": [
      {
        "title": "Rheumatoid arthritis",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Rheumatoid_arthritis"
      },
      {
        "title": "Osteoarthritis",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Osteoarthritis"
      },
      {
        "title": "Gout",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Gout"
      },
      {
        "title": "Ankylosing spondylitis (axial spondyloarthritis)",
        "publisher": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Ankylosing_spondylitis"
      }
    ]
  },
  "clusters": [
    {
      "id": "rheumatoid",
      "name": "Rheumatoid arthritis — autoimmune, symmetric, erosive",
      "color": "teal",
      "fact": "The autoimmune arthritis: symmetric small joints of the hands, hours-long morning stiffness easing with movement, rheumatoid factor and anti-CCP in the blood, bony erosions on film, organs involved beyond the joints — and methotrexate to slow the disease itself.",
      "terms": [
        "Symmetric small-joint swelling",
        "Rheumatoid factor and anti-CCP",
        "Morning stiffness lasting hours",
        "Bony erosions on X-ray",
        "Lungs, eyes, skin beyond the joints",
        "Methotrexate (first DMARD)"
      ],
      "seeds": [
        "Symmetric small-joint swelling",
        "Rheumatoid factor and anti-CCP"
      ],
      "termInfo": {
        "Bony erosions on X-ray": "As disease advances, bony erosions and subluxation appear; early films may show periarticular osteopenia and reduced joint space.",
        "Lungs, eyes, skin beyond the joints": "A systemic autoimmune disease: skin, eyes, lungs, heart, nerves, and blood can be involved in 20–40% of people.",
        "Methotrexate (first DMARD)": "Disease-modifying antirheumatic drugs slow the disease itself; methotrexate is the most important and usually the first. NSAIDs ease pain but do not affect the underlying disease; steroids bridge flares at the lowest dose.",
        "Morning stiffness lasting hours": "Pain and stiffness worsen after rest and are usually worst in the morning; stiffness can last several hours but gradually improves with movement.",
        "Rheumatoid factor and anti-CCP": "Anti-citrullinated protein antibodies are positive in 61–75% of RA cases with ~95% specificity; RF is non-specific (10% of healthy people). A negative test does not rule out seronegative RA — about a third of cases.",
        "Symmetric small-joint swelling": "The wrists and hands are involved most, typically the same joints on both sides: MCP and PIP joints first, then feet."
      },
      "info": {
        "text": "A long-term autoimmune disorder that primarily affects joints — and in 20–40% of people, other organs too.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Rheumatoid_arthritis",
            "label": "Rheumatoid arthritis"
          }
        ]
      }
    },
    {
      "id": "osteo",
      "name": "Osteoarthritis — mechanical, degenerative, joints only",
      "color": "blue",
      "fact": "The wear pattern: hard bony nodes at the finger joints and weight-bearing knees and hips, pain made worse by use with stiffness that fades within thirty minutes, never internal organs — and joint replacement when disability wins.",
      "terms": [
        "Heberden's and Bouchard's nodes",
        "Weight-bearing knees and hips",
        "Pain with use, brief morning stiffness",
        "Only joints, not internal organs",
        "Joint replacement for disability"
      ],
      "seeds": [
        "Heberden's and Bouchard's nodes",
        "Weight-bearing knees and hips"
      ],
      "termInfo": {
        "Heberden's and Bouchard's nodes": "Hard bony enlargements at the finger joints: Heberden's at the distal (DIP), Bouchard's at the proximal (PIP) interphalangeal joints.",
        "Joint replacement for disability": "Joint replacement when disability persists despite other treatment; over 90% of hip and knee replacements trace to osteoarthritis, and artificial joints typically last over 20 years.",
        "Only joints, not internal organs": "Unlike inflammatory arthritides, only the joints are affected — and in contrast to RA, osteoarthritic joints do not become hot or red; synovial fluid stays clear with low white-cell counts.",
        "Pain with use, brief morning stiffness": "Pain is made worse by prolonged activity and relieved by rest; morning stiffness typically lasts less than thirty minutes.",
        "Weight-bearing knees and hips": "The large weight-bearing joints — hips and knees — plus the joint at the thumb base and the neck and lower back spine joints."
      },
      "info": {
        "text": "Degenerative breakdown of joint cartilage and underlying bone — the most common form of arthritis, driven by mechanical stress and low-grade inflammation.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Osteoarthritis",
            "label": "Osteoarthritis"
          }
        ]
      }
    },
    {
      "id": "gout",
      "name": "Gout — crystal, episodic, metabolic",
      "color": "amber",
      "fact": "The crystal disease: an overnight attack on the big toe that turns red, hot, and exquisitely swollen, proven by needle-shaped urate crystals under polarized light, driven by hyperuricemia that in time piles up as tophi — colchicine or NSAIDs for the attack, allopurinol to lower uric acid between them.",
      "terms": [
        "Podagra: the big-toe joint",
        "Overnight attack, red hot swollen",
        "Needle-shaped urate crystals",
        "Hyperuricemia and tophi",
        "Colchicine for the acute attack",
        "Allopurinol lowers uric acid"
      ],
      "seeds": [
        "Podagra: the big-toe joint",
        "Overnight attack, red hot swollen"
      ],
      "termInfo": {
        "Allopurinol lowers uric acid": "Long-term prevention with urate-lowering: allopurinol blocks uric acid production and is the most commonly used agent; febuxostat is reserved for allopurinol intolerance.",
        "Colchicine for the acute attack": "Acute attacks improve with NSAIDs, glucocorticoids, or colchicine; steroids and NSAIDs are equally effective, steroids possibly safer.",
        "Hyperuricemia and tophi": "Persistently elevated urate (>7.0 mg/dL in men) drives attacks — kidney underexcretion is the cause in about 90% — and long-standing disease piles crystals into hard, painless tophi.",
        "Needle-shaped urate crystals": "The definitive test: monosodium urate crystals in synovial fluid showing needle-like morphology and strong negative birefringence under polarized light. Blood uric acid may be normal during an attack.",
        "Overnight attack, red hot swollen": "Pain begins at night and peaks within 24 hours — partly attributed to lower body temperature — maximal in under 12 hours, in a red, tender, hot, swollen joint.",
        "Podagra: the big-toe joint": "The first metatarsophalangeal joint at the base of the big toe is affected most often — half of first attacks. Key differential to exclude: septic arthritis."
      },
      "info": {
        "text": "Recurrent attacks of inflammatory arthritis from monosodium urate crystals; the key dangerous look-alike is septic arthritis.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Gout",
            "label": "Gout"
          }
        ]
      }
    },
    {
      "id": "axial",
      "name": "Axial spondyloarthritis — inflammatory spine, HLA-B27",
      "color": "magenta",
      "fact": "The axial pattern: back pain that improves with exercise and worsens at rest in a young adult, inflammation of the sacroiliac joints on imaging, HLA-B27 in most, uveitis and enthesitis beyond the spine, seronegativity for rheumatoid factor — NSAIDs first, TNF inhibitors when they fail.",
      "terms": [
        "Inflammatory back pain: better moving",
        "HLA-B27",
        "Sacroiliitis on X-ray or MRI",
        "Anterior uveitis, enthesitis",
        "Seronegative: no rheumatoid factor",
        "NSAIDs first, then TNF inhibitors"
      ],
      "seeds": [
        "Inflammatory back pain: better moving",
        "HLA-B27"
      ],
      "termInfo": {
        "Anterior uveitis, enthesitis": "Beyond the spine: anterior uveitis in about 30% (eye pain, redness, blurred vision), enthesitis where tendon meets bone, and association with psoriasis and inflammatory bowel disease.",
        "HLA-B27": "More than 85–90% of diagnosed people carry HLA-B27 (up to 95% of European-descent patients). The test aids diagnosis but is not itself diagnostic.",
        "Inflammatory back pain: better moving": "Diagnostic criteria: onset below 40, insidious, improvement with exercise, no improvement with rest, and night pain that eases on getting up.",
        "NSAIDs first, then TNF inhibitors": "Unless contraindicated, everyone is recommended NSAIDs; TNF inhibitors (adalimumab, etanercept, infliximab and kin) or IL-17 blockers come next. There is no cure.",
        "Sacroiliitis on X-ray or MRI": "The earliest X-ray changes are erosions and sclerosis where the spine joins the pelvis, though films can take 7–10 years; MRI shows the inflammation earlier.",
        "Seronegative: no rheumatoid factor": "Classified as a seronegative spondyloarthropathy — rheumatoid factor is absent, which helps separate it from rheumatoid arthritis."
      },
      "info": {
        "text": "Long-term inflammation where the spine joins the pelvis — the anchor disease of the spondyloarthritis family, onset typically between 20 and 30.",
        "links": [
          {
            "href": "https://en.wikipedia.org/wiki/Ankylosing_spondylitis",
            "label": "Ankylosing spondylitis (axial spondyloarthritis)"
          }
        ]
      }
    }
  ],
  "bridges": [
    {
      "id": "bridge-stiffness",
      "term": "Stiffness is the tell",
      "clusters": [
        0,
        1
      ],
      "fact": "The classic bedside discriminator between autoimmune and mechanical arthritis is the stiffness rhythm: rheumatoid morning stiffness lasts hours and improves with movement, while osteoarthritis pain follows use and its stiffness fades within thirty minutes.",
      "info": "Ask two questions: how long is the morning stiffness, and does pain follow use or rest?",
      "relationKind": "contrast",
      "idealTerms": [
        "Morning stiffness lasting hours",
        "Pain with use, brief morning stiffness"
      ]
    },
    {
      "id": "bridge-serology",
      "term": "Serology divides the family",
      "clusters": [
        0,
        3
      ],
      "fact": "RA carries rheumatoid factor and anti-CCP, while the spondyloarthritis family is defined as seronegative — no rheumatoid factor — and leans instead on HLA-B27; a positive RF test points the workup to one of these, not the other.",
      "info": "Blood tests divide the inflammatory arthritides before imaging does.",
      "relationKind": "contrast",
      "idealTerms": [
        "Rheumatoid factor and anti-CCP",
        "Seronegative: no rheumatoid factor"
      ]
    },
    {
      "id": "bridge-nsaids",
      "term": "NSAIDs: symptom, not control",
      "clusters": [
        0,
        2,
        3
      ],
      "fact": "NSAIDs recur as the symptomatic therapy in all three inflammatory arthritides — they reduce RA pain without touching the underlying disease, treat the acute gout attack, and are recommended for everyone with axial spondyloarthritis — while true disease control needs methotrexate, urate-lowering, or biologics.",
      "info": "Symptom relief is shared; disease control is disease-specific.",
      "relationKind": "cross-cutting"
    }
  ],
  "lenses": [
    {
      "id": "lens-stiffness-clock",
      "prompt": "One patient cannot make a fist for two hours every morning; another's hands ache after gardening but loosen within half an hour. Which two findings carry those stories?",
      "explanation": "The stiffness clock is the classic bedside discriminator: hours that improve with movement mean autoimmune inflammation; minutes that fade with activity mean wear.",
      "targets": [
        "Morning stiffness lasting hours",
        "Pain with use, brief morning stiffness"
      ],
      "reasons": {
        "Morning stiffness lasting hours": "Rheumatoid stiffness is prolonged and eases as the joints move.",
        "Pain with use, brief morning stiffness": "Osteoarthritic pain follows use; stiffness fades within thirty minutes."
      }
    },
    {
      "id": "lens-serology-split",
      "prompt": "Which pair of findings sends the workup down opposite roads — antibodies present in one disease, deliberately absent in the other?",
      "explanation": "Serology splits the inflammatory arthritides: antibodies against citrullinated proteins on the autoimmune side, their absence plus HLA-B27 on the axial side.",
      "targets": [
        "Rheumatoid factor and anti-CCP",
        "Seronegative: no rheumatoid factor"
      ],
      "reasons": {
        "Rheumatoid factor and anti-CCP": "Anti-CCP: ~95% specificity for rheumatoid arthritis.",
        "Seronegative: no rheumatoid factor": "The spondyloarthritis family is defined by rheumatoid factor's absence."
      }
    },
    {
      "id": "lens-nsaids-vs-dmard",
      "prompt": "Which treatment slows its disease rather than merely easing symptoms — and in which disease would NSAIDs alone never be enough?",
      "explanation": "NSAIDs appear in all three inflammatory arthritides but only as symptomatic therapy — the disease-modifying step is different in each.",
      "targets": [
        "Methotrexate (first DMARD)"
      ],
      "reasons": {
        "Methotrexate (first DMARD)": "Disease-modifying: it changes the course of rheumatoid arthritis, unlike NSAIDs, which do not affect the underlying disease."
      }
    },
    {
      "id": "lens-hand-nodes",
      "prompt": "Which two findings at opposite ends of the same fingers mark two different diseases — one autoimmune and symmetric at the knuckles, one hard, bony, and wear-related at the fingertips?",
      "explanation": "Both are fingers, both swell — but the hand tells the disease: symmetric knuckle involvement with erosions, versus hard bony nodes at the far joints with hot-red absence.",
      "targets": [
        "Heberden's and Bouchard's nodes",
        "Symmetric small-joint swelling"
      ],
      "reasons": {
        "Heberden's and Bouchard's nodes": "Hard bony enlargements at the DIP (Heberden's) and PIP (Bouchard's) joints — the wear pattern.",
        "Symmetric small-joint swelling": "The same MCP and PIP joints on both hands — the autoimmune pattern."
      }
    },
    {
      "id": "lens-crystal-proof",
      "prompt": "Which finding under the microscope makes gout definitive — and which blood-and-lumps companion tells the years-long story behind it?",
      "explanation": "The crystal story runs from blood to proof to chronic deposits: hyperuricemia causes the attacks, the fluid confirms them, and untreated years leave tophi.",
      "targets": [
        "Hyperuricemia and tophi",
        "Needle-shaped urate crystals"
      ],
      "reasons": {
        "Hyperuricemia and tophi": "Elevated urate drives the disease; long-standing disease piles crystals into tophi.",
        "Needle-shaped urate crystals": "Needle-like, strongly negatively birefringent crystals in joint fluid — the definitive test."
      }
    },
    {
      "id": "lens-axial-rhythm",
      "prompt": "Which two findings together identify the young adult whose back pain improves with exercise — the gene, and the inflammation where the spine meets the pelvis?",
      "explanation": "Only the axial pattern hurts worse at rest and better with exercise — the opposite of mechanical pain — and it announces itself with eye and tendon disease beyond the joints.",
      "targets": [
        "HLA-B27",
        "Sacroiliitis on X-ray or MRI"
      ],
      "reasons": {
        "HLA-B27": "Carried by more than 85–90% of those diagnosed.",
        "Sacroiliitis on X-ray or MRI": "Inflammation of the sacroiliac joints — the anatomical anchor of the axial pattern."
      }
    }
  ],
  "lensMode": "sequential",
  "preSolve": false,
  "learningIntroduction": {
    "requirement": "recommended",
    "title": "Four arthritides, four patterns",
    "summary": "How joint distribution, stiffness rhythm, serology, imaging, and systemic signs separate rheumatoid arthritis, osteoarthritis, gout, and axial spondyloarthritis.",
    "estimatedMinutes": 7,
    "content": {
      "mediaType": "text/markdown",
      "text": "A swollen joint is a question, not an answer. The same complaint — pain, stiffness, swelling — can come from an autoimmune storm, simple wear, a pile of crystals, or an inflamed spine, and the treatment that helps one can do nothing for another. Clinicians tell them apart by patterns: which joints, what rhythm, what the blood shows, what imaging reveals, whether anything beyond the joints is involved.\r\n\r\nRheumatoid arthritis is the autoimmune pattern. It attacks the small joints of the hands — knuckles and finger joints — typically the same joints on both sides. Morning stiffness lasts for hours and eases with movement. The blood carries rheumatoid factor and, more specifically, anti-citrullinated protein antibodies; the X-ray, over time, shows bony erosions. Because it is systemic, the skin, eyes, lungs, heart, and nerves can join in — and because the immune system drives it, the treatment that matters is a disease-modifying drug, methotrexate first, not mere pain relief.\r\n\r\nOsteoarthritis is the wear pattern, the most common arthritis of all. It loads the joints that carry weight — knees, hips — and marks the finger joints with hard bony nodes: Heberden's at the fingertips, Bouchard's in the middle. Pain follows use and eases with rest; morning stiffness fades within thirty minutes. Only the joints are affected — no rash, no lung disease, and unlike rheumatoid joints they do not turn hot and red. When disability wins despite exercise and analgesics, joint replacement takes over.\r\n\r\nGout is the crystal pattern. Monosodium urate, kept high in the blood for years, crystallizes in a cool peripheral joint: the attack begins overnight, peaks within a day, and leaves the base of the big toe — podagra, in half of first attacks — red, hot, and exquisitely tender. The proof is seeing needle-shaped, strongly negatively birefringent crystals in joint fluid; the story behind them is hyperuricemia, mostly from kidneys that under-excrete uric acid, which in time piles into chalky tophi. Colchicine or NSAIDs end the attack; allopurinol lowers the urate between attacks.\r\n\r\nAxial spondyloarthritis is the inflammatory-spine pattern of young adults — onset typically between twenty and thirty. The back pain is inflammatory by definition: insidious, worse at rest and at night, better with exercise. Inflammation concentrates where the spine joins the pelvis — sacroiliitis on X-ray or MRI. More than eighty-five percent carry HLA-B27, and the disease extends beyond joints: anterior uveitis in about thirty percent, enthesitis where tendon meets bone, psoriasis and inflammatory bowel disease in the family. It is seronegative — rheumatoid factor absent — and its treatment ladder starts with NSAIDs for everyone and climbs to TNF inhibitors.\r\n\r\nThree crossings tie the four together. Stiffness is the tell between autoimmune and mechanical: hours versus minutes. Serology splits the inflammatory side: rheumatoid factor and anti-CCP here, seronegative with HLA-B27 there. And NSAIDs recur everywhere as symptom relief — easing rheumatoid pain, ending gout attacks, recommended for every aching spine — while genuine disease control stays disease-specific: methotrexate, urate-lowering, or biologics. One more caution lives inside the gout story: a red, hot, swollen joint can also be septic arthritis, and that infection must be excluded before crystals are blamed."
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
      "puzzleId": "arthritis-pattern-recognition",
      "puzzleRevision": "fnv1a32:e40717c3",
      "board": {
        "width": 1480,
        "height": 950
      },
      "nodes": {
        "term:Symmetric small-joint swelling": {
          "x": 868.37,
          "y": 392.59
        },
        "term:Rheumatoid factor and anti-CCP": {
          "x": 326.3,
          "y": 78.24
        },
        "term:Morning stiffness lasting hours": {
          "x": 828.93,
          "y": 32.85
        },
        "term:Bony erosions on X-ray": {
          "x": 433.2,
          "y": 211.41
        },
        "term:Lungs, eyes, skin beyond the joints": {
          "x": 566.58,
          "y": 39.76
        },
        "term:Methotrexate (first DMARD)": {
          "x": 512.94,
          "y": 346.47
        },
        "term:Heberden's and Bouchard's nodes": {
          "x": 1362.35,
          "y": 196.1
        },
        "term:Weight-bearing knees and hips": {
          "x": 1303.53,
          "y": 92.05
        },
        "term:Pain with use, brief morning stiffness": {
          "x": 955,
          "y": 195
        },
        "term:Only joints, not internal organs": {
          "x": 1123.77,
          "y": 32.85
        },
        "term:Joint replacement for disability": {
          "x": 1323.68,
          "y": 438.48
        },
        "term:Podagra: the big-toe joint": {
          "x": 1193.08,
          "y": 887.55
        },
        "term:Overnight attack, red hot swollen": {
          "x": 914.71,
          "y": 891.49
        },
        "term:Needle-shaped urate crystals": {
          "x": 1325.5,
          "y": 797.05
        },
        "term:Hyperuricemia and tophi": {
          "x": 1207.22,
          "y": 569.01
        },
        "term:Colchicine for the acute attack": {
          "x": 800.01,
          "y": 758.22
        },
        "term:Allopurinol lowers uric acid": {
          "x": 1340.14,
          "y": 663.57
        },
        "term:Inflammatory back pain: better moving": {
          "x": 136.55,
          "y": 762.08
        },
        "term:HLA-B27": {
          "x": 410.91,
          "y": 849.52
        },
        "term:Sacroiliitis on X-ray or MRI": {
          "x": 433.72,
          "y": 497.72
        },
        "term:Anterior uveitis, enthesitis": {
          "x": 567.91,
          "y": 884.59
        },
        "term:Seronegative: no rheumatoid factor": {
          "x": 160.65,
          "y": 458.94
        },
        "term:NSAIDs first, then TNF inhibitors": {
          "x": 231.18,
          "y": 882.61
        },
        "term:Stiffness is the tell": {
          "x": 968.68,
          "y": 90.94
        },
        "term:Serology divides the family": {
          "x": 160.48,
          "y": 324.28
        },
        "term:NSAIDs: symptom, not control": {
          "x": 703.75,
          "y": 575.22
        },
        "cluster:0": {
          "x": 734.85,
          "y": 256.68
        },
        "cluster:1": {
          "x": 1149.35,
          "y": 318.77
        },
        "cluster:2": {
          "x": 1093.8,
          "y": 736.86
        },
        "cluster:3": {
          "x": 384.81,
          "y": 645.28
        }
      },
      "metrics": {
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "edgeTitleIntersections": 0,
        "overlaps": 0
      },
      "source": "author",
      "savedAt": "2026-10-16T03:07:31.342Z"
    },
    "graph": {
      "schemaVersion": 1,
      "puzzleId": "arthritis-pattern-recognition",
      "puzzleRevision": "fnv1a32:e40717c3",
      "board": {
        "width": 1480,
        "height": 950
      },
      "nodes": {
        "term:Symmetric small-joint swelling": {
          "x": 726.52,
          "y": 242.5,
          "pinned": true
        },
        "term:Rheumatoid factor and anti-CCP": {
          "x": 873.59,
          "y": 377.45,
          "pinned": true
        },
        "term:Morning stiffness lasting hours": {
          "x": 1100.04,
          "y": 99.6,
          "pinned": true
        },
        "term:Bony erosions on X-ray": {
          "x": 645.07,
          "y": 100.25,
          "pinned": false
        },
        "term:Lungs, eyes, skin beyond the joints": {
          "x": 863.18,
          "y": 35.48,
          "pinned": false
        },
        "term:Methotrexate (first DMARD)": {
          "x": 964.89,
          "y": 252.99,
          "pinned": false
        },
        "term:Heberden's and Bouchard's nodes": {
          "x": 1135.67,
          "y": 671.11,
          "pinned": true
        },
        "term:Weight-bearing knees and hips": {
          "x": 1004.7,
          "y": 806.03,
          "pinned": true
        },
        "term:Pain with use, brief morning stiffness": {
          "x": 1177.49,
          "y": 488.66,
          "pinned": true
        },
        "term:Only joints, not internal organs": {
          "x": 1272.67,
          "y": 817.5,
          "pinned": true
        },
        "term:Joint replacement for disability": {
          "x": 1327.54,
          "y": 576.66,
          "pinned": true
        },
        "term:Podagra: the big-toe joint": {
          "x": 263.63,
          "y": 321.83,
          "pinned": true
        },
        "term:Overnight attack, red hot swollen": {
          "x": 425.28,
          "y": 125.42,
          "pinned": false
        },
        "term:Needle-shaped urate crystals": {
          "x": 197.34,
          "y": 70.36,
          "pinned": true
        },
        "term:Hyperuricemia and tophi": {
          "x": 359.9,
          "y": 521.35,
          "pinned": true
        },
        "term:Colchicine for the acute attack": {
          "x": 131.97,
          "y": 474.75,
          "pinned": false
        },
        "term:Allopurinol lowers uric acid": {
          "x": 110.2,
          "y": 224.35,
          "pinned": false
        },
        "term:Inflammatory back pain: better moving": {
          "x": 517.7,
          "y": 706.25,
          "pinned": false
        },
        "term:HLA-B27": {
          "x": 514.5,
          "y": 892.79,
          "pinned": false
        },
        "term:Sacroiliitis on X-ray or MRI": {
          "x": 246.49,
          "y": 696.47,
          "pinned": true
        },
        "term:Anterior uveitis, enthesitis": {
          "x": 711.29,
          "y": 826.36,
          "pinned": true
        },
        "term:Seronegative: no rheumatoid factor": {
          "x": 808.92,
          "y": 707.77,
          "pinned": true
        },
        "term:NSAIDs first, then TNF inhibitors": {
          "x": 310.76,
          "y": 809.11,
          "pinned": true
        },
        "term:Stiffness is the tell": {
          "x": 1273.28,
          "y": 236.75,
          "pinned": true
        },
        "term:Serology divides the family": {
          "x": 793.27,
          "y": 533.67,
          "pinned": true
        },
        "term:NSAIDs: symptom, not control": {
          "x": 530.92,
          "y": 353.91,
          "pinned": true
        }
      },
      "metrics": {
        "hardOverlaps": 0,
        "overlaps": 0,
        "boundsViolations": 0,
        "lineCrossings": 0,
        "edgeNodeIntersections": 0,
        "totalLength": 6883.72,
        "score": 6883.718579114365
      },
      "solutionLayout": null,
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T03:08:51.185Z"
    },
    "sets": {
      "schemaVersion": 1,
      "puzzleId": "arthritis-pattern-recognition",
      "puzzleRevision": "fnv1a32:e40717c3",
      "board": {
        "width": 1480,
        "height": 950
      },
      "stripHeight": 16,
      "circles": {
        "cluster:0": {
          "x": 752.83,
          "y": 249.16,
          "pinned": true
        },
        "cluster:1": {
          "x": 266.02,
          "y": 481.03,
          "pinned": true
        },
        "cluster:2": {
          "x": 1244.56,
          "y": 482.01,
          "pinned": true
        },
        "cluster:3": {
          "x": 759.73,
          "y": 724.74,
          "pinned": true
        }
      },
      "bridges": {
        "term:Stiffness is the tell": {
          "x": 476.13,
          "y": 256.22,
          "pinned": false
        },
        "term:Serology divides the family": {
          "x": 636,
          "y": 483,
          "pinned": false
        },
        "term:NSAIDs: symptom, not control": {
          "x": 913.41,
          "y": 485.96,
          "pinned": true
        }
      },
      "clusterTerms": {
        "cluster:0": [
          "Symmetric small-joint swelling",
          "Rheumatoid factor and anti-CCP",
          "Morning stiffness lasting hours",
          "Bony erosions on X-ray",
          "Lungs, eyes, skin beyond the joints",
          "Methotrexate (first DMARD)"
        ],
        "cluster:1": [
          "Heberden's and Bouchard's nodes",
          "Weight-bearing knees and hips",
          "Pain with use, brief morning stiffness",
          "Only joints, not internal organs",
          "Joint replacement for disability"
        ],
        "cluster:2": [
          "Podagra: the big-toe joint",
          "Overnight attack, red hot swollen",
          "Needle-shaped urate crystals",
          "Hyperuricemia and tophi",
          "Colchicine for the acute attack",
          "Allopurinol lowers uric acid"
        ],
        "cluster:3": [
          "Inflammatory back pain: better moving",
          "HLA-B27",
          "Sacroiliitis on X-ray or MRI",
          "Anterior uveitis, enthesitis",
          "Seronegative: no rheumatoid factor",
          "NSAIDs first, then TNF inhibitors"
        ]
      },
      "memberOrders": {
        "cluster:0": [
          "Methotrexate (first DMARD)",
          "Symmetric small-joint swelling",
          "Lungs, eyes, skin beyond the joints",
          "Morning stiffness lasting hours",
          "Rheumatoid factor and anti-CCP",
          "Bony erosions on X-ray"
        ],
        "cluster:1": [
          "Weight-bearing knees and hips",
          "Only joints, not internal organs",
          "Pain with use, brief morning stiffness",
          "Joint replacement for disability",
          "Heberden's and Bouchard's nodes"
        ],
        "cluster:2": [
          "Podagra: the big-toe joint",
          "Needle-shaped urate crystals",
          "Overnight attack, red hot swollen",
          "Colchicine for the acute attack",
          "Allopurinol lowers uric acid",
          "Hyperuricemia and tophi"
        ],
        "cluster:3": [
          "Anterior uveitis, enthesitis",
          "Seronegative: no rheumatoid factor",
          "Inflammatory back pain: better moving",
          "NSAIDs first, then TNF inhibitors",
          "Sacroiliitis on X-ray or MRI",
          "HLA-B27"
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
        "totalLength": 1143.553132134255
      },
      "solutionLayout": "pretty",
      "capturedSolved": true,
      "fixed": true,
      "source": "author",
      "savedAt": "2026-10-16T03:09:25.317Z"
    }
  }
};
puzzle.starLayout = puzzle.layout?.modes?.star || null;
export default puzzle;
