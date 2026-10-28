import React, { useState } from 'react';
import { Volume2, Search, Sparkles, BookOpen, CheckCircle, HelpCircle, Layers, ArrowRight, BookmarkPlus, Check, Award, RefreshCw, Zap } from 'lucide-react';
import { User, UserProgress, CustomFlashcard, PhonicsDissection } from '../types';
import { analyzePhonicsWithAI } from '../services/geminiService';
import { AlphabetExplorer } from './AlphabetExplorer';
import { IPAPhoneticsChart } from './IPAPhoneticsChart';
import { soundFX } from '../utils/soundEffects';

interface PhonicsLabProps {
  user: User | null;
  customApiKey?: string;
  onUpdateProgress?: (progress: UserProgress) => void;
}

// Built-in verified dissection database for instantaneous zero-latency exploration
const CURATED_DISSECTIONS: Record<string, PhonicsDissection> = {
  information: {
    word: 'information',
    syllables: ['In', 'for', 'ma', 'tion'],
    stressIndex: 2,
    ipa: '/ˌɪn.fərˈmeɪ.ʃən/',
    vietnameseReading: 'in-phờ-MÂY-sần',
    translation: 'thông tin, kiến thức truyền tải',
    breakdown: [
      {
        syllable: 'In',
        type: 'Âm tiết đóng (CVC)',
        rule: 'Nguyên âm ngắn /ɪ/',
        ipa: '/ɪn/',
        isStressed: false,
        explanation: 'Nguyên âm I đứng trước phụ âm N khép lại -> đọc âm ngắn /ɪ/.'
      },
      {
        syllable: 'for',
        type: 'Bossy R + Âm lướt Schwa',
        rule: 'R-controlled lướt /fər/',
        ipa: '/fər/',
        isStressed: false,
        explanation: 'Âm tiết không nhận trọng âm nên Bossy R lướt nhẹ thành âm Schwa /fər/.'
      },
      {
        syllable: 'ma',
        type: 'Âm tiết mở (CV) nhận Trọng âm',
        rule: 'Nguyên âm dài /meɪ/',
        ipa: '/meɪ/',
        isStressed: true,
        explanation: 'Đứng ngay trước hậu tố -tion nên nhận trọng âm chính. Âm tiết mở (kết thúc bằng nguyên âm) -> đọc tên chữ cái /eɪ/.'
      },
      {
        syllable: 'tion',
        type: 'Cụm đuôi cố định',
        rule: 'Đuôi -tion -> /ʃən/',
        ipa: '/ʃən/',
        isStressed: false,
        explanation: 'Đuôi phổ biến đọc thành khối /ʃən/ (sần nhẹ).'
      }
    ],
    rulesApplied: [
      'Âm tiết đóng (CVC) đọc nguyên âm ngắn',
      'Bossy R lướt thành Schwa /ə/ ở âm không nhấn',
      'Trọng âm rơi vào âm tiết ngay trước -tion',
      'Âm tiết mở (CV) đọc nguyên âm dài',
      'Cụm đuôi cố định -tion đọc là /ʃən/'
    ]
  },
  banana: {
    word: 'banana',
    syllables: ['ba', 'na', 'na'],
    stressIndex: 1,
    ipa: '/bəˈnæn.ə/',
    vietnameseReading: 'bờ-NAN-nờ',
    translation: 'quả chuối',
    breakdown: [
      {
        syllable: 'ba',
        type: 'Âm lướt Schwa /ə/',
        rule: 'Âm không nhấn suy yếu',
        ipa: '/bə/',
        isStressed: false,
        explanation: 'Không nhận trọng âm -> biến thành âm lướt Schwa /ə/ ("bờ").'
      },
      {
        syllable: 'na',
        type: 'Âm tiết nhận Trọng âm (Short A)',
        rule: 'Đọc rõ /næn/',
        ipa: '/næn/',
        isStressed: true,
        explanation: 'Nhận trọng âm chính nên nguyên âm A được phát âm rõ ràng là /æ/.'
      },
      {
        syllable: 'na',
        type: 'Âm lướt Schwa /ə/',
        rule: 'Âm đuôi suy yếu',
        ipa: '/nə/',
        isStressed: false,
        explanation: 'Âm tiết cuối không nhấn -> đọc lướt thành âm Schwa /ə/ ("nờ").'
      }
    ],
    rulesApplied: [
      'Nguyên tắc vàng: Chỉ âm nhận trọng âm mới đọc rõ, âm còn lại suy yếu về Schwa /ə/',
      'Trọng âm rơi vào âm tiết thứ 2 trong từ 3 âm tiết thông dụng'
    ]
  },
  cake: {
    word: 'cake',
    syllables: ['cake'],
    stressIndex: 0,
    ipa: '/keɪk/',
    vietnameseReading: 'kếik',
    translation: 'bánh ngọt',
    breakdown: [
      {
        syllable: 'cake',
        type: 'Magic E (CVCe)',
        rule: 'Nguyên âm dài /eɪ/ + E câm',
        ipa: '/keɪk/',
        isStressed: true,
        explanation: 'Chữ E ở cuối câm, làm nguyên âm A đọc thành tên chữ cái ABC (/eɪ/). Phụ âm C đứng trước A đọc cứng /k/.'
      }
    ],
    rulesApplied: [
      'Magic E (CVCe): Chữ E cuối câm biến nguyên âm thành âm dài',
      'Quy tắc C cứng: C đứng trước A đọc là /k/'
    ]
  },
  gym: {
    word: 'gym',
    syllables: ['gym'],
    stressIndex: 0,
    ipa: '/dʒɪm/',
    vietnameseReading: 'dim (dʒ)',
    translation: 'phòng tập thể hình',
    breakdown: [
      {
        syllable: 'gym',
        type: 'G mềm (Soft G) + CVC',
        rule: 'G trước Y đọc /dʒ/ + Y đọc như I ngắn /ɪ/',
        ipa: '/dʒɪm/',
        isStressed: true,
        explanation: 'Quy tắc G mềm: Khi G đứng trước E, I, Y thì đọc là /dʒ/. Chữ Y đóng vai trò nguyên âm ngắn /ɪ/.'
      }
    ],
    rulesApplied: [
      'Quy tắc G mềm: G đứng trước Y đọc là /dʒ/',
      'Âm tiết đóng CVC đọc nguyên âm ngắn'
    ]
  },
  knife: {
    word: 'knife',
    syllables: ['knife'],
    stressIndex: 0,
    ipa: '/naɪf/',
    vietnameseReading: 'nai-ph',
    translation: 'con dao',
    breakdown: [
      {
        syllable: 'knife',
        type: 'Âm câm (Silent K) + Magic E',
        rule: 'kn- câm K + i_e đọc /aɪ/',
        ipa: '/naɪf/',
        isStressed: true,
        explanation: 'Tổ hợp kn- đầu từ thì K câm, chỉ đọc N. Đuôi -ife áp dụng Magic E đọc I dài /aɪ/.'
      }
    ],
    rulesApplied: [
      'Âm câm: kn- đứng đầu từ câm chữ K',
      'Magic E (CVCe): i_e đọc là /aɪ/'
    ]
  },
  circle: {
    word: 'circle',
    syllables: ['cir', 'cle'],
    stressIndex: 0,
    ipa: '/ˈsɜːr.kəl/',
    vietnameseReading: 'sơr-kồ',
    translation: 'hình tròn, vòng tròn',
    breakdown: [
      {
        syllable: 'cir',
        type: 'C mềm + Bossy R (ir)',
        rule: 'C trước I đọc /s/ + ir đọc /ɜːr/',
        ipa: '/sɜːr/',
        isStressed: true,
        explanation: 'C đứng trước I đọc là C mềm /s/. Tổ hợp ir là Bossy R đọc cong lưỡi /ɜːr/.'
      },
      {
        syllable: 'cle',
        type: 'Đuôi cố định -cle',
        rule: 'Đọc là /kəl/',
        ipa: '/kəl/',
        isStressed: false,
        explanation: 'Cụm đuôi cố định phụ âm + le (-cle) đọc thành khối /kəl/ ("cồ").'
      }
    ],
    rulesApplied: [
      'Quy tắc C mềm: C đứng trước I đọc là /s/',
      'Bossy R: ir đọc là /ɜːr/',
      'Cụm đuôi cố định: -cle đọc là /kəl/'
    ]
  },
  nature: {
    word: 'nature',
    syllables: ['na', 'ture'],
    stressIndex: 0,
    ipa: '/ˈneɪ.tʃər/',
    vietnameseReading: 'NÂY-chờ',
    translation: 'tự nhiên, bản chất',
    breakdown: [
      {
        syllable: 'na',
        type: 'Âm tiết mở (CV) nhận trọng âm',
        rule: 'Nguyên âm dài /neɪ/',
        ipa: '/neɪ/',
        isStressed: true,
        explanation: 'Từ 2 âm tiết là danh từ nhấn âm 1. Âm tiết mở (kết thúc bằng nguyên âm A) đọc âm dài /eɪ/.'
      },
      {
        syllable: 'ture',
        type: 'Cụm đuôi cố định -ture',
        rule: 'Đọc là /tʃər/',
        ipa: '/tʃər/',
        isStressed: false,
        explanation: 'Cụm đuôi -ture cố định đọc là /tʃər/ ("chờ" cong lưỡi nhẹ).'
      }
    ],
    rulesApplied: [
      'Quy tắc 2 âm tiết: Danh từ nhấn âm 1',
      'Âm tiết mở (CV) đọc nguyên âm dài',
      'Cụm đuôi cố định -ture đọc là /tʃər/'
    ]
  },
  delicious: {
    word: 'delicious',
    syllables: ['de', 'li', 'cious'],
    stressIndex: 1,
    ipa: '/dɪˈlɪʃ.əs/',
    vietnameseReading: 'đi-LÍT-sợt-s',
    translation: 'thơm ngon',
    breakdown: [
      {
        syllable: 'de',
        type: 'Âm không nhấn',
        rule: 'Đọc lướt /dɪ/',
        ipa: '/dɪ/',
        isStressed: false,
        explanation: 'Âm tiết không nhận trọng âm nên nguyên âm e đọc yếu thành /ɪ/.'
      },
      {
        syllable: 'li',
        type: 'Âm tiết nhận trọng âm',
        rule: 'Đọc rõ /lɪʃ/ (kết hợp với ci)',
        ipa: '/lɪʃ/',
        isStressed: true,
        explanation: 'Đứng trước đuôi -ious nên nhận trọng âm chính. C biến âm thành /ʃ/ đi liền.'
      },
      {
        syllable: 'cious',
        type: 'Cụm đuôi -ous + C biến âm',
        rule: 'Đọc là /əs/',
        ipa: '/əs/',
        isStressed: false,
        explanation: 'Đuôi -ous đọc thành /əs/ ("ợt-s").'
      }
    ],
    rulesApplied: [
      'Trọng âm rơi vào âm tiết đứng trước -ious',
      'C đứng trước i kết hợp nguyên âm đôi biến thành âm /ʃ/',
      'Cụm đuôi -ous đọc là /əs/'
    ]
  },
  doubt: {
    word: 'doubt',
    syllables: ['doubt'],
    stressIndex: 0,
    ipa: '/daʊt/',
    vietnameseReading: 'đao-t',
    translation: 'sự nghi ngờ',
    breakdown: [
      {
        syllable: 'doubt',
        type: 'Âm câm -bt + Nguyên âm đôi ou',
        rule: 'ou đọc /aʊ/, b câm',
        ipa: '/daʊt/',
        isStressed: true,
        explanation: 'Tổ hợp -bt cuối từ thì chữ B câm. Nguyên âm đôi ou đọc là /aʊ/.'
      }
    ],
    rulesApplied: [
      'Âm câm: -bt cuối từ câm chữ B',
      'Nguyên âm đôi: ou đọc là /aʊ/'
    ]
  },
  education: {
    word: 'education',
    syllables: ['ed', 'u', 'ca', 'tion'],
    stressIndex: 2,
    ipa: '/ˌedʒ.ʊˈkeɪ.ʃən/',
    vietnameseReading: 'et-du-KÂY-sần',
    translation: 'nền giáo dục, đào tạo',
    breakdown: [
      {
        syllable: 'ed',
        type: 'Âm tiết đóng CVC',
        rule: 'E ngắn /edʒ/ (biến âm d)',
        ipa: '/edʒ/',
        isStressed: false,
        explanation: 'E đọc ngắn /e/.'
      },
      {
        syllable: 'u',
        type: 'Âm lướt không nhấn',
        rule: 'Đọc nhẹ /ʊ/',
        ipa: '/ʊ/',
        isStressed: false,
        explanation: 'Âm tiết không nhận trọng âm.'
      },
      {
        syllable: 'ca',
        type: 'Âm tiết mở nhận trọng âm',
        rule: 'C cứng /k/ + A dài /eɪ/',
        ipa: '/keɪ/',
        isStressed: true,
        explanation: 'Đứng ngay trước -tion nên nhận trọng âm chính. C trước A đọc cứng /k/, A mở đọc /eɪ/.'
      },
      {
        syllable: 'tion',
        type: 'Cụm đuôi cố định',
        rule: 'Đuôi -tion -> /ʃən/',
        ipa: '/ʃən/',
        isStressed: false,
        explanation: 'Cụm đuôi cố định đọc là /ʃən/.'
      }
    ],
    rulesApplied: [
      'Trọng âm rơi vào âm tiết đứng ngay trước -tion',
      'C đứng trước A đọc là C cứng /k/',
      'Âm tiết mở (CV) nhận trọng âm đọc nguyên âm dài',
      'Cụm đuôi cố định -tion đọc là /ʃən/'
    ]
  }
};

