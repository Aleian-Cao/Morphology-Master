import { Tier, Lesson, Module, UserProgress } from './types';

// Helper to quickly generate lesson stubs. 
// Detailed content (metaphor, derivatives, parts) will be fetched via AI if missing.
const createLesson = (root: string, meaning: string, category: string, tier: number, idOverride?: string): Lesson => ({
  id: idOverride || `l_${root.toLowerCase()}`,
  title: `${root} (${meaning})`,
  root: root,
  meaning: meaning,
  category: category,
  tier: tier
});

// TIER 1: THE FOUNDATION
const TIER_1_MODULES: Module[] = [
  {
    id: "m1_neg",
    title: "Negative Prefixes (The 'Not' Squad)",
    description: "Learn how to say NO in fancy ways.",
    lessons: [
      {
        id: "l1_un",
        title: "UN- (Not/Reverse)",
        root: "UN-",
        meaning: "Not / Reverse action",
        category: "Negative",
        tier: 1,
        phonetic: "/ʌn/",
        metaphor: "A rewind button or a crossed-out sign."
      },
      createLesson("DIS-", "Apart/Away/Not", "Negative", 1),
      createLesson("IN-/IM-", "Not/In", "Negative", 1),
      createLesson("NON-", "Not", "Negative", 1),
      createLesson("MIS-", "Wrong/Bad", "Negative", 1),
    ]
  },
  {
    id: "m1_dir",
    title: "Direction & Time",
    description: "Navigation through space and time.",
    lessons: [
      createLesson("PRE-", "Before", "Time", 1),
      createLesson("POST-", "After", "Time", 1),
      createLesson("RE-", "Again/Back", "Direction", 1),
      createLesson("EX-", "Out", "Direction", 1),
      createLesson("INTER-", "Between", "Position", 1),
      createLesson("TRANS-", "Across", "Position", 1),
      createLesson("SUB-", "Under", "Position", 1),
      createLesson("SUPER-", "Above", "Position", 1),
    ]
  },
  {
    id: "m1_num",
    title: "Numbers & Quantity",
    description: "Counting with ancient words.",
    lessons: [
      createLesson("UNI-/MONO-", "One", "Numbers", 1),
      createLesson("BI-/DU-", "Two", "Numbers", 1),
      createLesson("TRI-", "Three", "Numbers", 1),
      createLesson("MULTI-/POLY-", "Many", "Numbers", 1),
      createLesson("SEMI-/HEMI-", "Half", "Numbers", 1),
    ]
  },
  {
    id: "m1_shape",
    title: "Suffix Shape Shifters",
    description: "Changing the grammar function.",
    lessons: [
      createLesson("-ER/-OR", "Person who does", "Noun Maker", 1),
      createLesson("-TION/-SION", "Action/State", "Noun Maker", 1),
      createLesson("-ABLE/-IBLE", "Able to be", "Adjective Maker", 1),
      createLesson("-IZE/-ATE", "To make/cause", "Verb Maker", 1),
      createLesson("-OUS/-FUL", "Full of", "Adjective Maker", 1),
    ]
  }
];

// TIER 2: THE CORE 50
const TIER_2_MODULES: Module[] = [
  {
    id: "m2_body",
    title: "Hand, Foot & Body",
    description: "Physical actions and body parts.",
    lessons: [
      createLesson("MAN", "Hand", "Body", 2),
      createLesson("PED/POD", "Foot", "Body", 2),
      createLesson("FAC/FIC", "Make/Do", "Action", 2),
      createLesson("CORP", "Body", "Body", 2),
      createLesson("CAP/CAPIT", "Head", "Body", 2),
      createLesson("DENT/DONT", "Tooth", "Body", 2),
      createLesson("CARD/CORD", "Heart", "Body", 2),
    ]
  },
  {
    id: "m2_senses",
    title: "See, Say & Sense",
    description: "Perception and communication.",
    lessons: [
      createLesson("SPEC/SPIC", "Look", "Senses", 2),
      createLesson("VID/VIS", "See", "Senses", 2),
      createLesson("AUD", "Hear", "Senses", 2),
      createLesson("DIC/DICT", "Speak", "Communication", 2),
      createLesson("VOC/VOK", "Voice/Call", "Communication", 2),
      createLesson("SCRIB/SCRIPT", "Write", "Communication", 2),
      createLesson("SENS/SENT", "Feel", "Senses", 2),
    ]
  },
  {
    id: "m2_move",
    title: "Movement & Action",
    description: "Roots that move things around.",
    lessons: [
      createLesson("PORT", "Carry", "Movement", 2),
      createLesson("JECT", "Throw", "Movement", 2),
      createLesson("TRACT", "Pull/Drag", "Movement", 2),
      createLesson("MIT/MISS", "Send", "Movement", 2),
      createLesson("DUC/DUCT", "Lead", "Movement", 2),
      createLesson("PEL/PULS", "Drive/Push", "Movement", 2),
      createLesson("VEN/VENT", "Come", "Movement", 2),
    ]
  },
  {
    id: "m2_elem",
    title: "Elemental Roots",
    description: "Earth, Water, Life, and Death.",
    lessons: [
      createLesson("AQUA/HYDR", "Water", "Nature", 2),
      createLesson("TERR/GEO", "Earth", "Nature", 2),
      createLesson("BIO", "Life", "Nature", 2),
      createLesson("VIV/VIT", "Life/Live", "Nature", 2),
      createLesson("MORT", "Death", "Nature", 2),
      createLesson("LUM/LUC", "Light", "Nature", 2),
      createLesson("THERM", "Heat", "Nature", 2),
    ]
  }
];

