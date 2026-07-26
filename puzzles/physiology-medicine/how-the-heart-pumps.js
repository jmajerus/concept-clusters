// Concept Clusters puzzle: How the heart pumps
// Standard size: 12 cluster terms + 2 bridge terms = 14 nodes.
// Mayo-family extraLink destinations verified July 2026.

export default {
  "id": "how-the-heart-pumps",
  "title": "How the heart pumps",
  "category": "Physiology & Medicine",
  "clusters": [
    {
      "name": "Heart chambers",
      "color": "green",
      "fact": "The atria receive blood and the ventricles pump it onward: the right heart sends blood to the lungs, while the left heart sends oxygen-rich blood to the body.",
      "terms": [
        "right atrium",
        "right ventricle",
        "left atrium",
        "left ventricle"
      ],
      "seeds": [
        "right atrium",
        "left ventricle"
      ],
      "termInfo": {
        "right atrium": {
          "text": "The upper-right chamber, which receives oxygen-poor blood returning from the body and passes it through the tricuspid valve.",
          "link": "wiki:Right atrium"
        },
        "right ventricle": {
          "text": "The lower-right chamber, which pumps oxygen-poor blood through the pulmonary valve toward the lungs.",
          "link": "wiki:Right ventricle"
        },
        "left atrium": {
          "text": "The upper-left chamber, which receives oxygen-rich blood from the lungs and passes it through the mitral valve.",
          "link": "wiki:Left atrium"
        },
        "left ventricle": {
          "text": "The thick-walled lower-left chamber, which pumps oxygen-rich blood through the aortic valve to the body.",
          "link": "wiki:Left ventricle",
          "extraLink": "https://www.mayoclinic.org/tests-procedures/echocardiogram/about/pac-20393856"
        }
      },
      "info": {
        "link": "wiki:Heart chamber",
        "extraLink": "https://www.mayoclinic.org/diseases-conditions/aortic-valve-disease/multimedia/chambers-and-valves-of-the-heart/img-20007497"
      }
    },
    {
      "name": "Heart valves",
      "color": "blue",
      "fact": "Four valves open and close as pressure changes, directing blood forward and preventing it from leaking backward between chambers or vessels.",
      "terms": [
        "tricuspid valve",
        "pulmonary valve",
        "mitral valve",
        "aortic valve"
      ],
      "seeds": [
        "mitral valve",
        "aortic valve"
      ],
      "termInfo": {
        "tricuspid valve": {
          "text": "The valve between the right atrium and right ventricle; it prevents blood from flowing backward into the atrium.",
          "link": "wiki:Tricuspid valve",
          "extraLink": "https://www.mayoclinic.org/diseases-conditions/tricuspid-valve-disease/symptoms-causes/syc-20350609"
        },
        "pulmonary valve": {
          "text": "The valve between the right ventricle and pulmonary artery, controlling blood flow from the heart toward the lungs.",
          "link": "wiki:Pulmonary valve",
          "extraLink": "https://www.mayoclinic.org/diseases-conditions/pulmonary-valve-disease/symptoms-causes/syc-20350654"
        },
        "mitral valve": {
          "text": "The valve between the left atrium and left ventricle; it is also called the bicuspid valve.",
          "link": "wiki:Mitral valve",
          "extraLink": "https://www.mayoclinic.org/diseases-conditions/mitral-valve-disease/symptoms-causes/syc-20355107"
        },
        "aortic valve": {
          "text": "The valve between the left ventricle and aorta, opening when the ventricle ejects blood to the body.",
          "link": "wiki:Aortic valve",
          "extraLink": "https://www.mayoclinic.org/diseases-conditions/aortic-valve-disease/symptoms-causes/syc-20355117"
        }
      },
      "info": {
        "link": "wiki:Heart valve",
        "extraLink": "https://www.mayoclinic.org/diseases-conditions/heart-valve-disease/symptoms-causes/syc-20353727"
      }
    },
    {
      "name": "Cardiac cycle",
      "color": "amber",
      "fact": "During diastole the ventricles relax and fill; during systole they contract and eject a stroke volume, which combines with heart rate to determine cardiac output.",
      "terms": [
        "systole",
        "diastole",
        "stroke volume",
        "cardiac output"
      ],
      "seeds": [
        "systole",
        "diastole"
      ],
      "termInfo": {
        "systole": {
          "text": "The contraction phase of the heartbeat, when ventricular pressure rises and blood is ejected.",
          "link": "wiki:Systole"
        },
        "diastole": {
          "text": "The relaxation and filling phase of the heartbeat, when ventricular pressure falls and blood enters the ventricles.",
          "link": "wiki:Diastole"
        },
        "stroke volume": {
          "text": "The amount of blood one ventricle ejects during a single heartbeat.",
          "link": "wiki:Stroke volume",
          "extraLink": "https://ce.mayo.edu/nursing/content/foundations-critical-care-nursing-online-cne-course-cardiac-concepts"
        },
        "cardiac output": {
          "text": "The volume of blood a ventricle pumps in one minute, equal to heart rate multiplied by stroke volume.",
          "link": "wiki:Cardiac output",
          "extraLink": "https://www.mayoclinic.org/tests-procedures/echocardiogram/about/pac-20393856"
        }
      },
      "info": {
        "link": "wiki:Cardiac cycle",
        "extraLink": "https://www.mayoclinic.org/tests-procedures/echocardiogram/about/pac-20393856"
      }
    }
  ],
  "bridges": [
    {
      "term": "one-way blood flow",
      "clusters": [
        0,
        1
      ],
      "relationKind": "dynamic",
      "fact": "One-way blood flow bridges chambers and valves: valves at the chamber openings direct blood from atria to ventricles and then out toward the lungs or body, while blocking reversal.",
      "info": {
        "text": "The forward sequence of blood through the heart, maintained by valves that close whenever flow begins to reverse.",
        "link": "wiki:Heart valve",
        "extraLink": "https://www.mayoclinic.org/diseases-conditions/heart-valve-disease/symptoms-causes/syc-20353727"
      }
    },
    {
      "term": "pressure gradient",
      "clusters": [
        1,
        2
      ],
      "relationKind": "dynamic",
      "fact": "Pressure gradient bridges valves and the cardiac cycle: a valve opens when pressure behind it exceeds pressure ahead, then closes when that difference reverses during filling or contraction.",
      "info": {
        "text": "A difference in pressure between two regions that drives blood from the higher-pressure side toward the lower-pressure side.",
        "link": "wiki:Pressure gradient",
        "extraLink": "https://www.mayoclinic.org/diseases-conditions/aortic-stenosis/symptoms-causes/syc-20353139"
      }
    }
  ]
};
