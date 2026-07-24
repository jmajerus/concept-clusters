// Concept Clusters puzzle: The integumentary system
// Standard size: 11 cluster terms + 2 bridge terms = 13 nodes.
// Cleveland Clinic and Mayo Clinic extraLink destinations verified July 2026.

export default {
  "id": "integumentary-system",
  "title": "The integumentary system",
  "category": "Physiology & Medicine",
  "clusters": [
    {
      "name": "Skin layers",
      "color": "green",
      "fact": "Skin has three main layers: the epidermis forms the outer barrier, the dermis supports glands, follicles and sensation, and the fatty hypodermis cushions and insulates.",
      "terms": [
        "epidermis",
        "dermis",
        "hypodermis"
      ],
      "seeds": [
        "epidermis",
        "dermis"
      ],
      "termInfo": {
        "epidermis": {
          "text": "The outermost skin layer, made largely of keratin-producing cells that create a protective, water-resistant surface.",
          "link": "wiki:Epidermis",
          "extraLink": "https://my.clevelandclinic.org/health/body/21901-epidermis"
        },
        "dermis": {
          "text": "The thick middle skin layer containing connective tissue, blood vessels, nerves, hair follicles and glands.",
          "link": "wiki:Dermis",
          "extraLink": "https://my.clevelandclinic.org/health/body/22357-dermis"
        },
        "hypodermis": {
          "text": "The fatty layer beneath the dermis that cushions deeper tissues, stores energy and helps insulate the body.",
          "link": "wiki:Subcutaneous tissue",
          "extraLink": "https://my.clevelandclinic.org/health/body/21902-hypodermis-subcutaneous-tissue"
        }
      },
      "info": {
        "link": "wiki:Skin",
        "extraLink": "https://my.clevelandclinic.org/health/body/10978-skin"
      }
    },
    {
      "name": "Accessory structures",
      "color": "blue",
      "fact": "Hair, nails and skin glands are accessory structures of the integumentary system: they protect surfaces and release substances such as sweat and sebum.",
      "terms": [
        "hair",
        "nails",
        "sweat glands",
        "sebaceous glands"
      ],
      "seeds": [
        "hair",
        "nails"
      ],
      "termInfo": {
        "hair": {
          "text": "Keratin-based filaments that grow from follicles and help with protection, insulation and light-touch sensation.",
          "link": "wiki:Hair",
          "extraLink": "https://my.clevelandclinic.org/health/body/body-hair"
        },
        "nails": {
          "text": "Hard keratin plates that protect the sensitive tips of the fingers and toes and assist with fine manipulation.",
          "link": "wiki:Nail (anatomy)",
          "extraLink": "https://my.clevelandclinic.org/health/body/nail-anatomy"
        },
        "sweat glands": {
          "text": "Skin glands that release sweat; eccrine glands open onto the skin surface, while apocrine glands open into hair follicles.",
          "link": "wiki:Sweat gland",
          "extraLink": "https://my.clevelandclinic.org/health/body/eccrine-glands"
        },
        "sebaceous glands": {
          "text": "Glands, usually connected to hair follicles, that secrete oily sebum to help lubricate skin and hair.",
          "link": "wiki:Sebaceous gland",
          "extraLink": "https://my.clevelandclinic.org/health/body/24538-sebaceous-glands"
        }
      },
      "info": {
        "link": "wiki:Integumentary system",
        "extraLink": "https://my.clevelandclinic.org/health/body/22827-integumentary-system"
      }
    },
    {
      "name": "System functions",
      "color": "amber",
      "fact": "The integumentary system protects the body, regulates temperature, detects sensations and uses sunlight to help synthesize vitamin D.",
      "terms": [
        "barrier protection",
        "temperature regulation",
        "sensation",
        "vitamin D synthesis"
      ],
      "seeds": [
        "barrier protection",
        "temperature regulation"
      ],
      "termInfo": {
        "barrier protection": {
          "text": "The skin's physical and chemical defenses against injury, microbes, ultraviolet radiation and excessive water loss.",
          "link": "wiki:Skin",
          "extraLink": "https://my.clevelandclinic.org/health/body/21901-epidermis"
        },
        "temperature regulation": {
          "text": "Keeping internal temperature within a workable range through mechanisms including sweating, changes in skin blood flow and insulation.",
          "link": "wiki:Thermoregulation",
          "extraLink": "https://my.clevelandclinic.org/health/body/eccrine-glands"
        },
        "sensation": {
          "text": "Skin receptors and nerve endings detect touch, pressure, pain, itch, heat and cold.",
          "link": "wiki:Somatosensory system",
          "extraLink": "https://my.clevelandclinic.org/health/body/22357-dermis"
        },
        "vitamin D synthesis": {
          "text": "Ultraviolet light begins a chemical process in the skin that allows the body to produce vitamin D.",
          "link": "wiki:Vitamin D",
          "extraLink": "https://www.mayoclinic.org/drugs-supplements-vitamin-d/art-20363792"
        }
      },
      "info": {
        "link": "wiki:Integumentary system",
        "extraLink": "https://my.clevelandclinic.org/health/body/22827-integumentary-system"
      }
    }
  ],
  "bridges": [
    {
      "term": "keratin",
      "clusters": [
        0,
        1
      ],
      "fact": "Keratin bridges skin layers and accessory structures: keratin-producing cells strengthen the epidermis, and hardened keratin forms the main structural material of hair and nails.",
      "idealTerms": [
        "epidermis",
        null
      ],
      "info": {
        "text": "A tough structural protein produced by skin cells and used throughout the epidermis, hair and nails.",
        "link": "wiki:Keratin",
        "extraLink": "https://my.clevelandclinic.org/health/body/21901-epidermis"
      }
    },
    {
      "term": "sweating",
      "clusters": [
        1,
        2
      ],
      "fact": "Sweating bridges accessory structures and system functions: sweat glands release fluid onto the skin, and its evaporation removes heat to help regulate body temperature.",
      "idealTerms": [
        "sweat glands",
        "temperature regulation"
      ],
      "info": {
        "text": "The release of sweat onto the skin, especially from eccrine glands, where evaporation can cool the body.",
        "link": "wiki:Perspiration",
        "extraLink": "https://my.clevelandclinic.org/health/body/eccrine-glands"
      }
    }
  ]
};