// TIER 3: EXPANSION 100
// Generating lists of roots for brevity, mapped to lesson objects
const STRUCTURE_ROOTS = ["STRUCT", "FORM", "MORPH", "RUPT", "PON/POS", "FIG", "HAB", "JOIN/JUNCT"];
const TIME_SPACE_ROOTS = ["CHRON", "TEMP", "LOC", "MEDI", "SURG", "VAC", "MIGR", "CED/CESS"];
const PEOPLE_ROOTS = ["DEMO", "POP", "ETHN", "ANTHROP", "GEN", "NAT", "PATR", "MATR"];
const MIND_ROOTS = ["PSYCH", "PATH", "PHIL", "PHOB", "MEM", "COG", "SCI", "PUT"];

const TIER_3_MODULES: Module[] = [
  {
    id: "m3_struct",
    title: "Structure & Form",
    description: "Building blocks of reality.",
    lessons: STRUCTURE_ROOTS.map(r => createLesson(r, "Shape/Build", "Structure", 3))
  },
  {
    id: "m3_time",
    title: "Time & Space II",
    description: "Advanced spatial concepts.",
    lessons: TIME_SPACE_ROOTS.map(r => createLesson(r, "Time/Place", "Space", 3))
  },
  {
    id: "m3_people",
    title: "People & Society",
    description: "Understanding humanity.",
    lessons: PEOPLE_ROOTS.map(r => createLesson(r, "People", "Society", 3))
  },
  {
    id: "m3_mind",
    title: "Mind & Feeling",
    description: "Psychology and emotion.",
    lessons: MIND_ROOTS.map(r => createLesson(r, "Mind/Feeling", "Psychology", 3))
  }
];

// TIER 4: MASTER 200
// Advanced Academic Roots
const ADVANCED_ROOTS = [
    "VER/VERI", "FID", "GREG", "SEQ/SEC", "AMB", "BELL", "BENE", "MAL", 
    "CID/CIS", "CLAM", "CLAUS/CLUD", "CRED", "CUR/CURS", "DOM", "DUR", 
    "EQU", "FER", "FLOR", "FLU", "FORT", "FRACT/FRAG", "GRAD/GRESS", 
    "GRAV", "HERB", "HOSP", "JUR/JUS", "LAB", "LEG/LECT", "LIBER", 
    "LOG/LOGU", "MAR", "MICRO", "MEGA", "MIN", "NAV", "NOV", 
    "OMNI", "OPER", "PAC", "PAN", "PEL", "PEND", "PHON", "PLAC", 
    "PRIM", "PROTO", "QUER/QUIS", "RAD", "RECT", "REG", "RID/RIS", 
    "SANCT", "SAT", "SCOP", "SIMIL", "SOL", "SON", "SOPH", "STRIN/STRICT", 
    "TACT/TANG", "TELE", "TEN/TAIN", "TERM", "TORT", "TOX", "TURB", 
    "URB", "VAC", "VAL", "VERB", "VERT/VERS", "VIA", "VINC/VICT", "VOL"
];

const TIER_4_MODULES: Module[] = [
    {
        id: "m4_adv",
        title: "Academic Mastery A-M",
        description: "Advanced roots for C1/C2 level usage.",
        lessons: ADVANCED_ROOTS.slice(0, 40).map(r => createLesson(r, "Advanced", "Academic", 4))
    },
    {
        id: "m4_adv2",
        title: "Academic Mastery N-Z",
        description: "Completing the 200+ root collection.",
        lessons: ADVANCED_ROOTS.slice(40).map(r => createLesson(r, "Advanced", "Academic", 4))
    }
];

export const CURRICULUM: Tier[] = [
  { id: 1, title: "TIER 1: THE FOUNDATION", description: "Master the toolkit: Prefixes and Suffixes.", modules: TIER_1_MODULES },
  { id: 2, title: "TIER 2: THE CORE 50", description: "High-frequency roots for survival.", modules: TIER_2_MODULES },
  { id: 3, title: "TIER 3: EXPANSION 100", description: "Academic and Business vocabulary.", modules: TIER_3_MODULES },
  { id: 4, title: "TIER 4: MASTER 200", description: "Complete etymological mastery.", modules: TIER_4_MODULES },
];

export const INITIAL_USER_PROGRESS: UserProgress = {
  xp: 0,
  completedLessons: [],
  unlockedTiers: [1],
  garden: {
    trees: 0,
    level: 1
  },
  assessments: []
};