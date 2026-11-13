/* Raider AnatomyLab: course order comes from the course's Canvas modules. */
BioLab.COURSES = [
 {
  "id": "anatomy",finals:[{"t": "Anatomy & Physiology fall final review", "units": [0, 1, 2, 3, 4], "note": "Covers Units 1 to 5, through the muscular system. Your teacher decides what is on the final, so check the study guide."}],
  "name": "Anatomy &amp; Physiology",
  "blurb": "Tools in the order Anatomy &amp; Physiology covers them, one body system at a time.",
  "further": [
   "dissection"
  ],
  "units": [
   {
    "n": "Unit 1",
    "t": "Body terms, planes, cavities and organ systems",
    "ids": [
     "bodymap"
    ]
   },
   {
    "n": "Unit 2",
    "t": "Homeostasis",
    "ids": [
     "homeostasis"
    ]
   },
   {
    "n": "Unit 3",
    "t": "Integumentary system",
    "ids": [
     "skin"
    ],
    "note": "Touch Sense lab. The suture lab stays hands-on in class."
   },
   {
    "n": "Unit 4",
    "t": "Skeletal system",
    "ids": [
     "skeleton"
    ],
    "note": "Bones of the body, the long bone and the bone lab."
   },
   {
    "n": "Unit 5",
    "t": "Muscular system",
    "ids": [
     "muscles",
     "contraction",
     "movements"
    ],
    "note": "Major muscles, the sarcomere and the fatigue lab."
   },
   {
    "n": "Unit 6",
    "t": "Cardiovascular system",
    "ids": [
     "heart"
    ]
   },
   {
    "n": "Unit 7",
    "t": "Respiratory system",
    "ids": [
     "breathing",
     "transport"
    ],
    "note": "Breathing, gas exchange and diffusion."
   },
   {
    "n": "Unit 8",
    "t": "Nervous system",
    "ids": [
     "nsmap",
     "neuron",
     "reaction"
    ],
    "note": "Divisions, neurons, the brain and the reaction lab."
   }
  ]
 }
];
BioLab.TOPIC_ORDER = {"0": ["bodymap", "homeostasis", "egfr"], "1": ["skin"], "2": ["skeleton", "muscles", "movements", "contraction"], "3": ["heart", "breathing", "transport", "spirometry"], "4": ["nsmap", "neuron", "reaction"], "11": ["dissection"]};
BioLab.setSections({units:{},extra:{"0": "Body basics", "1": "Integumentary system", "2": "Skeletal and muscular systems", "3": "Cardiovascular and respiratory systems", "4": "Nervous system", "11": "Go further"},order:[0, 1, 2, 3, 4, 11],further:11,unitPrefix:''});
(function(){const P={"bodymap": 0, "homeostasis": 0, "skin": 1, "skeleton": 2, "muscles": 2, "movements": 2, "contraction": 2, "heart": 3, "breathing": 3, "transport": 3, "nsmap": 4, "neuron": 4, "reaction": 4, "dissection": 11, "egfr": 0, "spirometry": 3};BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();