const SAMPLE_WORDS = [
  { word: 'information', tag: 'Từ mẫu 4 bước' },
  { word: 'banana', tag: 'Âm Schwa /ə/' },
  { word: 'cake', tag: 'Magic E (CVCe)' },
  { word: 'gym', tag: 'G mềm trước Y' },
  { word: 'circle', tag: 'C mềm + Bossy R' },
  { word: 'knife', tag: 'Âm câm kn-' },
  { word: 'nature', tag: 'Đuôi -ture' },
  { word: 'delicious', tag: 'Đuôi -ous' },
  { word: 'doubt', tag: 'Âm câm -bt' },
  { word: 'education', tag: 'Đuôi -tion' }
];

export const PhonicsLab: React.FC<PhonicsLabProps> = ({ user, customApiKey, onUpdateProgress }) => {
  const [activeTab, setActiveTab] = useState<'alphabet' | 'ipa' | 'dissector' | 'handbook' | 'quiz'>('alphabet');
  const [inputWord, setInputWord] = useState('');
  const [currentDissection, setCurrentDissection] = useState<PhonicsDissection>(CURATED_DISSECTIONS['information']);
  const [analyzing, setAnalyzing] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(0.9);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<Record<number, number>>({});
  const [handbookSection, setHandbookSection] = useState<'vowels' | 'consonants' | 'stress' | 'suffixes'>('vowels');

  // Text-To-Speech using native Web Speech Synthesis
  const playSpeech = (text: string, rate: number = audioSpeed) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDissectWord = async (wordToTest: string) => {
    const clean = wordToTest.trim().toLowerCase();
    if (!clean) return;
    setInputWord(clean);

    // 1. Instant check in curated database
    if (CURATED_DISSECTIONS[clean]) {
      setCurrentDissection(CURATED_DISSECTIONS[clean]);
      playSpeech(clean);
      return;
    }

    // 2. Otherwise run AI / Algorithmic dissection
    setAnalyzing(true);
    try {
      const aiResult = await analyzePhonicsWithAI(clean, customApiKey);
      if (aiResult && aiResult.syllables && aiResult.syllables.length > 0) {
        setCurrentDissection(aiResult);
        playSpeech(clean);
      } else {
        // Fallback rule-based estimation
        const fallback = generateAlgorithmicDissection(clean);
        setCurrentDissection(fallback);
        playSpeech(clean);
      }
    } catch (e) {
      const fallback = generateAlgorithmicDissection(clean);
      setCurrentDissection(fallback);
      playSpeech(clean);
    } finally {
      setAnalyzing(false);
    }
  };

  // Algorithmic rule-based dissection fallback for any arbitrary word
  const generateAlgorithmicDissection = (word: string): PhonicsDissection => {
    // Basic syllable splitter
    const clean = word.toLowerCase();
    const parts = clean.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi) || [clean];
    const rulesFound: string[] = [];

    // Check Magic E
    if (clean.endsWith('e') && clean.length >= 4 && !/[aeiouy]e$/i.test(clean)) {
      rulesFound.push('Magic E (CVCe): Chữ E cuối câm biến nguyên âm đứng trước thành âm dài');
    }
    // Check C/G
    if (/[cg][eiy]/i.test(clean)) {
      rulesFound.push('Quy tắc C/G mềm: C/G đứng trước E, I, Y phát âm mềm (/s/, /dʒ/)');
    }
    if (/[cg][aou]/i.test(clean)) {
      rulesFound.push('Quy tắc C/G cứng: C/G đứng trước A, O, U phát âm cứng (/k/, /g/)');
    }
    // Check Silent letters
    if (clean.startsWith('kn')) rulesFound.push('Âm câm: kn- đứng đầu từ câm K, đọc N');
    if (clean.startsWith('wr')) rulesFound.push('Âm câm: wr- đứng đầu từ câm W, đọc R');
    if (clean.endsWith('mb') || clean.endsWith('bt')) rulesFound.push('Âm câm: -mb / -bt cuối từ câm B');
    // Check Suffixes
    if (clean.endsWith('tion') || clean.endsWith('sion')) rulesFound.push('Cụm đuôi cố định: -tion/-sion đọc /ʃən/, trọng âm rơi vào âm ngay trước nó');
    if (clean.endsWith('ture')) rulesFound.push('Cụm đuôi cố định: -ture đọc /tʃər/');
    if (clean.endsWith('ous')) rulesFound.push('Cụm đuôi cố định: -ous đọc /əs/');

    if (rulesFound.length === 0) {
      rulesFound.push('Áp dụng nguyên tắc CVC (âm ngắn) và CV (âm mở dài)');
    }

    const stressIdx = Math.max(0, Math.min(parts.length - 2, 0));

    return {
      word: clean,
      syllables: parts.length > 0 ? parts : [clean],
      stressIndex: stressIdx,
      ipa: `/${clean}/`,
      vietnameseReading: parts.join('-'),
      translation: 'Từ vựng tiếng Anh',
      breakdown: parts.map((s, idx) => ({
        syllable: s,
        type: idx === stressIdx ? 'Nhận trọng âm chính' : 'Âm tiết bổ trợ',
        rule: 'Quy luật Phonics cấu trúc âm tiết',
        ipa: `/${s}/`,
        isStressed: idx === stressIdx,
        explanation: `Phân tích âm tiết "${s}" theo cấu trúc nguyên âm và phụ âm liền kề.`
      })),
      rulesApplied: rulesFound
    };
  };

  const handleSaveToFlashcard = () => {
    if (!user || !onUpdateProgress) return;
    soundFX.playXpGain();
    const newCard: CustomFlashcard = {
      id: 'fc_phonics_' + Date.now(),
      word: currentDissection.word,
      translation: `${currentDissection.vietnameseReading} (${currentDissection.translation})`,
      createdAt: new Date().toISOString()
    };
    const currentList = user.progress.customFlashcards || [];
    onUpdateProgress({
      ...user.progress,
      customFlashcards: [newCard, ...currentList.filter(c => c.word.toLowerCase() !== currentDissection.word.toLowerCase())]
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const QUIZ_QUESTIONS = [
    {
      q: 'Trong từ "cake", chữ "a" được phát âm theo quy tắc nào?',
      options: [
        'Âm ngắn /æ/ vì là âm tiết đóng CVC',
        'Âm dài /eɪ/ vì có chữ "e" câm ở cuối (Magic E)',
        'Âm Schwa /ə/ vì không nhấn trọng âm',
        'Âm cong lưỡi /ɑːr/ theo Bossy R'
      ],
      correct: 1,
      exp: 'Chữ E ở cuối từ cake là Magic E (CVCe) câm, biến nguyên âm A thành âm dài /eɪ/ (đọc như tên chữ cái ABC).'
    },
    {
      q: 'Chữ "G" trong từ "gym" và "giant" phát âm là gì và tại sao?',
      options: [
        'Đọc là /g/ vì đứng đầu từ',
        'Đọc là /dʒ/ (G mềm) vì đứng trước y và i',
        'Đọc là /k/ theo quy tắc cứng',
        'Là âm câm không phát âm'
      ],
      correct: 1,
      exp: 'Khi G đứng trước e, i, y, nó biến thành âm mềm /dʒ/ (như gym, giant, page).'
    },
    {
      q: 'Từ "education" có trọng âm rơi vào âm tiết nào?',
      options: [
        'Âm tiết 1: "ed"',
        'Âm tiết 2: "u"',
        'Âm tiết 3: "ca" (ngay trước đuôi -tion)',
        'Âm tiết 4: "tion"'
      ],
      correct: 2,
      exp: 'Quy tắc hậu tố: Các từ có đuôi -tion, -sion luôn có trọng âm rơi vào âm tiết NGAY TRƯỚC nó (e-du-CA-tion).'
    },
    {
      q: 'Chữ cái nào bị cÂM trong các từ "knife", "know", "knee"?',
      options: [
        'Chữ F',
        'Chữ K (tổ hợp kn- đầu từ)',
        'Chữ N',
        'Chữ E'
      ],
      correct: 1,
      exp: 'Tổ hợp kn- ở đầu từ luôn câm chữ K, chỉ phát âm chữ N.'
    },
    {
      q: 'Tại sao trong từ "banana", hai chữ "a" ở đầu và cuối lại đọc là /ə/ (bờ-nan-nờ)?',
      options: [
        'Vì chúng là Magic E',
        'Vì không nhận trọng âm nên bị lướt thành âm yếu Schwa /ə/',
        'Vì đứng cạnh phụ âm n',
        'Vì là quy tắc Bossy R'
      ],
      correct: 1,
      exp: 'Nguyên tắc vàng: Chỉ âm tiết nhận trọng âm (na thứ hai) mới đọc rõ /æ/. Các âm tiết không nhận trọng âm sẽ bị làm yếu đi thành âm Schwa /ə/ ("ờ" nhẹ).'
    },
    {
      q: 'Trong bảng chữ cái tiếng Anh, tên gọi của chữ cái "E" được phát âm chuẩn là gì?',
      options: [
        'Đọc là "e" như tiếng Việt',
        'Đọc là /iː/ (âm "i" kéo dài cười tươi)',
        'Đọc là /aɪ/ (như "ai")',
        'Đọc là /juː/ (như "diu")'
      ],
      correct: 1,
      exp: 'Chữ E có tên gọi là /iː/ ("i"), trong khi chữ I mới có tên gọi là /aɪ/ ("ai"). Đây là nhầm lẫn phổ biến nhất của người Việt!'
    },
    {
      q: 'Cách đọc tên chữ cái "H" nào sau đây là CHUẨN XÁC 100%?',
      options: [
        'Đọc là "hát" theo thói quen',
        'Đọc là /eɪtʃ/ ("ây-ch" bật hơi âm /tʃ/ ở cuối)',
        'Đọc là /hɑː/ không có âm đuôi',
        'Đọc là /hæk/'
      ],
      correct: 1,
      exp: 'Chữ cái H có tên chuẩn quốc tế là /eɪtʃ/ (bắt đầu bằng âm "ây" và kết thúc bằng âm bật gió /tʃ/). Tuyệt đối không đọc là "hát"!'
    }
  ];

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizAnswered[qIdx] !== undefined) return;
    setQuizAnswered(prev => ({ ...prev, [qIdx]: optIdx }));
    const isCorrect = optIdx === QUIZ_QUESTIONS[qIdx].correct;
    if (isCorrect) {
      soundFX.playCorrect();
      soundFX.playXpGain();
      setQuizScore(prev => prev + 1);
      if (user && onUpdateProgress) {
        onUpdateProgress({
          ...user.progress,
          xp: user.progress.xp + 50
        });
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <BookOpen size={240} />
        </div>
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-200 mb-3">
            <Sparkles size={14} /> Hệ thống phát âm & quy luật Phonics toàn diện
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight">
            Cách Đọc Chữ Cái, Bảng IPA & Phonics
          </h1>
          <p className="text-amber-100 text-sm md:text-base leading-relaxed">
            Nắm vững cách đọc 26 chữ cái với ví dụ sinh động, tra cứu bảng 44 âm quốc tế IPA và áp dụng 4 quy luật cấu trúc âm tiết để đọc chuẩn ngay 80–85% từ vựng tiếng Anh mà không cần tra từ điển!
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/20">
          <button
            onClick={() => setActiveTab('alphabet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'alphabet'
                ? 'bg-white text-stone-900 shadow-lg scale-105'
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
          >
            <span>🔤 26 Chữ Cái (Ví Dụ Sinh Động)</span>
          </button>
          <button
            onClick={() => setActiveTab('ipa')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'ipa'
                ? 'bg-white text-stone-900 shadow-lg scale-105'
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
          >
            <span>🎙️ Bảng Phiên Âm IPA (44 Âm)</span>
          </button>
          <button
            onClick={() => setActiveTab('dissector')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'dissector'
                ? 'bg-white text-stone-900 shadow-lg scale-105'
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
          >
            <Zap size={15} /> 🧪 Mổ Xẻ Âm Tiết
          </button>
          <button
            onClick={() => setActiveTab('handbook')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'handbook'
                ? 'bg-white text-stone-900 shadow-lg scale-105'
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
          >
            <BookOpen size={15} /> 📖 4 Quy Luật Cốt Lõi
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'quiz'
                ? 'bg-white text-stone-900 shadow-lg scale-105'
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
          >
            <Award size={15} /> 🎯 Luyện Tập ({quizScore}/{QUIZ_QUESTIONS.length})
          </button>
        </div>
      </div>

      {/* TAB 0: ALPHABET EXPLORER */}
      {activeTab === 'alphabet' && (
        <AlphabetExplorer
          user={user}
          onUpdateProgress={onUpdateProgress}
          onSelectWordToDissect={(w) => {
            setActiveTab('dissector');
            handleDissectWord(w);
          }}
        />
      )}

      {/* TAB 0.5: IPA PHONETICS CHART */}
      {activeTab === 'ipa' && (
        <IPAPhoneticsChart
          user={user}
          onUpdateProgress={onUpdateProgress}
          onSelectWordToDissect={(w) => {
            setActiveTab('dissector');
            handleDissectWord(w);
          }}
        />
      )}

      {/* TAB 1: DISSECTOR */}
      {activeTab === 'dissector' && (
        <div className="space-y-6">
          {/* Search bar & Quick chips */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-stone-400" size={20} />
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDissectWord(inputWord)}
                  placeholder="Nhập bất kỳ từ tiếng Anh nào (VD: information, nature, chocolate, gym)..."
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl font-medium text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <button
                onClick={() => handleDissectWord(inputWord)}
                disabled={analyzing}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {analyzing ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Mổ Xẻ Quy Luật
              </button>
            </div>

            {/* Quick chips */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Hoặc thử nhanh các từ mẫu tiêu biểu:
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_WORDS.map((item) => (
                  <button
                    key={item.word}
                    onClick={() => handleDissectWord(item.word)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      currentDissection.word.toLowerCase() === item.word
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-stone-50 hover:bg-amber-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span className="font-bold capitalize">{item.word}</span>
                    <span className="text-[10px] opacity-75">({item.tag})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dissection Result Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            {/* Header info */}
            <div className="p-6 md:p-8 border-b border-stone-100 bg-gradient-to-b from-stone-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight text-stone-900 capitalize">
                    {currentDissection.word}
                  </h2>
                  <button
                    onClick={() => playSpeech(currentDissection.word)}
                    title="Nghe phát âm chuẩn"
                    className="p-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full transition-all shadow-sm active:scale-95"
                  >
                    <Volume2 size={24} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-stone-600">
                  <span className="font-mono text-lg font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                    {currentDissection.ipa}
                  </span>
                  <span className="text-stone-500 text-sm">
                    Đọc tương đương: <strong className="text-stone-800 italic">{currentDissection.vietnameseReading}</strong>
                  </span>
                  <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-medium">
                    {currentDissection.translation}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
                  <span className="px-2">Tốc độ:</span>
                  <button
                    onClick={() => setAudioSpeed(0.7)}
                    className={`px-2 py-1 rounded-lg transition-all ${audioSpeed === 0.7 ? 'bg-white shadow text-stone-900 font-bold' : ''}`}
                  >
                    0.7x
                  </button>
                  <button
                    onClick={() => setAudioSpeed(1.0)}
                    className={`px-2 py-1 rounded-lg transition-all ${audioSpeed === 1.0 ? 'bg-white shadow text-stone-900 font-bold' : ''}`}
                  >
                    1.0x
                  </button>
                </div>

                <button
                  onClick={handleSaveToFlashcard}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                    savedSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {savedSuccess ? <Check size={16} /> : <BookmarkPlus size={16} />}
                  {savedSuccess ? 'Đã lưu vào FC!' : 'Lưu vào Flashcard'}
                </button>
              </div>
            </div>

            {/* Step-by-step 4-step Phonics Formula */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Step 1: Syllable Splitting */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h3 className="font-bold text-stone-800 text-base uppercase tracking-wider">
                    Bước 1: "Chẻ" từ thành các âm tiết
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  {currentDissection.syllables.map((syl, idx) => {
                    const isStressed = idx === currentDissection.stressIndex;
                    return (
                      <React.Fragment key={idx}>
                        <button
                          onClick={() => playSpeech(syl)}
                          className={`group px-5 py-3 rounded-xl border text-center transition-all shadow-sm ${
                            isStressed
                              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 scale-105'
                              : 'bg-white hover:bg-amber-50 border-stone-300 text-stone-800'
                          }`}
                        >
                          <div className="text-xl font-black font-serif tracking-wide">{syl}</div>
                          <div className={`text-[10px] uppercase font-bold mt-1 ${isStressed ? 'text-amber-100' : 'text-stone-400 group-hover:text-amber-600'}`}>
                            {isStressed ? 'Trọng âm ★' : `Âm tiết ${idx + 1}`}
                          </div>
                        </button>
                        {idx < currentDissection.syllables.length - 1 && (
                          <span className="text-stone-300 font-bold text-xl">•</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Stress location */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="font-bold text-stone-800 text-base uppercase tracking-wider">
                    Bước 2: Tìm vị trí Trọng âm (Stress)
                  </h3>
                </div>
                <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm mb-1">
                      Trọng âm chính rơi vào âm tiết thứ {currentDissection.stressIndex + 1}: <span className="text-amber-700 uppercase font-mono text-base font-black">"{currentDissection.syllables[currentDissection.stressIndex]}"</span>
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {currentDissection.syllables.length === 1
                        ? 'Từ đơn âm tiết, trọng âm rơi vào chính nó.'
                        : 'Âm tiết nhận trọng âm sẽ được phát âm to, rõ, ngân dài và đọc đúng theo quy tắc nguyên âm cốt lõi. Các âm tiết còn lại sẽ bị lướt nhẹ (Schwa /ə/ hoặc /ɪ/).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Breakdown per syllable */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h3 className="font-bold text-stone-800 text-base uppercase tracking-wider">
                    Bước 3: Ghép quy luật Phonics cho từng âm tiết
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDissection.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        item.isStressed
                          ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200 shadow-sm'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-serif font-black text-stone-900">
                            {item.syllable}
                          </span>
                          <button
                            onClick={() => playSpeech(item.syllable)}
                            className="p-1 text-stone-400 hover:text-amber-600 transition-colors"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                        <span className="font-mono text-sm font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                          {item.ipa}
                        </span>
                      </div>

                      <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-stone-100 text-stone-700 mb-2">
                        {item.type}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Summary of Applied Rules */}
              <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-900 text-xs font-bold flex items-center justify-center">4</span>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-amber-300">
                    Bước 4: Đọc ghép hoàn chỉnh & Các quy luật áp dụng
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-stone-800">
                  <div>
                    <div className="text-2xl font-serif font-bold text-white tracking-wide">
                      {currentDissection.ipa}
                    </div>
                    <div className="text-stone-400 text-xs mt-0.5">
                      Đọc như: <strong className="text-amber-300 italic">{currentDissection.vietnameseReading}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => playSpeech(currentDissection.word)}
                    className="bg-amber-500 hover:bg-amber-400 text-stone-900 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 self-start transition-all shadow-md"
                  >
                    <Volume2 size={18} /> Nghe phát âm đầy đủ
                  </button>
                </div>

                <div className="pt-3 border-t border-stone-800">
                  <p className="text-stone-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                    Tổng kết quy luật nhận diện trong từ này:
                  </p>
                  <ul className="space-y-1">
                    {currentDissection.rulesApplied.map((r, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2 text-xs text-stone-300">
                        <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HANDBOOK (4 Core Rules) */}
      {activeTab === 'handbook' && (
        <div className="space-y-6">
          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
            {[
              { id: 'vowels', label: '1. Nguyên Âm theo Âm Tiết (C & V)' },
              { id: 'consonants', label: '2. Phụ Âm & Tổ Hợp (Digraphs / Câm)' },
              { id: 'stress', label: '3. Trọng Âm & Âm Lướt Schwa /ə/' },
              { id: 'suffixes', label: '4. Cụm Đuôi Cố Định' }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setHandbookSection(sub.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  handbookSection === sub.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Section 1: Vowels */}
          {handbookSection === 'vowels' && (
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                    1. Quy luật Nguyên âm theo Cấu trúc Âm tiết (C = Phụ âm, V = Nguyên âm)
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Cách phát âm của 5 nguyên âm (<strong>A, E, I, O, U</strong>) phụ thuộc trực tiếp vào các chữ cái đứng ngay sau nó.
                  </p>
                </div>

                {/* Detailed Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 text-xs uppercase tracking-wider border-b border-stone-200">
                        <th className="p-4 rounded-tl-xl">Cấu trúc</th>
                        <th className="p-4">Quy tắc nhận diện</th>
                        <th className="p-4">Cách đọc nguyên âm</th>
                        <th className="p-4 rounded-tr-xl">Ví dụ thực tế (Bấm nghe)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-4 font-bold text-stone-900">
                          1. Âm tiết đóng (CVC)
                        </td>
                        <td className="p-4 text-stone-600">
                          Nguyên âm bị kẹp giữa hoặc chặn đứng bởi phụ âm ở cuối.
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                            Nguyên âm ngắn (Short Vowel)
                          </span>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex flex-wrap gap-1.5">
                            {['cat', 'bed', 'sit', 'hot', 'cup'].map((w) => (
                              <button
                                key={w}
                                onClick={() => playSpeech(w)}
                                className="px-2 py-1 bg-stone-100 hover:bg-amber-200 rounded text-xs font-mono font-bold text-stone-800 flex items-center gap-1"
                              >
                                {w} <Volume2 size={12} className="opacity-60" />
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-stone-500">
                            a → /æ/, e → /e/, i → /ɪ/, o → /ɒ/, u → /ʌ/
                          </p>
                        </td>
                      </tr>

                      <tr className="hover:bg-amber-50/30 transition-colors bg-stone-50/40">
                        <td className="p-4 font-bold text-stone-900">
                          2. Magic E (CVCe)
                        </td>
                        <td className="p-4 text-stone-600">
                          Có chữ <strong>e</strong> ở cuối từ (chữ e này câm, làm biến đổi nguyên âm trước).
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">
                            Nguyên âm dài (Long Vowel)
                          </span>
                          <p className="text-xs text-stone-500 mt-1">Đọc y hệt tên chữ cái bảng ABC</p>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex flex-wrap gap-1.5">
                            {['cake', 'theme', 'site', 'note', 'cute'].map((w) => (
                              <button
                                key={w}
                                onClick={() => playSpeech(w)}
                                className="px-2 py-1 bg-stone-100 hover:bg-orange-200 rounded text-xs font-mono font-bold text-stone-800 flex items-center gap-1"
                              >
                                {w} <Volume2 size={12} className="opacity-60" />
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-stone-500">
                            cat → c<b>ake</b>, sit → s<b>ite</b>, cut → c<b>ute</b>
                          </p>
                        </td>
                      </tr>

                      <tr className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-4 font-bold text-stone-900">
                          3. Âm tiết mở (CV)
                        </td>
                        <td className="p-4 text-stone-600">
                          Âm tiết kết thúc ngay bằng một nguyên âm (không có phụ âm chặn đuôi).
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            Nguyên âm dài (Long Vowel)
                          </span>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex flex-wrap gap-1.5">
                            {['go', 'no', 'hi', 'me', 'baby', 'paper'].map((w) => (
                              <button
                                key={w}
                                onClick={() => playSpeech(w)}
                                className="px-2 py-1 bg-stone-100 hover:bg-blue-200 rounded text-xs font-mono font-bold text-stone-800 flex items-center gap-1"
                              >
                                {w} <Volume2 size={12} className="opacity-60" />
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-stone-500">
                            ba-by (/ˈbeɪ.bi/), pa-per (/ˈpeɪ.pər/)
                          </p>
                        </td>
                      </tr>

                      <tr className="hover:bg-amber-50/30 transition-colors bg-stone-50/40">
                        <td className="p-4 font-bold text-stone-900">
                          4. Nguyên âm đôi (CVVC)
                        </td>
                        <td className="p-4 text-stone-600">
                          2 nguyên âm đi liền nhau (<em>"Chữ đầu lên tiếng, chữ hai câm"</em>).
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                            Âm đôi theo chữ đầu
                          </span>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex flex-wrap gap-1.5">
                            {['rain', 'meat', 'boat', 'coin', 'house'].map((w) => (
                              <button
                                key={w}
                                onClick={() => playSpeech(w)}
                                className="px-2 py-1 bg-stone-100 hover:bg-purple-200 rounded text-xs font-mono font-bold text-stone-800 flex items-center gap-1"
                              >
                                {w} <Volume2 size={12} className="opacity-60" />
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-stone-500">
                            ai/ay → /eɪ/, ee/ea → /iː/, oa/ow → /əʊ/, oi/oy → /ɔɪ/
                          </p>
                        </td>
                      </tr>

                      <tr className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-4 font-bold text-stone-900">
                          5. Bossy R (R-controlled)
                        </td>
                        <td className="p-4 text-stone-600">
                          Nguyên âm có chữ <strong>r</strong> đứng ngay sau, chữ r làm biến dạng âm gốc.
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                            Đọc cong lưỡi cố định
                          </span>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="flex flex-wrap gap-1.5">
                            {['car', 'fork', 'bird', 'turn', 'her'].map((w) => (
                              <button
                                key={w}
                                onClick={() => playSpeech(w)}
                                className="px-2 py-1 bg-stone-100 hover:bg-emerald-200 rounded text-xs font-mono font-bold text-stone-800 flex items-center gap-1"
                              >
                                {w} <Volume2 size={12} className="opacity-60" />
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-stone-500">
                            ar → /ɑːr/, or → /ɔːr/, er/ir/ur → đều là /ɜːr/
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Consonants */}
          {handbookSection === 'consonants' && (
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                    2. Quy luật Phụ âm biến đổi & Tổ hợp Phụ âm (Consonants & Digraphs)
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Đa số phụ âm đọc giống tiếng Việt (b, d, h, k, l, m, n, p, s, t, v). Bạn chỉ cần nhớ các trường hợp biến âm dưới đây:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* C & G Rule */}
                  <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
                    <h4 className="font-bold text-amber-900 text-base">
                      Quy tắc C và G (Cứng & Mềm)
                    </h4>
                    <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
                      <div className="p-3 bg-white rounded-xl border border-amber-100">
                        <p className="font-bold text-amber-800 mb-1">Âm MỀM (trước e, i, y):</p>
                        <p>• <strong>C</strong> đọc là <strong>/s/</strong>: <em>city, center, cycle</em></p>
                        <p>• <strong>G</strong> đọc là <strong>/dʒ/</strong>: <em>gym, giant, page</em> (ngoại lệ: <em>get, give, girl</em>)</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-100">
                        <p className="font-bold text-amber-800 mb-1">Âm CỨNG (trước a, o, u):</p>
                        <p>• <strong>C</strong> đọc là <strong>/k/</strong>: <em>cat, code, cup</em></p>
                        <p>• <strong>G</strong> đọc là <strong>/g/</strong>: <em>game, go, gun</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Digraphs */}
                  <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4">
                    <h4 className="font-bold text-blue-900 text-base">
                      Tổ hợp Phụ âm ghép (Digraphs)
                    </h4>
                    <div className="space-y-2.5 text-xs text-stone-700 leading-relaxed">
                      <div className="p-3 bg-white rounded-xl border border-blue-100">
                        <p><strong>sh → /ʃ/</strong> (sờ nặng tròn môi): <em>ship, wash</em></p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-blue-100">
                        <p><strong>ch / tch → /tʃ/</strong> (chờ): <em>chat, watch</em> (gốc Hy Lạp đọc là /k/: <em>school, chemistry</em>)</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-blue-100">
                        <p><strong>th →</strong> Thổi hơi <strong>/θ/</strong> (<em>think, bath</em>) hoặc rung họng <strong>/ð/</strong> (<em>this, that, mother</em>)</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-blue-100">
                        <p><strong>ph / gh → /f/</strong>: <em>phone, graph, laugh, enough</em></p>
                      </div>
                    </div>
                  </div>

                  {/* Silent letters */}
                  <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4">
                    <h4 className="font-bold text-purple-900 text-base">
                      Âm câm phổ biến (Silent Letters)
                    </h4>
                    <div className="space-y-2.5 text-xs text-stone-700 leading-relaxed">
                      <div className="p-3 bg-white rounded-xl border border-purple-100">
                        <p><strong>kn- đầu từ:</strong> Câm k, đọc n (<em>know, knife, knee</em>)</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-purple-100">
                        <p><strong>wr- đầu từ:</strong> Câm w, đọc r (<em>write, wrong, wrap</em>)</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-purple-100">
                        <p><strong>-mb / -bt cuối từ:</strong> Câm b (<em>climb, bomb, thumb, debt, doubt</em>)</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-purple-100">
                        <p><strong>-gh- trước t:</strong> Câm gh (<em>night, light, high, thought</em>)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Stress & Schwa */}
          {handbookSection === 'stress' && (
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                    3. Quy luật Trọng âm & Âm lướt Schwa /ə/ (Bí quyết đọc từ dài)
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Đối với từ 2 âm tiết trở lên, bạn không đọc rõ từng chữ như từ đơn mà phải tuân theo quy tắc Trọng âm.
                  </p>
                </div>

                {/* Golden Rule Card */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-200" />
                    <h4 className="text-lg font-bold">Nguyên tắc vàng của âm lướt Schwa /ə/</h4>
                  </div>
                  <p className="text-amber-100 text-sm leading-relaxed">
                    Trong một từ đa âm tiết, chỉ có âm tiết nhận <strong>trọng âm</strong> mới được đọc rõ theo bảng nguyên âm. Hầu hết các nguyên âm ở âm tiết <strong>không nhận trọng âm</strong> sẽ bị làm yếu đi thành âm <strong>/ə/ (đọc như "ờ" nhẹ)</strong> hoặc <strong>/ɪ/ (i ngắn)</strong>.
                  </p>
                  <div className="p-4 bg-black/20 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-amber-200 uppercase font-bold tracking-wider">Ví dụ điển hình:</p>
                      <p className="text-xl font-serif font-bold">Banana (3 chữ a)</p>
                      <p className="text-xs text-amber-100 mt-1">
                        Trọng âm rơi vào âm thứ 2 → chữ a thứ hai đọc rõ là /æ/, hai chữ a ở đầu và cuối bị lướt thành /ə/ → Đọc là <strong>/bəˈnæn.ə/</strong> (<em>bờ-nan-nờ</em>).
                      </p>
                    </div>
                    <button
                      onClick={() => playSpeech('banana')}
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all shrink-0"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Quick Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 text-sm">
                      1. Từ 2 âm tiết thông dụng
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      • <strong>Danh từ / Tính từ:</strong> Thường nhấn âm 1 (<em>TA-ble, HAP-py</em>)<br />
                      • <strong>Động từ:</strong> Thường nhấn âm 2 (<em>re-CEIVE, de-CIDE</em>)
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <h4 className="font-bold text-stone-900 text-sm">
                      2. Theo hậu tố (Đuôi từ)
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      • Đuôi <strong>-tion, -sion, -ic, -ial, -ian:</strong> Trọng âm rơi vào âm tiết <strong>ngay trước nó</strong> (<em>na-TION → NA-tion, e-du-CA-tion, spe-CIAL</em>).<br />
                      • Đuôi <strong>-ee, -eer, -ese, -ique:</strong> Trọng âm rơi vào <strong>chính nó</strong> (<em>employ-EE, engin-EER, Vietna-MESE</em>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Fixed Suffixes */}
          {handbookSection === 'suffixes' && (
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                    4. Các cụm đuôi cố định (Đọc gộp không cần đánh vần)
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Khi gặp các cụm hậu tố này ở cuối từ, hãy đọc thành một khối âm cố định:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      suffix: '-tion / -sion',
                      ipa: '/ʃən/ hoặc /ʒən/',
                      soundVi: 'sần hoặc giần',
                      examples: ['action', 'station', 'decision'],
                      color: 'border-amber-200 bg-amber-50/50'
                    },
                    {
                      suffix: '-ture',
                      ipa: '/tʃər/',
                      soundVi: 'chờ (cong lưỡi)',
                      examples: ['nature', 'picture', 'future'],
                      color: 'border-orange-200 bg-orange-50/50'
                    },
                    {
                      suffix: '-ous',
                      ipa: '/əs/',
                      soundVi: 'ợt-s',
                      examples: ['famous', 'nervous', 'dangerous'],
                      color: 'border-purple-200 bg-purple-50/50'
                    },
                    {
                      suffix: '-ble / -tle / -cle',
                      ipa: '/bəl/, /təl/, /kəl/',
                      soundVi: 'bồ, tồ, cồ',
                      examples: ['table', 'little', 'circle'],
                      color: 'border-emerald-200 bg-emerald-50/50'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border ${item.color} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold font-mono text-stone-900">{item.suffix}</span>
                        <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded shadow-sm text-stone-700">
                          {item.ipa}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        Đọc tương đương tiếng Việt: <strong>{item.soundVi}</strong>
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200/50">
                        {item.examples.map((ex) => (
                          <button
                            key={ex}
                            onClick={() => playSpeech(ex)}
                            className="px-2.5 py-1 bg-white hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-800 shadow-sm border border-stone-200/70 flex items-center gap-1"
                          >
                            {ex} <Volume2 size={12} className="opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRACTICE QUIZ */}
      {activeTab === 'quiz' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                Thực Hành Nhận Diện Quy Luật Phonics
              </h3>
              <p className="text-stone-500 text-sm">
                Mỗi câu trả lời đúng thưởng ngay +50 XP vào lộ trình học của bạn!
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400 uppercase font-bold tracking-wider">Điểm số</span>
              <div className="text-2xl font-bold text-amber-600">
                {quizScore} / {QUIZ_QUESTIONS.length}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q, qIdx) => {
              const selectedOpt = quizAnswered[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correct;

              return (
                <div
                  key={qIdx}
                  className={`p-6 rounded-2xl border transition-all ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-green-50/50 border-green-300'
                        : 'bg-red-50/50 border-red-300'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <p className="font-bold text-stone-900 text-base mb-4">
                    Câu {qIdx + 1}: {q.q}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {q.options.map((opt, oIdx) => {
                      const isThisSelected = selectedOpt === oIdx;
                      const isThisCorrect = oIdx === q.correct;

                      let btnStyle = 'bg-white hover:bg-stone-100 border-stone-200 text-stone-800';
                      if (isAnswered) {
                        if (isThisCorrect) {
                          btnStyle = 'bg-green-600 text-white border-green-700 shadow font-bold';
                        } else if (isThisSelected) {
                          btnStyle = 'bg-red-500 text-white border-red-600 font-bold';
                        } else {
                          btnStyle = 'bg-white/50 text-stone-400 border-stone-200 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleQuizAnswer(qIdx, oIdx)}
                          className={`p-3.5 rounded-xl text-left text-xs md:text-sm border transition-all flex items-start gap-2.5 ${btnStyle}`}
                        >
                          <span className="font-bold opacity-75">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 flex items-start gap-2">
                      <HelpCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Giải thích:</strong> {q.exp}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
