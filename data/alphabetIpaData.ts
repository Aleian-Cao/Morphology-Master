// Complete English Alphabet (26 letters) with vivid examples, phonics rules, and IPA Chart (44 sounds)
export interface VividWordExample {
  emoji: string;
  word: string;
  ipa: string;
  meaning_vi: string;
  highlight: string;
  sentence?: string;
  sentence_vi?: string;
}

export interface PhonicsSoundVariant {
  sound: string;
  label: string;
  condition: string;
  examples: string[];
}

export interface AlphabetLetter {
  letter: string;
  lower: string;
  name: string;
  nameIpa: string;
  vietnameseGuide: string;
  type: 'vowel' | 'consonant' | 'semivowel';
  categoryLabel: string;
  phonicsSounds: PhonicsSoundVariant[];
  vietnameseTip: string;
  accentColor: string;
  bgGradient: string;
  vividExamples: VividWordExample[];
}

export interface IPASound {
  symbol: string;
  name: string;
  category: 'monophthong_long' | 'monophthong_short' | 'diphthong' | 'consonant_unvoiced' | 'consonant_voiced' | 'consonant_other';
  categoryLabel: string;
  isVoiced: boolean;
  mouthShape: string;
  vietnameseGuide: string;
  spellingPatterns: string[];
  audioSpelling: string; // text to speak for speech synthesis
  examples: VividWordExample[];
  minimalPair?: {
    word1: string;
    ipa1: string;
    meaning1: string;
    word2: string;
    ipa2: string;
    meaning2: string;
    note: string;
  };
}

export interface ConfusingPair {
  id: string;
  title: string;
  tag: string;
  summary: string;
  itemA: {
    label: string;
    ipa: string;
    howToSay: string;
    example: string;
    exampleIpa: string;
    exampleVi: string;
    emoji: string;
  };
  itemB: {
    label: string;
    ipa: string;
    howToSay: string;
    example: string;
    exampleIpa: string;
    exampleVi: string;
    emoji: string;
  };
  proTip: string;
}

export const ALPHABET_DATA: AlphabetLetter[] = [
  {
    letter: 'A',
    lower: 'a',
    name: 'A',
    nameIpa: '/eɪ/',
    vietnameseGuide: 'Đọc là "ây" (như trong "mây")',
    type: 'vowel',
    categoryLabel: 'Nguyên âm (Vowel)',
    accentColor: 'rose',
    bgGradient: 'from-rose-500 to-pink-600',
    phonicsSounds: [
      { sound: '/æ/', label: 'Short A (Âm ngắn)', condition: 'Trong âm tiết đóng (CVC)', examples: ['cat', 'apple', 'map'] },
      { sound: '/eɪ/', label: 'Long A (Âm dài)', condition: 'Trong Magic E (CVCe) hoặc âm tiết mở', examples: ['cake', 'baby', 'plane'] },
      { sound: '/ɑː/', label: 'Broad A (A trầm)', condition: 'Trước r hoặc âm mở sâu', examples: ['car', 'father', 'star'] },
      { sound: '/ə/', label: 'Schwa /ə/', condition: 'Khi không nhận trọng âm', examples: ['about', 'banana', 'sofa'] }
    ],
    vietnameseTip: 'Rất nhiều người nhầm tên chữ cái /eɪ/ với âm /æ/. Trong từ "Apple", chữ A phát âm là /æ/ ("a bẹt"), không phải "ây-pồ"!',
    vividExamples: [
      { emoji: '🍎', word: 'Apple', ipa: '/ˈæp.əl/', meaning_vi: 'Quả táo', highlight: 'A', sentence: 'An apple a day keeps the doctor away.', sentence_vi: 'Mỗi ngày một quả táo giúp tránh xa bác sĩ.' },
      { emoji: '✈️', word: 'Airplane', ipa: '/ˈeə.pleɪn/', meaning_vi: 'Máy bay', highlight: 'A', sentence: 'The airplane flew above the clouds.', sentence_vi: 'Máy bay bay trên các đám mây.' },
      { emoji: '🥑', word: 'Avocado', ipa: '/ˌæv.əˈkɑː.dəʊ/', meaning_vi: 'Quả bơ', highlight: 'A', sentence: 'Avocado is rich in healthy fats.', sentence_vi: 'Quả bơ rất giàu chất béo tốt.' }
    ]
  },
  {
    letter: 'B',
    lower: 'b',
    name: 'B',
    nameIpa: '/biː/',
    vietnameseGuide: 'Đọc là "bi" (kéo dài âm i)',
    type: 'consonant',
    categoryLabel: 'Phụ âm (Consonant)',
    accentColor: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    phonicsSounds: [
      { sound: '/b/', label: 'Voiced Bilabial Plosive', condition: 'Phụ âm hữu thanh rung cổ', examples: ['book', 'ball', 'baby'] },
      { sound: 'Câm', label: 'Silent B', condition: 'Đứng sau m (-mb) hoặc trước t (-bt)', examples: ['climb', 'comb', 'doubt', 'debt'] }
    ],
    vietnameseTip: 'Phân biệt B và P: B mím môi rung thanh quản (/b/), còn P mím môi bật hơi mạnh KHÔNG rung (/p/). Lưu ý chữ B câm trong climb, debt!',
    vividExamples: [
      { emoji: '🐝', word: 'Bee', ipa: '/biː/', meaning_vi: 'Con ong', highlight: 'B', sentence: 'The busy bee gathers sweet honey.', sentence_vi: 'Chú ong chăm chỉ đi hút mật ngọt.' },
      { emoji: '🍌', word: 'Banana', ipa: '/bəˈnæn.ə/', meaning_vi: 'Quả chuối', highlight: 'B', sentence: 'Monkeys love ripe yellow bananas.', sentence_vi: 'Lũ khỉ thích chuối vàng chín mọng.' },
      { emoji: '📚', word: 'Book', ipa: '/bʊk/', meaning_vi: 'Quyển sách', highlight: 'B', sentence: 'Reading a book expands your mind.', sentence_vi: 'Đọc sách mở rộng tâm trí của bạn.' }
    ]
  },
  {
    letter: 'C',
    lower: 'c',
    name: 'C',
    nameIpa: '/siː/',
    vietnameseGuide: 'Đọc là "xi" (kéo dài âm i)',
    type: 'consonant',
    categoryLabel: 'Phụ âm 2 mặt (Cứng & Mềm)',
    accentColor: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    phonicsSounds: [
      { sound: '/k/', label: 'Hard C (C cứng)', condition: 'Trước A, O, U hoặc phụ âm', examples: ['cat', 'cup', 'car', 'code'] },
      { sound: '/s/', label: 'Soft C (C mềm)', condition: 'Trước E, I, Y', examples: ['city', 'center', 'circle', 'cycle'] }
    ],
    vietnameseTip: 'Quy tắc vàng: C + E/I/Y đọc là /s/ ("xì"); C + A/O/U đọc là /k/ ("kờ"). Không bao giờ đọc chữ C là "xê" như tiếng Việt!',
    vividExamples: [
      { emoji: '🐱', word: 'Cat', ipa: '/kæt/', meaning_vi: 'Con mèo (C cứng /k/)', highlight: 'C', sentence: 'The cat is purring softly on the mat.', sentence_vi: 'Con mèo đang kêu gừ gừ êm ái trên thảm.' },
      { emoji: '🏙️', word: 'City', ipa: '/ˈsɪt.i/', meaning_vi: 'Thành phố (C mềm /s/)', highlight: 'C', sentence: 'New York is an energetic modern city.', sentence_vi: 'New York là một thành phố hiện đại tràn đầy năng lượng.' },
      { emoji: '☕', word: 'Coffee', ipa: '/ˈkɒf.i/', meaning_vi: 'Cà phê', highlight: 'C', sentence: 'A warm cup of coffee starts the morning.', sentence_vi: 'Một tách cà phê ấm bắt đầu buổi sáng.' }
    ]
  },
  {
    letter: 'D',
    lower: 'd',
    name: 'D',
    nameIpa: '/diː/',
    vietnameseGuide: 'Đọc là "đi" (kéo dài âm i)',
    type: 'consonant',
    categoryLabel: 'Phụ âm (Consonant)',
    accentColor: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    phonicsSounds: [
      { sound: '/d/', label: 'Voiced Alveolar Plosive', condition: 'Đầu lưỡi chạm nướu trên bật âm rung', examples: ['dog', 'duck', 'door'] }
    ],
    vietnameseTip: 'Đừng đọc D như âm "dờ" (dưa hấu) của miền Nam, mà đầu lưỡi phải bật khỏi chân răng trên như âm "đ" dứt khoát và rung cổ họng.',
    vividExamples: [
      { emoji: '🐬', word: 'Dolphin', ipa: '/ˈdɒl.fɪn/', meaning_vi: 'Cá heo thông minh', highlight: 'D', sentence: 'Dolphins are known for their high intelligence.', sentence_vi: 'Cá heo nổi tiếng bởi trí thông minh tuyệt đỉnh.' },
      { emoji: '🦆', word: 'Duck', ipa: '/dʌk/', meaning_vi: 'Con vịt', highlight: 'D', sentence: 'The yellow duck swam across the pond.', sentence_vi: 'Chú vịt vàng bơi qua mặt ao.' },
      { emoji: '🚪', word: 'Door', ipa: '/dɔːr/', meaning_vi: 'Cánh cửa', highlight: 'D', sentence: 'Open the door to new opportunities.', sentence_vi: 'Hãy mở cánh cửa đón những cơ hội mới.' }
    ]
  },
  {
    letter: 'E',
    lower: 'e',
    name: 'E',
    nameIpa: '/iː/',
    vietnameseGuide: 'Đọc là "i" kéo dài (như "y-i")',
    type: 'vowel',
    categoryLabel: 'Nguyên âm (Vowel)',
    accentColor: 'indigo',
    bgGradient: 'from-indigo-500 to-violet-600',
    phonicsSounds: [
      { sound: '/e/', label: 'Short E', condition: 'Trong âm tiết đóng (CVC)', examples: ['bed', 'egg', 'red', 'pen'] },
      { sound: '/iː/', label: 'Long E', condition: 'Trong âm tiết mở (CV) hoặc ee, ea', examples: ['me', 'tree', 'eat'] },
      { sound: 'Câm', label: 'Magic E (E câm)', condition: 'Ở cuối từ để kéo dài nguyên âm trước', examples: ['cake', 'like', 'hope'] }
    ],
    vietnameseTip: 'BẪY LỚN NHẤT: Người Việt hay đọc E thành "e" theo tiếng Việt. Trong bảng chữ cái tiếng Anh, E đọc tên là /iː/ ("i"), còn I mới đọc là /aɪ/ ("ai")!',
    vividExamples: [
      { emoji: '🐘', word: 'Elephant', ipa: '/ˈel.ɪ.fənt/', meaning_vi: 'Con voi to lớn', highlight: 'E', sentence: 'The elephant walked through the jungle.', sentence_vi: 'Con voi sải bước qua khu rừng già.' },
      { emoji: '🥚', word: 'Egg', ipa: '/eɡ/', meaning_vi: 'Quả trứng', highlight: 'E', sentence: 'She boiled a fresh farm egg for breakfast.', sentence_vi: 'Cô ấy luộc một quả trứng tươi cho bữa sáng.' },
      { emoji: '🦅', word: 'Eagle', ipa: '/ˈiː.ɡəl/', meaning_vi: 'Chim đại bàng', highlight: 'E', sentence: 'The eagle soared majestically in the sky.', sentence_vi: 'Đại bàng kiêu hãnh lượn trên bầu trời.' }
    ]
  },
  {
    letter: 'F',
    lower: 'f',
    name: 'F',
    nameIpa: '/ef/',
    vietnameseGuide: 'Đọc là "e-ph" (răng trên cắn nhẹ môi dưới thổi hơi)',
    type: 'consonant',
    categoryLabel: 'Phụ âm vô thanh',
    accentColor: 'orange',
    bgGradient: 'from-orange-500 to-amber-600',
    phonicsSounds: [
      { sound: '/f/', label: 'Voiceless Labiodental', condition: 'Răng cửa trên chạm nhẹ môi dưới thổi hơi', examples: ['fish', 'fan', 'leaf'] }
    ],
    vietnameseTip: 'Khi phát âm tên chữ cái F (/ef/), phải có âm /f/ gió ở đuôi. Khi vào từ, luôn đặt răng cửa hàm trên lên môi dưới.',
    vividExamples: [
      { emoji: '🦊', word: 'Fox', ipa: '/fɒks/', meaning_vi: 'Con cáo tinh ranh', highlight: 'F', sentence: 'The clever fox dashed into the woods.', sentence_vi: 'Con cáo tinh khôn phóng nhanh vào rừng.' },
      { emoji: '🐟', word: 'Fish', ipa: '/fɪʃ/', meaning_vi: 'Con cá', highlight: 'F', sentence: 'Goldfish swim gracefully in clear water.', sentence_vi: 'Cá vàng bơi lội uyển chuyển trong làn nước trong.' },
      { emoji: '🔥', word: 'Fire', ipa: '/ˈfaɪ.ər/', meaning_vi: 'Ngọn lửa', highlight: 'F', sentence: 'The campfire kept them warm all night.', sentence_vi: 'Ngọn lửa trại giữ ấm cho họ suốt đêm.' }
    ]
  },
  {
    letter: 'G',
    lower: 'g',
    name: 'G',
    nameIpa: '/dʒiː/',
    vietnameseGuide: 'Đọc là "di" (chu mỏ bật âm /dʒ/)',
    type: 'consonant',
    categoryLabel: 'Phụ âm 2 mặt (Cứng & Mềm)',
    accentColor: 'teal',
    bgGradient: 'from-teal-500 to-cyan-600',
    phonicsSounds: [
      { sound: '/ɡ/', label: 'Hard G (G cứng)', condition: 'Trước A, O, U hoặc phụ âm', examples: ['game', 'go', 'guitar', 'green'] },
      { sound: '/dʒ/', label: 'Soft G (G mềm)', condition: 'Trước E, I, Y', examples: ['gym', 'giant', 'giraffe', 'page'] }
    ],
    vietnameseTip: 'Phân biệt G (/dʒiː/ đuôi "i") và J (/dʒeɪ/ đuôi "ây"). Ngoài ra G + E/I/Y đọc mềm /dʒ/ (trừ ngoại lệ như get, give, girl).',
    vividExamples: [
      { emoji: '🦒', word: 'Giraffe', ipa: '/dʒɪˈrɑːf/', meaning_vi: 'Hươu cao cổ (G mềm /dʒ/)', highlight: 'G', sentence: 'The giraffe reached tall acacia leaves.', sentence_vi: 'Hươu cao cổ vươn tới những cành lá keo tít trên cao.' },
      { emoji: '🎸', word: 'Guitar', ipa: '/ɡɪˈtɑːr/', meaning_vi: 'Cây đàn guitar (G cứng /ɡ/)', highlight: 'G', sentence: 'He played an acoustic guitar melody.', sentence_vi: 'Anh ấy gảy một giai điệu guitar mộc mạc.' },
      { emoji: '🍇', word: 'Grapes', ipa: '/ɡreɪps/', meaning_vi: 'Chùm nho tươi', highlight: 'G', sentence: 'Purple grapes are juicy and sweet.', sentence_vi: 'Những quả nho tím căng mọng và ngọt ngào.' }
    ]
  },
  {
    letter: 'H',
    lower: 'h',
    name: 'H',
    nameIpa: '/eɪtʃ/',
    vietnameseGuide: 'Đọc là "ây-ch" (bật âm /tʃ/ ở cuối, KHÔNG đọc "hát")',
    type: 'consonant',
    categoryLabel: 'Phụ âm (Consonant)',
    accentColor: 'purple',
    bgGradient: 'from-purple-500 to-violet-600',
    phonicsSounds: [
      { sound: '/h/', label: 'Voiceless Glottal Fricative', condition: 'Thở hơi nhẹ từ cuống họng', examples: ['hat', 'home', 'happy'] },
      { sound: 'Câm', label: 'Silent H', condition: 'Trong một số từ mượn gốc Pháp', examples: ['hour', 'honest', 'honor', 'ghost'] }
    ],
    vietnameseTip: 'SAI PHỔ BIẾN NHẤT: 80% người Việt đọc H là "hát". Tên đúng 100% phải là /eɪtʃ/ ("ây-ch"). Khi vào từ đọc nhẹ nhàng như tiếng thở ra.',
    vividExamples: [
      { emoji: '🚁', word: 'Helicopter', ipa: '/ˈhel.ɪˌkɒp.tər/', meaning_vi: 'Máy bay trực thăng', highlight: 'H', sentence: 'The rescue helicopter hovered above.', sentence_vi: 'Trực thăng cứu hộ bay lơ lửng phía trên.' },
      { emoji: '🏠', word: 'House', ipa: '/haʊs/', meaning_vi: 'Ngôi nhà ấm cúng', highlight: 'H', sentence: 'There is no place like home.', sentence_vi: 'Không đâu ấm êm bằng chính ngôi nhà mình.' },
      { emoji: '❤️', word: 'Heart', ipa: '/hɑːt/', meaning_vi: 'Trái tim', highlight: 'H', sentence: 'A grateful heart is a magnet for miracles.', sentence_vi: 'Một trái tim biết ơn luôn thu hút những điều kỳ diệu.' }
    ]
  },
  {
    letter: 'I',
    lower: 'i',
    name: 'I',
    nameIpa: '/aɪ/',
    vietnameseGuide: 'Đọc là "ai" (mở miệng rộng rồi thu nhỏ)',
    type: 'vowel',
    categoryLabel: 'Nguyên âm (Vowel)',
    accentColor: 'cyan',
    bgGradient: 'from-cyan-500 to-blue-600',
    phonicsSounds: [
      { sound: '/ɪ/', label: 'Short I (I ngắn)', condition: 'Trong âm tiết đóng (CVC)', examples: ['sit', 'pin', 'win', 'pig'] },
      { sound: '/aɪ/', label: 'Long I (I dài)', condition: 'Trong Magic E (site, kite) hoặc âm tiết mở', examples: ['ice', 'island', 'kite', 'time'] }
    ],
    vietnameseTip: 'Đừng nhầm I với E! Tên chữ I là /aɪ/ ("ai"). Khi đứng trong từ như "sit", phát âm ngắn dứt khoát /ɪ/, thả lỏng cơ miệng.',
    vividExamples: [
      { emoji: '🍦', word: 'Ice cream', ipa: '/ˈaɪs ˌkriːm/', meaning_vi: 'Kem que mát lạnh', highlight: 'I', sentence: 'Children love sweet vanilla ice cream.', sentence_vi: 'Trẻ em rất thích món kem vani ngọt mát.' },
      { emoji: '🏝️', word: 'Island', ipa: '/ˈaɪ.lənd/', meaning_vi: 'Hòn đảo nhiệt đới', highlight: 'I', sentence: 'They spent the holiday on a tropical island.', sentence_vi: 'Họ đã trải qua kỳ nghỉ trên một hòn đảo nhiệt đới.' },
      { emoji: '🦎', word: 'Iguana', ipa: '/ɪˈɡwɑː.nə/', meaning_vi: 'Kỳ nhông xanh', highlight: 'I', sentence: 'The green iguana rested on the rock.', sentence_vi: 'Chú kỳ nhông xanh nằm phơi mình trên mỏm đá.' }
    ]
  },
  {
    letter: 'J',
    lower: 'j',
    name: 'J',
    nameIpa: '/dʒeɪ/',
    vietnameseGuide: 'Đọc là "dây" (chu mỏ bật âm /dʒ/)',
    type: 'consonant',
    categoryLabel: 'Phụ âm (Consonant)',
    accentColor: 'yellow',
    bgGradient: 'from-amber-400 to-yellow-600',
    phonicsSounds: [
      { sound: '/dʒ/', label: 'Voiced Postalveolar Affricate', condition: 'Luôn phát âm là /dʒ/ tròn môi rung', examples: ['jam', 'jacket', 'job', 'juice'] }
    ],
    vietnameseTip: 'Chữ J trong tiếng Anh luôn phát âm là /dʒ/ (như "gi" nhưng chu môi và giật luồng hơi rung cổ). Không bao giờ đọc là "d" phẳng như tiếng Việt!',
    vividExamples: [
      { emoji: '🪼', word: 'Jellyfish', ipa: '/ˈdʒel.i.fɪʃ/', meaning_vi: 'Con sứa biển phát sáng', highlight: 'J', sentence: 'The glowing jellyfish drifted gently in ocean currents.', sentence_vi: 'Con sứa phát sáng trôi nhẹ theo dòng hải lưu.' },
      { emoji: '🧃', word: 'Juice', ipa: '/dʒuːs/', meaning_vi: 'Nước ép trái cây', highlight: 'J', sentence: 'Fresh orange juice provides lots of vitamin C.', sentence_vi: 'Nước cam tươi cung cấp dồi dào vitamin C.' },
      { emoji: '👖', word: 'Jeans', ipa: '/dʒiːnz/', meaning_vi: 'Quần bò jeans', highlight: 'J', sentence: 'Blue jeans are comfortable and durable.', sentence_vi: 'Quần bò xanh vừa thoải mái lại bền bỉ.' }
    ]
  },
  {
    letter: 'K',
    lower: 'k',
    name: 'K',
    nameIpa: '/keɪ/',
    vietnameseGuide: 'Đọc là "kây" (bật hơi âm k)',
    type: 'consonant',
    categoryLabel: 'Phụ âm (Consonant)',
    accentColor: 'emerald',
    bgGradient: 'from-emerald-600 to-teal-700',
    phonicsSounds: [
      { sound: '/k/', label: 'Voiceless Velar Plosive', condition: 'Bật hơi mạnh từ gốc cuống họng', examples: ['king', 'kite', 'kangaroo'] },
      { sound: 'Câm', label: 'Silent K', condition: 'Đứng trước n ở đầu từ (kn-)', examples: ['know', 'knife', 'knee', 'knight'] }
    ],
    vietnameseTip: 'Chú ý quy tắc kn- đầu từ: Chữ K hoàn toàn CÂM trong "knife" (/naɪf/), "know" (/nəʊ/), "knee" (/niː/)!',
    vividExamples: [
      { emoji: '🦘', word: 'Kangaroo', ipa: '/ˌkæŋ.ɡərˈuː/', meaning_vi: 'Chuột túi Kangaroo', highlight: 'K', sentence: 'The mother kangaroo carries her baby in a pouch.', sentence_vi: 'Kangaroo mẹ chở con nhỏ trong chiếc túi ấm áp.' },
      { emoji: '🔑', word: 'Key', ipa: '/kiː/', meaning_vi: 'Chìa khóa', highlight: 'K', sentence: 'Consistency is the key to mastering English.', sentence_vi: 'Sự kiên trì chính là chìa khóa chinh phục tiếng Anh.' },
      { emoji: '👑', word: 'King', ipa: '/kɪŋ/', meaning_vi: 'Vị vua quyền uy', highlight: 'K', sentence: 'The wise king ruled his kingdom fairly.', sentence_vi: 'Vị vua anh minh trị vì vương quốc rất công bằng.' }
    ]
  },
  {
    letter: 'L',
    lower: 'l',
    name: 'L',
    nameIpa: '/el/',
    vietnameseGuide: 'Đọc là "e-l" (đưa đầu lưỡi chạm chân răng trên)',
    type: 'consonant',
    categoryLabel: 'Phụ âm (Consonant)',
    accentColor: 'lime',
    bgGradient: 'from-lime-500 to-emerald-600',
    phonicsSounds: [
      { sound: '/l/', label: 'Light L (L sáng)', condition: 'Đứng đầu âm tiết trước nguyên âm', examples: ['lion', 'lemon', 'love'] },
      { sound: '/ɫ/', label: 'Dark L (L tối)', condition: 'Đứng cuối từ hoặc trước phụ âm', examples: ['ball', 'milk', 'call', 'table'] }
    ],
    vietnameseTip: 'Bí quyết Dark L: Khi L ở cuối từ (như "ball", "call"), nâng cuống lưỡi lên và để đầu lưỡi chạm chân răng trên tạo âm "ồ" trầm đặc trưng.',
    vividExamples: [
      { emoji: '🦁', word: 'Lion', ipa: '/ˈlaɪ.ən/', meaning_vi: 'Sư tử chúa sơn lâm', highlight: 'L', sentence: 'The brave lion protects its pride in the savanna.', sentence_vi: 'Chú sư tử dũng cảm bảo vệ bầy đàn trên đồng cỏ.' },
      { emoji: '🍋', word: 'Lemon', ipa: '/ˈlem.ən/', meaning_vi: 'Quả chanh vàng', highlight: 'L', sentence: 'Fresh lemon juice adds zest to your salad.', sentence_vi: 'Nước chanh tươi tạo hương vị thanh mát cho món salad.' },
      { emoji: '💡', word: 'Lamp', ipa: '/læmp/', meaning_vi: 'Chiếc đèn bàn', highlight: 'L', sentence: 'A desk lamp illuminates the workspace.', sentence_vi: 'Đèn bàn chiếu sáng khu vực học tập.' }
    ]
  },
  {
    letter: 'M',
    lower: 'm',
    name: 'M',
    nameIpa: '/em/',
    vietnameseGuide: 'Đọc là "e-m" (mím hai môi lại tạo âm mũi)',
    type: 'consonant',
    categoryLabel: 'Phụ âm âm mũi (Nasal)',
    accentColor: 'fuchsia',
    bgGradient: 'from-fuchsia-500 to-pink-600',
    phonicsSounds: [
      { sound: '/m/', label: 'Bilabial Nasal', condition: 'Hai môi mím chặt, luồng hơi qua mũi', examples: ['monkey', 'moon', 'mango'] }
    ],
    vietnameseTip: 'Âm M rất quen thuộc với người Việt, nhớ giữ kín 2 môi khi kết thúc từ như "time", "dream" để không bị mất âm đuôi.',
    vividExamples: [
      { emoji: '🐒', word: 'Monkey', ipa: '/ˈmʌŋ.ki/', meaning_vi: 'Chú khỉ tinh nghịch', highlight: 'M', sentence: 'The monkey swings swiftly between tree branches.', sentence_vi: 'Chú khỉ đu mình thoăn thoắt giữa các cành cây.' },
      { emoji: '🌙', word: 'Moon', ipa: '/muːn/', meaning_vi: 'Mặt trăng rằm', highlight: 'M', sentence: 'The full moon shines brightly in the midnight sky.', sentence_vi: 'Trăng tròn chiếu sáng rực rỡ trên bầu trời đêm.' },
      { emoji: '🥭', word: 'Mango', ipa: '/ˈmæŋ.ɡəʊ/', meaning_vi: 'Quả xoài ngọt', highlight: 'M', sentence: 'Sweet ripe mango is a beloved summer fruit.', sentence_vi: 'Xoài chín ngọt lịm là thứ quả mùa hè được ai nấy yêu thích.' }
    ]
  },
  {
    letter: 'N',
    lower: 'n',
    name: 'N',
    nameIpa: '/en/',
    vietnameseGuide: 'Đọc là "e-n" (đầu lưỡi áp vòm họng đẩy hơi lên mũi)',
    type: 'consonant',
    categoryLabel: 'Phụ âm âm mũi (Nasal)',
    accentColor: 'sky',
    bgGradient: 'from-sky-500 to-blue-600',
    phonicsSounds: [
      { sound: '/n/', label: 'Alveolar Nasal', condition: 'Đầu lưỡi dán chặt chân răng trên, luồng hơi qua mũi', examples: ['nest', 'nose', 'sun', 'pen'] }
    ],
    vietnameseTip: 'Chú ý kết thúc từ có N như "sun", "ten" - không được nuốt mất âm n, đầu lưỡi phải dán vào nướu răng trên.',
    vividExamples: [
      { emoji: '🪺', word: 'Nest', ipa: '/nest/', meaning_vi: 'Tổ chim ấm áp', highlight: 'N', sentence: 'The bird built a sturdy nest high up in the oak.', sentence_vi: 'Chú chim dựng chiếc tổ chắc chắn trên ngọn sồi cao.' },
      { emoji: '👃', word: 'Nose', ipa: '/nəʊz/', meaning_vi: 'Chiếc mũi', highlight: 'N', sentence: 'Dogs have an incredibly keen sense of smell with their nose.', sentence_vi: 'Loài chó có khứu giác cực kỳ nhạy bén nhờ chiếc mũi.' },
      { emoji: '🥜', word: 'Nut', ipa: '/nʌt/', meaning_vi: 'Hạt dinh dưỡng', highlight: 'N', sentence: 'Walnuts and almonds are healthy daily snacks.', sentence_vi: 'Hạt óc chó và hạnh nhân là món ăn vặt lành mạnh mỗi ngày.' }
    ]
  },
  {
    letter: 'O',
    lower: 'o',
    name: 'O',
    nameIpa: '/əʊ/',
    vietnameseGuide: 'Đọc là "âu" (ở Anh) hoặc "ô-u" (ở Mỹ)',
    type: 'vowel',
    categoryLabel: 'Nguyên âm (Vowel)',
    accentColor: 'orange',
    bgGradient: 'from-orange-500 to-red-500',
    phonicsSounds: [
      { sound: '/ɒ/ hoặc /ɑː/', label: 'Short O', condition: 'Trong âm tiết đóng (CVC)', examples: ['hot', 'box', 'pot', 'dog'] },
      { sound: '/əʊ/ hoặc /oʊ/', label: 'Long O', condition: 'Trong Magic E (hope, note) hoặc âm tiết mở', examples: ['go', 'no', 'home', 'rose'] },
      { sound: '/uː/', label: 'O đặc biệt', condition: 'Trong các từ như to, do, move', examples: ['do', 'to', 'move', 'lose'] }
    ],
    vietnameseTip: 'Tên chữ cái O không phải là "o" tròn như tiếng Việt, mà là âm đôi /əʊ/ (khép từ âm ơ sang u nhẹ). Trong từ "hot", miệng mở to đọc /ɒ/ hoặc /ɑː/.',
    vividExamples: [
      { emoji: '🦉', word: 'Owl', ipa: '/aʊl/', meaning_vi: 'Cú mèo thông thái', highlight: 'O', sentence: 'The wise owl stays vigilant all through the night.', sentence_vi: 'Cú mèo thông thái thức canh chừng suốt đêm dài.' },
      { emoji: '🐙', word: 'Octopus', ipa: '/ˈɒk.tə.pəs/', meaning_vi: 'Bạch tuộc tám tua', highlight: 'O', sentence: 'The octopus can camouflage seamlessly into rocks.', sentence_vi: 'Bạch tuộc có thể ngụy trang hoàn hảo vào các tảng đá.' },
      { emoji: '🍊', word: 'Orange', ipa: '/ˈɒr.ɪndʒ/', meaning_vi: 'Quả cam ngọt ngào', highlight: 'O', sentence: 'A freshly peeled orange gives off a lovely citrus scent.', sentence_vi: 'Quả cam vừa bóc tỏa ra hương thơm dịu mát.' }
    ]
  },
  {
    letter: 'P',
    lower: 'p',
    name: 'P',
    nameIpa: '/piː/',
    vietnameseGuide: 'Đọc là "pi" (mím môi BẬT HƠI mạnh)',
    type: 'consonant',
    categoryLabel: 'Phụ âm bật hơi vô thanh',
    accentColor: 'violet',
    bgGradient: 'from-violet-500 to-purple-600',
    phonicsSounds: [
      { sound: '/p/', label: 'Voiceless Bilabial Plosive', condition: 'Mím chặt hai môi và nén hơi bật búng ra ngoài', examples: ['pen', 'pig', 'pizza', 'cup'] }
    ],
    vietnameseTip: 'BẬT HƠI QUAN TRỌNG: Đặt một mảnh giấy trước miệng khi đọc /p/, luồng hơi phải làm tờ giấy bay vọt đi. Đừng đọc yếu ớt như chữ "p" tiếng Việt!',
    vividExamples: [
      { emoji: '🐧', word: 'Penguin', ipa: '/ˈpeŋ.ɡwɪn/', meaning_vi: 'Chim cánh cụt Nam Cực', highlight: 'P', sentence: 'Penguins waddle cutely across icy shores.', sentence_vi: 'Những chú chim cánh cụt lạch bạch bước trên bờ băng tuyết.' },
      { emoji: '🍕', word: 'Pizza', ipa: '/ˈpiːt.sə/', meaning_vi: 'Bánh pizza phô mai', highlight: 'P', sentence: 'Hot cheesy pizza is a favorite worldwide feast.', sentence_vi: 'Pizza phô mai nóng hổi là món ăn yêu thích toàn cầu.' },
      { emoji: '🐼', word: 'Panda', ipa: '/ˈpæn.də/', meaning_vi: 'Gấu trúc đáng yêu', highlight: 'P', sentence: 'The giant panda munches on fresh green bamboo.', sentence_vi: 'Chú gấu trúc khổng lồ nhai lá trúc xanh rờn.' }
    ]
  },
  {
    letter: 'Q',
    lower: 'q',
    name: 'Q',
    nameIpa: '/kjuː/',
    vietnameseGuide: 'Đọc là "kiu" (kéo dài âm u)',
    type: 'consonant',
    categoryLabel: 'Phụ âm (Đi đôi với U)',
    accentColor: 'rose',
    bgGradient: 'from-rose-500 to-red-600',
    phonicsSounds: [
      { sound: '/kw/', label: 'Tổ hợp QU', condition: 'Chữ Q hầu như 99% luôn đi kèm với U', examples: ['queen', 'quick', 'quiet', 'quiz'] },
      { sound: '/k/', label: 'Q mượn gốc Pháp', condition: 'Trong các từ mượn', examples: ['antique', 'unique', 'technique'] }
    ],
    vietnameseTip: 'Trong tiếng Anh: "Q never goes anywhere without U" (Q không bao giờ rời xa U). Khi phát âm cụm qu-, chu tròn môi đọc thành /kw/ ("khoắc").',
    vividExamples: [
      { emoji: '👑', word: 'Queen', ipa: '/kwiːn/', meaning_vi: 'Nữ hoàng tôn quý', highlight: 'Q', sentence: 'The queen wore a glittering diamond crown.', sentence_vi: 'Nữ hoàng đội chiếc vương miện đính kim cương lấp lánh.' },
      { emoji: '❓', word: 'Question', ipa: '/ˈkwes.tʃən/', meaning_vi: 'Câu hỏi thắc mắc', highlight: 'Q', sentence: 'Asking good questions is the first step of learning.', sentence_vi: 'Đặt câu hỏi hay là bước đầu tiên của sự học hỏi.' },
      { emoji: '⚡', word: 'Quick', ipa: '/kwɪk/', meaning_vi: 'Nhanh nhẹn, tốc độ', highlight: 'Q', sentence: 'A quick reaction saved the day.', sentence_vi: 'Một phản ứng nhanh nhạy đã giải cứu tình thế.' }
    ]
  },
  {
    letter: 'R',
    lower: 'r',
    name: 'R',
    nameIpa: '/ɑːr/',
    vietnameseGuide: 'Đọc là "a-r" (mở to miệng rồi cuộn cong lưỡi vào trong)',
    type: 'consonant',
    categoryLabel: 'Phụ âm cong lưỡi (Approximant)',
    accentColor: 'red',
    bgGradient: 'from-red-500 to-rose-600',
    phonicsSounds: [
      { sound: '/r/', label: 'Postalveolar Approximant', condition: 'Uốn cong đầu lưỡi không để chạm vòm miệng', examples: ['red', 'run', 'rabbit'] },
      { sound: 'Bossy R', label: 'Biến đổi nguyên âm', condition: 'Đứng sau nguyên âm (ar, er, ir, or, ur)', examples: ['car', 'bird', 'fork', 'turn'] }
    ],
    vietnameseTip: 'BÍ QUYẾT: Đừng rung lưỡi kiểu "rờ" tiếng Việt! Âm R tiếng Anh được tạo ra bằng cách cuộn đầu lưỡi lùi về sau vòm miệng và giữ lơ lửng KHÔNG chạm bất kỳ đâu.',
    vividExamples: [
      { emoji: '🚀', word: 'Rocket', ipa: '/ˈrɒk.ɪt/', meaning_vi: 'Tên lửa không gian', highlight: 'R', sentence: 'The rocket launched straight into deep space.', sentence_vi: 'Tên lửa phóng thẳng vào không gian bao la.' },
      { emoji: '🌈', word: 'Rainbow', ipa: '/ˈreɪn.bəʊ/', meaning_vi: 'Cầu vồng bảy sắc', highlight: 'R', sentence: 'A bright rainbow appeared after the sudden summer rain.', sentence_vi: 'Cầu vồng rực rỡ hiện lên sau cơn mưa rào mùa hạ.' },
      { emoji: '🤖', word: 'Robot', ipa: '/ˈrəʊ.bɒt/', meaning_vi: 'Người máy thông minh', highlight: 'R', sentence: 'The futuristic robot assisted the engineers efficiently.', sentence_vi: 'Người máy tương lai hỗ trợ các kỹ sư một cách đắc lực.' }
    ]
  },
  {
    letter: 'S',
    lower: 's',
    name: 'S',
    nameIpa: '/es/',
    vietnameseGuide: 'Đọc là "e-s" (xì hơi mạnh qua kẽ răng)',
    type: 'consonant',
    categoryLabel: 'Phụ âm xì hơi vô thanh',
    accentColor: 'amber',
    bgGradient: 'from-amber-500 to-yellow-600',
    phonicsSounds: [
      { sound: '/s/', label: 'Voiceless Alveolar Sibilant', condition: 'Khép răng thổi luồng hơi sắc nhọn', examples: ['sun', 'star', 'bus', 'sit'] },
      { sound: '/z/', label: 'Voiced S (S rung)', condition: 'Khi đứng giữa 2 nguyên âm hoặc sau âm hữu thanh', examples: ['rose', 'easy', 'dogs', 'is'] }
    ],
    vietnameseTip: 'Đừng quên âm gió S! Chữ cái S tên là /es/ (phải xì hơi đuôi). Khi ở giữa 2 nguyên âm như "rose" (/rəʊz/), chữ S sẽ rung thành âm /z/.',
    vividExamples: [
      { emoji: '☀️', word: 'Sun', ipa: '/sʌn/', meaning_vi: 'Mặt trời rạng rỡ', highlight: 'S', sentence: 'The golden sun brings warm energy to life on Earth.', sentence_vi: 'Mặt trời vàng đem lại năng lượng ấm áp cho sự sống Trái Đất.' },
      { emoji: '🍓', word: 'Strawberry', ipa: '/ˈstrɔː.bər.i/', meaning_vi: 'Dâu tây chín mọng', highlight: 'S', sentence: 'Sweet red strawberries taste heavenly with cream.', sentence_vi: 'Những quả dâu tây đỏ mọng ăn kèm kem tươi ngon tuyệt.' },
      { emoji: '⭐', word: 'Star', ipa: '/stɑːr/', meaning_vi: 'Ngôi sao lấp lánh', highlight: 'S', sentence: 'Millions of distant stars illuminate the galaxy.', sentence_vi: 'Hàng triệu vì sao xa xôi thắp sáng cả dải ngân hà.' }
    ]
  },
  {
    letter: 'T',
    lower: 't',
    name: 'T',
    nameIpa: '/tiː/',
    vietnameseGuide: 'Đọc là "ti" (đầu lưỡi bật chân răng trên)',
    type: 'consonant',
    categoryLabel: 'Phụ âm bật hơi vô thanh',
    accentColor: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    phonicsSounds: [
      { sound: '/t/', label: 'Voiceless Alveolar Plosive', condition: 'Đầu lưỡi nén chặt sau răng trên rồi bật dứt khoát', examples: ['tiger', 'tree', 'cat', 'water'] },
      { sound: '/ɾ/', label: 'Flap T (T vỗ nhẹ ở Mỹ)', condition: 'Đứng giữa 2 nguyên âm trong tiếng Anh-Mỹ', examples: ['water', 'better', 'city'] }
    ],
    vietnameseTip: 'Khác chữ T tiếng Việt (đầu lưỡi chạm răng), âm T tiếng Anh đầu lưỡi chạm vào phần NƯỚU GỒ (chân răng bên trên) rồi bật hơi dứt khoát.',
    vividExamples: [
      { emoji: '🐯', word: 'Tiger', ipa: '/ˈtaɪ.ɡər/', meaning_vi: 'Chúa sơn lâm hổ vằn', highlight: 'T', sentence: 'The stealthy tiger prowled quietly through tall grass.', sentence_vi: 'Chú hổ thoăn thoắt rình mồi nhẹ nhàng qua đám cỏ cao.' },
      { emoji: '🌴', word: 'Tree', ipa: '/triː/', meaning_vi: 'Cây xanh bóng mát', highlight: 'T', sentence: 'Ancient trees offer cool shade and fresh oxygen.', sentence_vi: 'Những cây cổ thụ đem lại bóng râm mát và oxy trong lành.' },
      { emoji: '🍅', word: 'Tomato', ipa: '/təˈmɑː.təʊ/', meaning_vi: 'Quả cà chua đỏ', highlight: 'T', sentence: 'Ripe juicy tomatoes make the best homemade pasta sauce.', sentence_vi: 'Cà chua chín mọng làm sốt mì Ý ngon tuyệt hảo.' }
    ]
  },
  {
    letter: 'U',
    lower: 'u',
    name: 'U',
    nameIpa: '/juː/',
    vietnameseGuide: 'Đọc là "diu" (hoặc "du")',
    type: 'vowel',
    categoryLabel: 'Nguyên âm (Vowel)',
    accentColor: 'indigo',
    bgGradient: 'from-indigo-600 to-purple-600',
    phonicsSounds: [
      { sound: '/ʌ/', label: 'Short U (Á ngắn)', condition: 'Trong âm tiết đóng (CVC)', examples: ['cup', 'sun', 'run', 'bus'] },
      { sound: '/juː/ hoặc /uː/', label: 'Long U', condition: 'Trong Magic E (cute, tube) hoặc âm tiết mở', examples: ['cute', 'unicorn', 'music', 'blue'] },
      { sound: '/ʊ/', label: 'U ngắn tròn môi', condition: 'Trong một số từ như put, push, full', examples: ['put', 'push', 'full', 'pull'] }
    ],
    vietnameseTip: 'Tên chữ cái U đọc là /juː/ ("diu"). Khi vào từ đơn CVC như "cup", "run", chữ U lại đọc thành âm /ʌ/ (na ná chữ "ă/â" mở miệng vừa phải).',
    vividExamples: [
      { emoji: '☂️', word: 'Umbrella', ipa: '/ʌmˈbrel.ə/', meaning_vi: 'Chiếc ô che mưa', highlight: 'U', sentence: 'Always carry an umbrella on cloudy afternoons.', sentence_vi: 'Hãy luôn mang theo một chiếc ô vào những buổi chiều râm mát.' },
      { emoji: '🦄', word: 'Unicorn', ipa: '/ˈjuː.nɪ.kɔːn/', meaning_vi: 'Kỳ lân huyền bí', highlight: 'U', sentence: 'The mythical unicorn is a symbol of purity and grace.', sentence_vi: 'Kỳ lân thần thoại là biểu tượng của sự thuần khiết và thanh tao.' },
      { emoji: '🛸', word: 'UFO', ipa: '/ˌjuː.efˈəʊ/', meaning_vi: 'Đĩa bay ngoài vũ trụ', highlight: 'U', sentence: 'The sci-fi movie featured a gleaming mysterious UFO.', sentence_vi: 'Bộ phim khoa học viễn tưởng xuất hiện một chiếc UFO bí ẩn sáng bóng.' }
    ]
  },
  {
    letter: 'V',
    lower: 'v',
    name: 'V',
    nameIpa: '/viː/',
    vietnameseGuide: 'Đọc là "vi" (răng trên cắn nhẹ môi dưới rung)',
    type: 'consonant',
    categoryLabel: 'Phụ âm cắn môi rung (Voiced)',
    accentColor: 'blue',
    bgGradient: 'from-blue-600 to-cyan-700',
    phonicsSounds: [
      { sound: '/v/', label: 'Voiced Labiodental Fricative', condition: 'Răng cửa trên chạm nhẹ môi dưới, làm rung dây thanh', examples: ['van', 'voice', 'river', 'love'] }
    ],
    vietnameseTip: 'Khác biệt then chốt giữa F và V: F không rung thanh quản (chỉ có gió thổi), còn V rung mạnh cổ họng (như tiếng motor nổ êm).',
    vividExamples: [
      { emoji: '🎻', word: 'Violin', ipa: '/ˌvaɪəˈlɪn/', meaning_vi: 'Cây đàn vĩ cầm violin', highlight: 'V', sentence: 'The soothing violin melody filled the concert hall.', sentence_vi: 'Giai điệu du dương của cây vĩ cầm lan tỏa khắp khán phòng hòa nhạc.' },
      { emoji: '🚐', word: 'Van', ipa: '/væn/', meaning_vi: 'Xe tải nhỏ van', highlight: 'V', sentence: 'They packed their travel camping gear into the camper van.', sentence_vi: 'Họ xếp gọn đồ cắm trại lên chiếc xe van du lịch.' },
      { emoji: '🌋', word: 'Volcano', ipa: '/vɒlˈkeɪ.nəʊ/', meaning_vi: 'Núi lửa phun trào', highlight: 'V', sentence: 'The dramatic volcano spewed bright glowing lava.', sentence_vi: 'Ngọn núi lửa kỳ vĩ phun trào dung nham đỏ rực.' }
    ]
  },
  {
    letter: 'W',
    lower: 'w',
    name: 'W',
    nameIpa: '/ˈdʌb.əl.juː/',
    vietnameseGuide: 'Đọc là "đắp-bồ-diu" (Double U - 2 chữ U ghép lại)',
    type: 'semivowel',
    categoryLabel: 'Bán nguyên âm / Phụ âm tròn môi',
    accentColor: 'teal',
    bgGradient: 'from-teal-600 to-emerald-700',
    phonicsSounds: [
      { sound: '/w/', label: 'Voiced Labial-Velar Approximant', condition: 'Tròn môi chu ra phía trước rồi mở nhanh', examples: ['water', 'wind', 'walk', 'win'] },
      { sound: 'Câm', label: 'Silent W', condition: 'Đứng trước r ở đầu từ (wr-)', examples: ['write', 'wrong', 'wrist', 'wrap'] }
    ],
    vietnameseTip: 'Tên chữ W là "Double U" (/ˈdʌb.əl.juː/). Khi vào từ, chu tròn môi phát âm /w/ (như "quơ" nhẹ). Lưu ý tổ hợp wr- thì chữ W hoàn toàn CÂM (write, wrong)!',
    vividExamples: [
      { emoji: '🍉', word: 'Watermelon', ipa: '/ˈwɔː.təˌmel.ən/', meaning_vi: 'Dưa hấu thanh mát', highlight: 'W', sentence: 'Cold juicy watermelon is the ultimate summer refresher.', sentence_vi: 'Dưa hấu lạnh mọng nước là món giải nhiệt mùa hè tuyệt đỉnh.' },
      { emoji: '🐺', word: 'Wolf', ipa: '/wʊlf/', meaning_vi: 'Sói xám dũng mãnh', highlight: 'W', sentence: 'The lone wolf howled beneath the bright full moon.', sentence_vi: 'Con sói cô độc hú vang dưới ánh trăng rằm vằng vặc.' },
      { emoji: '⌚', word: 'Watch', ipa: '/wɒtʃ/', meaning_vi: 'Đồng hồ đeo tay', highlight: 'W', sentence: 'He glanced down at his wristwatch to check the time.', sentence_vi: 'Anh liếc nhìn chiếc đồng hồ đeo tay để xem giờ.' }
    ]
  },
  {
    letter: 'X',
    lower: 'x',
    name: 'X',
    nameIpa: '/eks/',
    vietnameseGuide: 'Đọc là "e-ks" (phải có âm bật k và xì s ở đuôi)',
    type: 'consonant',
    categoryLabel: 'Phụ âm kép (Double Consonant Sound)',
    accentColor: 'purple',
    bgGradient: 'from-purple-600 to-indigo-700',
    phonicsSounds: [
      { sound: '/ks/', label: 'Voiceless /ks/', condition: 'Đứng cuối từ hoặc trước phụ âm vô thanh', examples: ['box', 'fox', 'six', 'mix', 'taxi'] },
      { sound: '/ɡz/', label: 'Voiced /ɡz/', condition: 'Khi theo sau là nguyên âm có trọng âm', examples: ['exam', 'exact', 'exist', 'example'] },
      { sound: '/z/', label: 'Âm /z/ đầu từ', condition: 'Khi đứng đầu từ mượn', examples: ['xylophone', 'xenon', 'xerox'] }
    ],
    vietnameseTip: 'Chữ X là chữ cái duy nhất tự thân chứa 2 âm (/k/ + /s/). Đừng bao giờ đọc là "ích-xì" tiếng Việt; tên chữ cái là /eks/!',
    vividExamples: [
      { emoji: '📦', word: 'Box', ipa: '/bɒks/', meaning_vi: 'Chiếc hộp giấy', highlight: 'X', sentence: 'She carefully opened the gift inside the sturdy box.', sentence_vi: 'Cô ấy cẩn thận mở món quà bên trong chiếc hộp chắc chắn.' },
      { emoji: '🩻', word: 'X-ray', ipa: '/ˈeks.reɪ/', meaning_vi: 'Phim chụp X-quang', highlight: 'X', sentence: 'The doctor inspected the bone fracture on the X-ray.', sentence_vi: 'Bác sĩ kiểm tra vết nứt xương trên phim chụp X-quang.' },
      { emoji: '🦊', word: 'Fox', ipa: '/fɒks/', meaning_vi: 'Chú cáo đuôi dài', highlight: 'X', sentence: 'The clever little fox vanished into the dense bush.', sentence_vi: 'Chú cáo nhỏ tinh ranh biến mất vào lùm cây rậm rạp.' }
    ]
  },
  {
    letter: 'Y',
    lower: 'y',
    name: 'Y',
    nameIpa: '/waɪ/',
    vietnameseGuide: 'Đọc là "oai" (bắt đầu tròn môi mở rộng sang ai)',
    type: 'semivowel',
    categoryLabel: 'Bán nguyên âm (Vừa là phụ âm, vừa là nguyên âm)',
    accentColor: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    phonicsSounds: [
      { sound: '/j/', label: 'Phụ âm Y (đầu từ)', condition: 'Đứng đầu từ trước nguyên âm', examples: ['yes', 'yellow', 'yacht', 'you'] },
      { sound: '/aɪ/', label: 'Nguyên âm I dài', condition: 'Ở cuối từ đơn 1 âm tiết', examples: ['my', 'fly', 'sky', 'cry', 'dry'] },
      { sound: '/i/', label: 'Nguyên âm I ngắn nhẹ', condition: 'Ở cuối từ đa âm tiết không nhấn', examples: ['baby', 'happy', 'city', 'candy'] }
    ],
    vietnameseTip: 'Y là chữ cái đặc biệt nhất: Đứng đầu từ là PHỤ ÂM /j/ ("dờ" nhẹ: yes, you); đứng cuối từ là NGUYÊN ÂM (sky = /skaɪ/, happy = /ˈhæp.i/)!',
    vividExamples: [
      { emoji: '⛵', word: 'Yacht', ipa: '/jɒt/', meaning_vi: 'Du thuyền sang trọng', highlight: 'Y', sentence: 'The luxury yacht sailed smoothly across calm blue waters.', sentence_vi: 'Chiếc du thuyền sang trọng lướt êm trên làn nước xanh biếc.' },
      { emoji: '🧶', word: 'Yarn', ipa: '/jɑːn/', meaning_vi: 'Cuộn len đan áo', highlight: 'Y', sentence: 'Grandma knitted a cozy winter sweater with soft wool yarn.', sentence_vi: 'Bà đan chiếc áo len mùa đông ấm áp từ cuộn len mềm mại.' },
      { emoji: '🟡', word: 'Yellow', ipa: '/ˈjel.əʊ/', meaning_vi: 'Màu vàng tươi sáng', highlight: 'Y', sentence: 'Bright yellow sunflowers follow the movement of the sun.', sentence_vi: 'Những bông hoa hướng dương vàng tươi xoay theo bước chân mặt trời.' }
    ]
  },
  {
    letter: 'Z',
    lower: 'z',
    name: 'Z',
    nameIpa: '/zed/ hoặc /ziː/',
    vietnameseGuide: 'Đọc là "dét" (UK) hoặc "di" rung (US)',
    type: 'consonant',
    categoryLabel: 'Phụ âm rung sibilant (Voiced)',
    accentColor: 'indigo',
    bgGradient: 'from-indigo-600 to-slate-800',
    phonicsSounds: [
      { sound: '/z/', label: 'Voiced Alveolar Sibilant', condition: 'Khép răng thổi luồng hơi RUNG MẠNH thanh quản', examples: ['zebra', 'zoo', 'zipper', 'zero'] }
    ],
    vietnameseTip: 'Người Anh đọc Z là /zed/ ("dét"), người Mỹ đọc là /ziː/ ("di" rung như tiếng ong bay). Khác chữ S: Chữ Z dây thanh rung liên tục!',
    vividExamples: [
      { emoji: '🦓', word: 'Zebra', ipa: '/ˈzeb.rə/', meaning_vi: 'Ngựa vằn châu Phi', highlight: 'Z', sentence: 'Each zebra has a unique pattern of black and white stripes.', sentence_vi: 'Mỗi chú ngựa vằn đều mang họa tiết sọc đen trắng độc nhất vô nhị.' },
      { emoji: '🤐', word: 'Zipper', ipa: '/ˈzɪp.ər/', meaning_vi: 'Khóa kéo áo khoác', highlight: 'Z', sentence: 'Zip up your jacket tightly before going outside in the cold.', sentence_vi: 'Hãy kéo chặt khóa áo khoác trước khi bước ra ngoài trời rét.' },
      { emoji: '🦁', word: 'Zoo', ipa: '/zuː/', meaning_vi: 'Thảo cầm viên, sở thú', highlight: 'Z', sentence: 'Families enjoy observing diverse animals happily at the city zoo.', sentence_vi: 'Các gia đình hào hứng ngắm nhìn các loài động vật tại sở thú thành phố.' }
    ]
  }
];

export const IPA_CHART_DATA: IPASound[] = [
  // 12 Monophthongs (Nguyên âm đơn)
  {
    symbol: '/iː/',
    name: 'Nguyên âm dài /iː/',
    category: 'monophthong_long',
    categoryLabel: 'Nguyên âm đơn DÀI',
    isVoiced: true,
    mouthShape: 'Môi kéo sang hai bên như đang cười tươi, đầu lưỡi nâng cao chạm chân răng dưới, phát âm ngân dài đều.',
    vietnameseGuide: 'Đọc giống "i" tiếng Việt nhưng khóe môi bành ra hai bên và kéo dài âm.',
    spellingPatterns: ['ee (sheep, see)', 'ea (meat, clean)', 'ie (piece)', 'e (me, scene)'],
    audioSpelling: 'ee',
    examples: [
      { emoji: '🐑', word: 'Sheep', ipa: '/ʃiːp/', meaning_vi: 'Con cừu', highlight: 'ee' },
      { emoji: '🍵', word: 'Tea', ipa: '/tiː/', meaning_vi: 'Tách trà', highlight: 'ea' },
      { emoji: '🌳', word: 'Tree', ipa: '/triː/', meaning_vi: 'Cây cối', highlight: 'ee' }
    ],
    minimalPair: {
      word1: 'Sheep',
      ipa1: '/ʃiːp/',
      meaning1: 'Con cừu (âm dài)',
      word2: 'Ship',
      ipa2: '/ʃɪp/',
      meaning2: 'Con tàu (âm ngắn)',
      note: 'Sheep cười bành môi kéo dài; Ship miệng thả lỏng dứt khoát.'
    }
  },
  {
    symbol: '/ɪ/',
    name: 'Nguyên âm ngắn /ɪ/',
    category: 'monophthong_short',
    categoryLabel: 'Nguyên âm đơn NGẮN',
    isVoiced: true,
    mouthShape: 'Môi hơi mở hờ, cơ miệng thả lỏng thư giãn, phát âm dứt khoát nhanh gọn (khoảng 0.5 giây).',
    vietnameseGuide: 'Lai giữa "i" và "ê" trong tiếng Việt, âm rất ngắn và dứt khoát.',
    spellingPatterns: ['i (sit, fish, gym)', 'y (happy, myth)', 'ui (build)'],
    audioSpelling: 'ih',
    examples: [
      { emoji: '🚢', word: 'Ship', ipa: '/ʃɪp/', meaning_vi: 'Tàu thủy', highlight: 'i' },
      { emoji: '🐟', word: 'Fish', ipa: '/fɪʃ/', meaning_vi: 'Con cá', highlight: 'i' },
      { emoji: '🪑', word: 'Sit', ipa: '/sɪt/', meaning_vi: 'Ngồi xuống', highlight: 'i' }
    ]
  },
  {
    symbol: '/ʊ/',
    name: 'Nguyên âm ngắn /ʊ/',
    category: 'monophthong_short',
    categoryLabel: 'Nguyên âm đơn NGẮN',
    isVoiced: true,
    mouthShape: 'Môi hơi tròn hướng nhẹ về phía trước, cuống lưỡi hơi nâng, phát âm rất nhanh và dứt khoát.',
    vietnameseGuide: 'Lai giữa "u" và "ư" trong tiếng Việt, không chu môi quá sâu.',
    spellingPatterns: ['oo (book, foot)', 'u (put, pull, push)', 'ou (could, would)'],
    audioSpelling: 'ooh',
    examples: [
      { emoji: '📖', word: 'Book', ipa: '/bʊk/', meaning_vi: 'Quyển sách', highlight: 'oo' },
      { emoji: '🦶', word: 'Foot', ipa: '/fʊt/', meaning_vi: 'Bàn chân', highlight: 'oo' },
      { emoji: '🐂', word: 'Bull', ipa: '/bʊl/', meaning_vi: 'Bò tót', highlight: 'u' }
    ]
  },
  {
    symbol: '/uː/',
    name: 'Nguyên âm dài /uː/',
    category: 'monophthong_long',
    categoryLabel: 'Nguyên âm đơn DÀI',
    isVoiced: true,
    mouthShape: 'Môi chu tròn nhỏ như huýt sáo, lưỡi lùi về sau, ngân dài âm u sâu trong họng.',
    vietnameseGuide: 'Đọc giống "u" tiếng Việt nhưng chu môi thật tròn và ngân dài đều.',
    spellingPatterns: ['oo (moon, food)', 'u_e (flute, tune)', 'ew (chew, new)', 'o (do, move)'],
    audioSpelling: 'ooo',
    examples: [
      { emoji: '🌙', word: 'Moon', ipa: '/muːn/', meaning_vi: 'Mặt trăng', highlight: 'oo' },
      { emoji: '🍲', word: 'Food', ipa: '/fuːd/', meaning_vi: 'Thức ăn', highlight: 'oo' },
      { emoji: '👞', word: 'Shoe', ipa: '/ʃuː/', meaning_vi: 'Đôi giày', highlight: 'oe' }
    ]
  },
  {
    symbol: '/e/',
    name: 'Nguyên âm ngắn /e/',
    category: 'monophthong_short',
    categoryLabel: 'Nguyên âm đơn NGẮN',
    isVoiced: true,
    mouthShape: 'Miệng mở rộng hơn âm /ɪ/, đầu lưỡi chạm chân răng dưới, phát âm gọn ghẽ.',
    vietnameseGuide: 'Tương tự âm "e" ngắn trong tiếng Việt (như trong "mẹ").',
    spellingPatterns: ['e (bed, pen, set)', 'ea (head, bread, dead)'],
    audioSpelling: 'eh',
    examples: [
      { emoji: '🛏️', word: 'Bed', ipa: '/bed/', meaning_vi: 'Chiếc giường', highlight: 'e' },
      { emoji: '🍞', word: 'Bread', ipa: '/bred/', meaning_vi: 'Bánh mì', highlight: 'ea' },
      { emoji: '🖊️', word: 'Pen', ipa: '/pen/', meaning_vi: 'Cây bút mực', highlight: 'e' }
    ]
  },
  {
    symbol: '/ə/',
    name: 'Âm lướt Schwa /ə/',
    category: 'monophthong_short',
    categoryLabel: 'Nguyên âm ngắn phổ biến nhất',
    isVoiced: true,
    mouthShape: 'Miệng hoàn toàn thả lỏng tự nhiên, không gồng bất kỳ cơ nào, phát âm nhẹ như tiếng thở khẽ.',
    vietnameseGuide: 'Đọc như "ờ" siêu nhẹ, xuất hiện ở 80% âm tiết không nhận trọng âm!',
    spellingPatterns: ['a (about, banana)', 'er (teacher)', 'o (police)', 'u (support)'],
    audioSpelling: 'uh',
    examples: [
      { emoji: '🍌', word: 'Banana', ipa: '/bəˈnæn.ə/', meaning_vi: 'Quả chuối (bờ-nan-nờ)', highlight: 'a' },
      { emoji: '👨‍🏫', word: 'Teacher', ipa: '/ˈtiː.tʃər/', meaning_vi: 'Thầy cô giáo', highlight: 'er' },
      { emoji: '🛋️', word: 'Sofa', ipa: '/ˈsəʊ.fə/', meaning_vi: 'Ghế sofa', highlight: 'a' }
    ]
  },
  {
    symbol: '/ɜː/',
    name: 'Nguyên âm dài /ɜː/',
    category: 'monophthong_long',
    categoryLabel: 'Nguyên âm đơn DÀI',
    isVoiced: true,
    mouthShape: 'Môi mở hờ tự nhiên, lưỡi giữ lơ lửng ở giữa vòm họng, phát âm trầm và ngân dài (ở Mỹ có cong lưỡi).',
    vietnameseGuide: 'Đọc như "ơ" trầm kéo dài, trong tiếng Anh-Mỹ thường uốn lưỡi theo chữ r.',
    spellingPatterns: ['er (her)', 'ir (bird, shirt)', 'ur (turn, nurse)', 'or (word, work)'],
    audioSpelling: 'ur',
    examples: [
      { emoji: '🐦', word: 'Bird', ipa: '/bɜːd/', meaning_vi: 'Con chim', highlight: 'ir' },
      { emoji: '👩‍⚕️', word: 'Nurse', ipa: '/nɜːs/', meaning_vi: 'Y tá', highlight: 'ur' },
      { emoji: '👗', word: 'Skirt', ipa: '/skɜːt/', meaning_vi: 'Chân váy', highlight: 'ir' }
    ]
  },
  {
    symbol: '/ɔː/',
    name: 'Nguyên âm dài /ɔː/',
    category: 'monophthong_long',
    categoryLabel: 'Nguyên âm đơn DÀI',
    isVoiced: true,
    mouthShape: 'Môi tròn mở vừa phải, cuống lưỡi hạ thấp, ngân dài âm o sâu từ cuống họng.',
    vietnameseGuide: 'Giống âm "o" sâu và ngân dài trong tiếng Việt.',
    spellingPatterns: ['or (fork, sport)', 'aw (saw, law)', 'al (ball, call)', 'au (autumn)'],
    audioSpelling: 'aw',
    examples: [
      { emoji: '🚪', word: 'Door', ipa: '/dɔːr/', meaning_vi: 'Cánh cửa', highlight: 'oor' },
      { emoji: '🍴', word: 'Fork', ipa: '/fɔːk/', meaning_vi: 'Chiếc nĩa', highlight: 'or' },
      { emoji: '🏀', word: 'Ball', ipa: '/bɔːl/', meaning_vi: 'Quả bóng', highlight: 'al' }
    ]
  },
  {
    symbol: '/æ/',
    name: 'Short A (A bẹt) /æ/',
    category: 'monophthong_short',
    categoryLabel: 'Nguyên âm đơn NGẮN',
    isVoiced: true,
    mouthShape: 'Hạ hàm dưới xuống sâu, khóe miệng kéo rộng sang hai bên, đầu lưỡi đè vào chân răng dưới.',
    vietnameseGuide: 'Âm "a bẹt" lai giữa "a" và "e". Miệng mở to như chuẩn bị cắn quả táo.',
    spellingPatterns: ['a (cat, map, apple, plan, black)'],
    audioSpelling: 'aa',
    examples: [
      { emoji: '🐱', word: 'Cat', ipa: '/kæt/', meaning_vi: 'Con mèo', highlight: 'a' },
      { emoji: '🍎', word: 'Apple', ipa: '/ˈæp.əl/', meaning_vi: 'Quả táo', highlight: 'a' },
      { emoji: '🗺️', word: 'Map', ipa: '/mæp/', meaning_vi: 'Bản đồ', highlight: 'a' }
    ]
  },
  {
    symbol: '/ʌ/',
    name: 'Short U /ʌ/',
    category: 'monophthong_short',
    categoryLabel: 'Nguyên âm đơn NGẮN',
    isVoiced: true,
    mouthShape: 'Miệng mở vừa phải, lưỡi hạ thấp tự nhiên, phát âm dứt khoát dồn hơi từ bụng.',
    vietnameseGuide: 'Tương tự âm "á" hoặc "â" ngắn dứt khoát trong tiếng Việt.',
    spellingPatterns: ['u (cup, sun, bus)', 'o (love, money, come)', 'ou (country, touch)'],
    audioSpelling: 'uh',
    examples: [
      { emoji: '☕', word: 'Cup', ipa: '/kʌp/', meaning_vi: 'Cái cốc', highlight: 'u' },
      { emoji: '☀️', word: 'Sun', ipa: '/sʌn/', meaning_vi: 'Mặt trời', highlight: 'u' },
      { emoji: '🚌', word: 'Bus', ipa: '/bʌs/', meaning_vi: 'Xe buýt', highlight: 'u' }
    ]
  },
  {
    symbol: '/ɑː/',
    name: 'Nguyên âm dài /ɑː/',
    category: 'monophthong_long',
    categoryLabel: 'Nguyên âm đơn DÀI',
    isVoiced: true,
    mouthShape: 'Hạ hàm thật sâu mở to miệng hết cỡ như khi bác sĩ bảo "Aaa", phát âm trầm ấm.',
    vietnameseGuide: 'Âm "a" mở miệng to ngân dài trầm.',
    spellingPatterns: ['ar (car, star, party)', 'a (father, palm, calm)'],
    audioSpelling: 'aah',
    examples: [
      { emoji: '🚗', word: 'Car', ipa: '/kɑːr/', meaning_vi: 'Chiếc ô tô', highlight: 'ar' },
      { emoji: '⭐', word: 'Star', ipa: '/stɑːr/', meaning_vi: 'Ngôi sao', highlight: 'ar' },
      { emoji: '❤️', word: 'Heart', ipa: '/hɑːt/', meaning_vi: 'Trái tim', highlight: 'ear' }
    ]
  },
  {
    symbol: '/ɒ/',
    name: 'Short O /ɒ/',
    category: 'monophthong_short',
    categoryLabel: 'Nguyên âm đơn NGẮN',
    isVoiced: true,
    mouthShape: 'Miệng mở tròn nhẹ hơi hướng về trước, phát âm rất ngắn và dứt khoát.',
    vietnameseGuide: 'Âm "o" ngắn gọn (ở Anh đọc tròn /ɒ/, ở Mỹ đọc mở rộng /ɑː/).',
    spellingPatterns: ['o (hot, box, dog, clock)', 'a (watch, want)'],
    audioSpelling: 'aw',
    examples: [
      { emoji: '☕', word: 'Hot', ipa: '/hɒt/', meaning_vi: 'Nóng bức', highlight: 'o' },
      { emoji: '📦', word: 'Box', ipa: '/bɒks/', meaning_vi: 'Cái hộp', highlight: 'o' },
      { emoji: '⌚', word: 'Watch', ipa: '/wɒtʃ/', meaning_vi: 'Đồng hồ', highlight: 'a' }
    ]
  },

  // 8 Diphthongs (Nguyên âm đôi)
  {
    symbol: '/eɪ/',
    name: 'Nguyên âm đôi /eɪ/',
    category: 'diphthong',
    categoryLabel: 'Nguyên âm đôi (Diphthong)',
    isVoiced: true,
    mouthShape: 'Bắt đầu từ âm /e/ mở miệng vừa rồi trượt nhanh nhẹn sang âm /ɪ/ dẹt khóe môi.',
    vietnameseGuide: 'Đọc như "ây" kéo lướt mượt mà.',
    spellingPatterns: ['a_e (cake, make)', 'ai (rain, wait)', 'ay (day, play)', 'ei (eight)'],
    audioSpelling: 'ay',
    examples: [
      { emoji: '🎂', word: 'Cake', ipa: '/keɪk/', meaning_vi: 'Bánh kem', highlight: 'a_e' },
      { emoji: '🌧️', word: 'Rain', ipa: '/reɪn/', meaning_vi: 'Cơn mưa', highlight: 'ai' },
      { emoji: '🎮', word: 'Play', ipa: '/pleɪ/', meaning_vi: 'Chơi đùa', highlight: 'ay' }
    ]
  },
  {
    symbol: '/aɪ/',
    name: 'Nguyên âm đôi /aɪ/',
    category: 'diphthong',
    categoryLabel: 'Nguyên âm đôi (Diphthong)',
    isVoiced: true,
    mouthShape: 'Mở rộng miệng phát âm /a/ rồi trượt thu gọn về âm /ɪ/.',
    vietnameseGuide: 'Đọc như "ai" với âm đầu mở to hơn tiếng Việt.',
    spellingPatterns: ['i_e (kite, time)', 'y (my, sky, fly)', 'igh (night, light)', 'ie (pie, tie)'],
    audioSpelling: 'eye',
    examples: [
      { emoji: '🪁', word: 'Kite', ipa: '/kaɪt/', meaning_vi: 'Con diều', highlight: 'i_e' },
      { emoji: '🌌', word: 'Sky', ipa: '/skaɪ/', meaning_vi: 'Bầu trời', highlight: 'y' },
      { emoji: '💡', word: 'Light', ipa: '/laɪt/', meaning_vi: 'Ánh sáng', highlight: 'igh' }
    ]
  },
  {
    symbol: '/ɔɪ/',
    name: 'Nguyên âm đôi /ɔɪ/',
    category: 'diphthong',
    categoryLabel: 'Nguyên âm đôi (Diphthong)',
    isVoiced: true,
    mouthShape: 'Bắt đầu môi tròn từ /ɔː/ rồi trượt chuyển động sang /ɪ/.',
    vietnameseGuide: 'Đọc như "oi" mượt mà.',
    spellingPatterns: ['oi (coin, oil, boil)', 'oy (boy, toy, enjoy)'],
    audioSpelling: 'oy',
    examples: [
      { emoji: '🪙', word: 'Coin', ipa: '/kɔɪn/', meaning_vi: 'Đồng xu', highlight: 'oi' },
      { emoji: '👦', word: 'Boy', ipa: '/bɔɪ/', meaning_vi: 'Cậu bé', highlight: 'oy' },
      { emoji: '🧸', word: 'Toy', ipa: '/tɔɪ/', meaning_vi: 'Đồ chơi', highlight: 'oy' }
    ]
  },
  {
    symbol: '/aʊ/',
    name: 'Nguyên âm đôi /aʊ/',
    category: 'diphthong',
    categoryLabel: 'Nguyên âm đôi (Diphthong)',
    isVoiced: true,
    mouthShape: 'Mở miệng to từ /a/ rồi chu tròn lướt về /ʊ/.',
    vietnameseGuide: 'Đọc như "ao" trong tiếng Việt nhưng mở rộng âm đầu hơn.',
    spellingPatterns: ['ou (house, mouse, cloud)', 'ow (cow, now, brown)'],
    audioSpelling: 'ow',
    examples: [
      { emoji: '🏡', word: 'House', ipa: '/haʊs/', meaning_vi: 'Ngôi nhà', highlight: 'ou' },
      { emoji: '🐄', word: 'Cow', ipa: '/kaʊ/', meaning_vi: 'Con bò sữa', highlight: 'ow' },
      { emoji: '☁️', word: 'Cloud', ipa: '/klaʊd/', meaning_vi: 'Đám mây', highlight: 'ou' }
    ]
  },
  {
    symbol: '/əʊ/',
    name: 'Nguyên âm đôi /əʊ/',
    category: 'diphthong',
    categoryLabel: 'Nguyên âm đôi (Diphthong)',
    isVoiced: true,
    mouthShape: 'Bắt đầu từ âm /ə/ thả lỏng rồi tròn môi trượt về /ʊ/.',
    vietnameseGuide: 'Đọc như "âu" (Anh) hoặc "ô-u" (Mỹ).',
    spellingPatterns: ['o_e (home, note, rope)', 'oa (boat, goat, coat)', 'ow (slow, snow)'],
    audioSpelling: 'oh',
    examples: [
      { emoji: '⛵', word: 'Boat', ipa: '/bəʊt/', meaning_vi: 'Chiếc thuyền', highlight: 'oa' },
      { emoji: '❄️', word: 'Snow', ipa: '/snəʊ/', meaning_vi: 'Tuyết trắng', highlight: 'ow' },
      { emoji: '🌹', word: 'Rose', ipa: '/rəʊz/', meaning_vi: 'Bông hoa hồng', highlight: 'o_e' }
    ]
  },
  {
    symbol: '/ɪə/',
    name: 'Nguyên âm đôi /ɪə/',
    category: 'diphthong',
    categoryLabel: 'Nguyên âm đôi (Diphthong)',
    isVoiced: true,
    mouthShape: 'Bắt đầu từ âm /ɪ/ rồi thả lỏng lướt về âm Schwa /ə/.',
    vietnameseGuide: 'Đọc như "ia" hoặc "i-ờ" lướt nhẹ.',
    spellingPatterns: ['ear (hear, clear, ear)', 'eer (beer, deer)', 'ere (here)'],
    audioSpelling: 'ear',
    examples: [
      { emoji: '👂', word: 'Ear', ipa: '/ɪər/', meaning_vi: 'Cái tai', highlight: 'ear' },
      { emoji: '🍺', word: 'Beer', ipa: '/bɪər/', meaning_vi: 'Ly bia', highlight: 'eer' },
      { emoji: '🦌', word: 'Deer', ipa: '/dɪər/', meaning_vi: 'Con hươu', highlight: 'eer' }
    ]
  },
  {
    symbol: '/eə/',
    name: 'Nguyên âm đôi /eə/',
    category: 'diphthong',
    categoryLabel: 'Nguyên âm đôi (Diphthong)',
    isVoiced: true,
    mouthShape: 'Bắt đầu từ âm /e/ mở miệng vừa rồi trượt nhẹ về /ə/.',
    vietnameseGuide: 'Đọc như "e-ờ" hoặc "e-a".',
    spellingPatterns: ['air (chair, hair)', 'are (care, share)', 'ear (bear, wear)'],
    audioSpelling: 'air',
    examples: [
      { emoji: '🪑', word: 'Chair', ipa: '/tʃeər/', meaning_vi: 'Chiếc ghế', highlight: 'air' },
      { emoji: '💇', word: 'Hair', ipa: '/heər/', meaning_vi: 'Mái tóc', highlight: 'air' },
      { emoji: '🐻', word: 'Bear', ipa: '/beər/', meaning_vi: 'Con gấu', highlight: 'ear' }
    ]
  },
  {
    symbol: '/ʊə/',
    name: 'Nguyên âm đôi /ʊə/',
    category: 'diphthong',
    categoryLabel: 'Nguyên âm đôi (Diphthong)',
    isVoiced: true,
    mouthShape: 'Môi hơi tròn từ /ʊ/ rồi thả lỏng mở về âm Schwa /ə/.',
    vietnameseGuide: 'Đọc như "ua" hoặc "u-ờ".',
    spellingPatterns: ['oor (poor)', 'our (tour)', 'ure (sure, pure)'],
    audioSpelling: 'ooh-uh',
    examples: [
      { emoji: '🧳', word: 'Tour', ipa: '/tʊər/', meaning_vi: 'Chuyến du lịch', highlight: 'our' },
      { emoji: '✨', word: 'Pure', ipa: '/pjʊər/', meaning_vi: 'Tinh khiết', highlight: 'ure' },
      { emoji: '🤝', word: 'Sure', ipa: '/ʃʊər/', meaning_vi: 'Chắc chắn', highlight: 'ure' }
    ]
  },

  // 24 Consonants (Phụ âm)
  // 8 Cặp vô thanh / hữu thanh
  {
    symbol: '/p/',
    name: 'Phụ âm bật hơi vô thanh /p/',
    category: 'consonant_unvoiced',
    categoryLabel: 'Phụ âm VÔ THANH (Bật hơi)',
    isVoiced: false,
    mouthShape: 'Mím chặt hai môi lại dồn hơi rồi bung mở thật mạnh luồng gió ra ngoài, thanh quản KHÔNG rung.',
    vietnameseGuide: 'Bật hơi mạnh làm bay tờ giấy đặt trước miệng.',
    spellingPatterns: ['p (pen, pig, hop, apple)'],
    audioSpelling: 'p',
    examples: [
      { emoji: '🖊️', word: 'Pen', ipa: '/pen/', meaning_vi: 'Cây bút', highlight: 'p' },
      { emoji: '🐷', word: 'Pig', ipa: '/pɪɡ/', meaning_vi: 'Chú lợn con', highlight: 'p' }
    ],
    minimalPair: {
      word1: 'Pen',
      ipa1: '/pen/',
      meaning1: 'Cây bút (vô thanh)',
      word2: 'Ben',
      ipa2: '/ben/',
      meaning2: 'Tên người (hữu thanh)',
      note: 'P bật hơi làm bay giấy, B rung cổ không bật gió.'
    }
  },
  {
    symbol: '/b/',
    name: 'Phụ âm hữu thanh /b/',
    category: 'consonant_voiced',
    categoryLabel: 'Phụ âm HỮU THANH (Rung)',
    isVoiced: true,
    mouthShape: 'Hai môi mím lại và mở ra trong khi dây thanh quản RUNG MẠNH từ bên trong.',
    vietnameseGuide: 'Giống chữ "b" tiếng Việt, cảm nhận độ rung ở cổ.',
    spellingPatterns: ['b (book, baby, big, table)'],
    audioSpelling: 'b',
    examples: [
      { emoji: '📖', word: 'Book', ipa: '/bʊk/', meaning_vi: 'Quyển sách', highlight: 'b' },
      { emoji: '👶', word: 'Baby', ipa: '/ˈbeɪ.bi/', meaning_vi: 'Em bé', highlight: 'b' }
    ]
  },
  {
    symbol: '/t/',
    name: 'Phụ âm bật hơi vô thanh /t/',
    category: 'consonant_unvoiced',
    categoryLabel: 'Phụ âm VÔ THANH (Bật hơi)',
    isVoiced: false,
    mouthShape: 'Đầu lưỡi ép chặt chân răng trên rồi bật dứt khoát luồng hơi mạnh ra ngoài.',
    vietnameseGuide: 'Đầu lưỡi chạm nướu trên bật hơi, không rung cổ họng.',
    spellingPatterns: ['t (tea, time, cat, water)', 'tt (butter)'],
    audioSpelling: 't',
    examples: [
      { emoji: '🍵', word: 'Tea', ipa: '/tiː/', meaning_vi: 'Trà nóng', highlight: 't' },
      { emoji: '⏰', word: 'Time', ipa: '/taɪm/', meaning_vi: 'Thời gian', highlight: 't' }
    ]
  },
  {
    symbol: '/d/',
    name: 'Phụ âm hữu thanh /d/',
    category: 'consonant_voiced',
    categoryLabel: 'Phụ âm HỮU THANH (Rung)',
    isVoiced: true,
    mouthShape: 'Vị trí lưỡi giống /t/ nhưng RUNG DÂY THANH QUẢN mạnh mẽ.',
    vietnameseGuide: 'Đầu lưỡi bật nướu trên kèm rung cổ họng.',
    spellingPatterns: ['d (dog, door, day, head)', 'dd (ladder)'],
    audioSpelling: 'd',
    examples: [
      { emoji: '🐶', word: 'Dog', ipa: '/dɒɡ/', meaning_vi: 'Chú chó', highlight: 'd' },
      { emoji: '🚪', word: 'Door', ipa: '/dɔːr/', meaning_vi: 'Cửa ra vào', highlight: 'd' }
    ]
  },
  {
    symbol: '/tʃ/',
    name: 'Phụ âm bật hơi vô thanh /tʃ/',
    category: 'consonant_unvoiced',
    categoryLabel: 'Phụ âm VÔ THANH (Chu môi)',
    isVoiced: false,
    mouthShape: 'Chu môi tròn về trước, đầu lưỡi chạm nướu trên rồi giật lùi bật ra luồng hơi mạnh.',
    vietnameseGuide: 'Giống âm "ch" tiếng Việt nhưng chu môi và giật luồng hơi dứt khoát.',
    spellingPatterns: ['ch (chair, cheese, church)', 'tch (watch, match)', 't (picture, nature)'],
    audioSpelling: 'ch',
    examples: [
      { emoji: '🧀', word: 'Cheese', ipa: '/tʃiːz/', meaning_vi: 'Miếng phô mai', highlight: 'ch' },
      { emoji: '🪑', word: 'Chair', ipa: '/tʃeər/', meaning_vi: 'Chiếc ghế', highlight: 'ch' }
    ]
  },
  {
    symbol: '/dʒ/',
    name: 'Phụ âm hữu thanh /dʒ/',
    category: 'consonant_voiced',
    categoryLabel: 'Phụ âm HỮU THANH (Rung)',
    isVoiced: true,
    mouthShape: 'Khẩu hình giống /tʃ/ nhưng dây thanh quản RUNG RẤT MẠNH.',
    vietnameseGuide: 'Chu môi tròn và rung cổ họng phát âm "gi".',
    spellingPatterns: ['j (jam, jump, job)', 'g (gym, giant, page)', 'dge (bridge, edge)'],
    audioSpelling: 'j',
    examples: [
      { emoji: '🫙', word: 'Jam', ipa: '/dʒæm/', meaning_vi: 'Lọ mứt dâu', highlight: 'j' },
      { emoji: '🌉', word: 'Bridge', ipa: '/brɪdʒ/', meaning_vi: 'Cây cầu bắc qua sông', highlight: 'dge' }
    ]
  },
  {
    symbol: '/k/',
    name: 'Phụ âm vô thanh /k/',
    category: 'consonant_unvoiced',
    categoryLabel: 'Phụ âm VÔ THANH (Bật hơi)',
    isVoiced: false,
    mouthShape: 'Cuống lưỡi nâng chạm ngạc mềm (vòm họng sau) rồi hạ xuống bật hơi mạnh mẽ.',
    vietnameseGuide: 'Bật hơi từ cuống họng, giống "k" nhưng có luồng gió.',
    spellingPatterns: ['k (key, kite)', 'c (cat, cup)', 'ck (black, clock)', 'ch (school, echo)'],
    audioSpelling: 'k',
    examples: [
      { emoji: '🔑', word: 'Key', ipa: '/kiː/', meaning_vi: 'Chìa khóa', highlight: 'k' },
      { emoji: '🐱', word: 'Cat', ipa: '/kæt/', meaning_vi: 'Con mèo', highlight: 'c' }
    ]
  },
  {
    symbol: '/ɡ/',
    name: 'Phụ âm hữu thanh /ɡ/',
    category: 'consonant_voiced',
    categoryLabel: 'Phụ âm HỮU THANH (Rung)',
    isVoiced: true,
    mouthShape: 'Vị trí cuống lưỡi giống /k/ nhưng RUNG DÂY THANH QUẢN.',
    vietnameseGuide: 'Giống âm "g" tiếng Việt kèm độ rung ở đáy họng.',
    spellingPatterns: ['g (go, green, dog)', 'gg (egg)'],
    audioSpelling: 'g',
    examples: [
      { emoji: '🟢', word: 'Green', ipa: '/ɡriːn/', meaning_vi: 'Màu xanh lá', highlight: 'g' },
      { emoji: '🥚', word: 'Egg', ipa: '/eɡ/', meaning_vi: 'Quả trứng', highlight: 'gg' }
    ]
  },
  {
    symbol: '/f/',
    name: 'Phụ âm vô thanh /f/',
    category: 'consonant_unvoiced',
    categoryLabel: 'Phụ âm VÔ THANH (Cắn môi thổi hơi)',
    isVoiced: false,
    mouthShape: 'Răng cửa trên chạm nhẹ môi dưới, thổi luồng hơi nhẹ qua kẽ răng.',
    vietnameseGuide: 'Răng trên cắn môi dưới thổi gió, không rung thanh quản.',
    spellingPatterns: ['f (fish, four)', 'ph (phone, photo)', 'gh (laugh, enough)'],
    audioSpelling: 'f',
    examples: [
      { emoji: '🐟', word: 'Fish', ipa: '/fɪʃ/', meaning_vi: 'Con cá', highlight: 'f' },
      { emoji: '📱', word: 'Phone', ipa: '/fəʊn/', meaning_vi: 'Điện thoại', highlight: 'ph' }
    ]
  },
  {
    symbol: '/v/',
    name: 'Phụ âm hữu thanh /v/',
    category: 'consonant_voiced',
    categoryLabel: 'Phụ âm HỮU THANH (Cắn môi rung)',
    isVoiced: true,
    mouthShape: 'Răng trên chạm môi dưới giống /f/ nhưng RUNG DÂY THANH QUẢN liên tục.',
    vietnameseGuide: 'Cắn môi dưới rung cổ họng như tiếng xe motor nổ.',
    spellingPatterns: ['v (van, voice, live, river)'],
    audioSpelling: 'v',
    examples: [
      { emoji: '🚐', word: 'Van', ipa: '/væn/', meaning_vi: 'Xe tải nhỏ', highlight: 'v' },
      { emoji: '🌊', word: 'River', ipa: '/ˈrɪv.ər/', meaning_vi: 'Dòng sông', highlight: 'v' }
    ]
  },
  {
    symbol: '/θ/',
    name: 'Phụ âm vô thanh TH thổi /θ/',
    category: 'consonant_unvoiced',
    categoryLabel: 'Phụ âm VÔ THANH (Kẹp lưỡi thổi)',
    isVoiced: false,
    mouthShape: 'Đặt nhẹ đầu lưỡi ở giữa hai hàm răng, thổi luồng hơi mỏng ra ngoài KHÔNG rung cổ.',
    vietnameseGuide: 'Cắn nhẹ đầu lưỡi thổi gió xì ra, tuyệt đối không đọc thành "th" hay "t" hay "s".',
    spellingPatterns: ['th (think, bath, mouth, three, thin)'],
    audioSpelling: 'th',
    examples: [
      { emoji: '🤔', word: 'Think', ipa: '/θɪŋk/', meaning_vi: 'Suy nghĩ', highlight: 'th' },
      { emoji: '3️⃣', word: 'Three', ipa: '/θriː/', meaning_vi: 'Số ba', highlight: 'th' }
    ],
    minimalPair: {
      word1: 'Think',
      ipa1: '/θɪŋk/',
      meaning1: 'Suy nghĩ (kẹp lưỡi thổi gió)',
      word2: 'Sink',
      ipa2: '/sɪŋk/',
      meaning2: 'Chìm / bồn rửa (khép răng xì)',
      note: 'Think lưỡi thò ra giữa răng thổi; Sink khép chặt hai hàm răng.'
    }
  },
  {
    symbol: '/ð/',
    name: 'Phụ âm hữu thanh TH rung /ð/',
    category: 'consonant_voiced',
    categoryLabel: 'Phụ âm HỮU THANH (Kẹp lưỡi rung)',
    isVoiced: true,
    mouthShape: 'Đặt đầu lưỡi giữa hai hàm răng giống /θ/ nhưng RUNG DÂY THANH QUẢN.',
    vietnameseGuide: 'Kẹp nhẹ đầu lưỡi rung cổ họng, đọc trong this, that, mother.',
    spellingPatterns: ['th (this, that, these, mother, father, with)'],
    audioSpelling: 'th',
    examples: [
      { emoji: '👉', word: 'This', ipa: '/ðɪs/', meaning_vi: 'Cái này', highlight: 'th' },
      { emoji: '👩', word: 'Mother', ipa: '/ˈmʌð.ər/', meaning_vi: 'Mẹ yêu', highlight: 'th' }
    ]
  },
  {
    symbol: '/s/',
    name: 'Phụ âm xì vô thanh /s/',
    category: 'consonant_unvoiced',
    categoryLabel: 'Phụ âm VÔ THANH (Xì hơi)',
    isVoiced: false,
    mouthShape: 'Khép nhẹ hai hàm răng, đầu lưỡi sát chân răng trên, ép luồng gió xì sắc bén.',
    vietnameseGuide: 'Âm xì hơi sắc nét như tiếng rắn kêu "ssss".',
    spellingPatterns: ['s (see, sun, bus)', 'c (city, rice)', 'ss (glass)'],
    audioSpelling: 's',
    examples: [
      { emoji: '☀️', word: 'Sun', ipa: '/sʌn/', meaning_vi: 'Mặt trời', highlight: 's' },
      { emoji: '🏙️', word: 'City', ipa: '/ˈsɪt.i/', meaning_vi: 'Thành phố', highlight: 'c' }
    ]
  },
  {
    symbol: '/z/',
    name: 'Phụ âm rung hữu thanh /z/',
    category: 'consonant_voiced',
    categoryLabel: 'Phụ âm HỮU THANH (Rung)',
    isVoiced: true,
    mouthShape: 'Khép răng giống /s/ nhưng RUNG DÂY THANH QUẢN như tiếng ong vò vẽ.',
    vietnameseGuide: 'Khép răng rung cổ họng liên tục.',
    spellingPatterns: ['z (zoo, zebra, zero)', 's (is, rose, easy, dogs)'],
    audioSpelling: 'z',
    examples: [
      { emoji: '🦓', word: 'Zebra', ipa: '/ˈzeb.rə/', meaning_vi: 'Ngựa vằn', highlight: 'z' },
      { emoji: '🌹', word: 'Rose', ipa: '/rəʊz/', meaning_vi: 'Hoa hồng', highlight: 's' }
    ]
  },
  {
    symbol: '/ʃ/',
    name: 'Phụ âm vô thanh sờ nặng /ʃ/',
    category: 'consonant_unvoiced',
    categoryLabel: 'Phụ âm VÔ THANH (Chu môi)',
    isVoiced: false,
    mouthShape: 'Chu môi tròn về trước, đầu lưỡi uốn nhẹ, đẩy luồng hơi mạnh ra ngoài (như ra hiệu im lặng "suỵt").',
    vietnameseGuide: 'Chu môi tròn thổi hơi như tiếng "suỵt", tròn môi hơn s tiếng Việt.',
    spellingPatterns: ['sh (ship, shoe, wash)', 'ti (nation)', 'ci (special)', 'ss (mission)'],
    audioSpelling: 'sh',
    examples: [
      { emoji: '🚢', word: 'Ship', ipa: '/ʃɪp/', meaning_vi: 'Tàu biển', highlight: 'sh' },
      { emoji: '👞', word: 'Shoe', ipa: '/ʃuː/', meaning_vi: 'Chiếc giày', highlight: 'sh' }
    ]
  },
  {
    symbol: '/ʒ/',
    name: 'Phụ âm hữu thanh /ʒ/',
    category: 'consonant_voiced',
    categoryLabel: 'Phụ âm HỮU THANH (Rung)',
    isVoiced: true,
    mouthShape: 'Khẩu hình giống /ʃ/ nhưng RUNG DÂY THANH QUẢN thật mạnh.',
    vietnameseGuide: 'Chu môi tròn rung cổ họng phát âm "gi".',
    spellingPatterns: ['s (measure, pleasure, vision)', 'ge (beige, garage)'],
    audioSpelling: 'zh',
    examples: [
      { emoji: '📺', word: 'Television', ipa: '/ˈtel.ɪ.vɪʒ.ən/', meaning_vi: 'Ti vi', highlight: 's' },
      { emoji: '📏', word: 'Measure', ipa: '/ˈmeʒ.ər/', meaning_vi: 'Đo lường', highlight: 's' }
    ]
  },

  // 8 phụ âm còn lại: Nasals, Approximants & Glottal
  {
    symbol: '/m/',
    name: 'Âm mũi /m/',
    category: 'consonant_other',
    categoryLabel: 'Âm mũi (Nasal)',
    isVoiced: true,
    mouthShape: 'Mím chặt hai môi, luồng hơi thoát ra qua đường mũi.',
    vietnameseGuide: 'Giống chữ "m" tiếng Việt.',
    spellingPatterns: ['m (man, map, come, moon)'],
    audioSpelling: 'm',
    examples: [
      { emoji: '🌙', word: 'Moon', ipa: '/muːn/', meaning_vi: 'Mặt trăng', highlight: 'm' },
      { emoji: '🗺️', word: 'Map', ipa: '/mæp/', meaning_vi: 'Bản đồ', highlight: 'm' }
    ]
  },
  {
    symbol: '/n/',
    name: 'Âm mũi /n/',
    category: 'consonant_other',
    categoryLabel: 'Âm mũi (Nasal)',
    isVoiced: true,
    mouthShape: 'Đầu lưỡi dán chặt chân răng trên, luồng hơi dồn thoát qua mũi.',
    vietnameseGuide: 'Giống chữ "n" tiếng Việt.',
    spellingPatterns: ['n (no, sun, pen, ten)', 'kn (know, knife)'],
    audioSpelling: 'n',
    examples: [
      { emoji: '☀️', word: 'Sun', ipa: '/sʌn/', meaning_vi: 'Mặt trời', highlight: 'n' },
      { emoji: '👃', word: 'Nose', ipa: '/nəʊz/', meaning_vi: 'Chiếc mũi', highlight: 'n' }
    ]
  },
  {
    symbol: '/ŋ/',
    name: 'Âm mũi ng /ŋ/',
    category: 'consonant_other',
    categoryLabel: 'Âm mũi (Nasal)',
    isVoiced: true,
    mouthShape: 'Cuống lưỡi nâng chạm vòm họng mềm, hơi thoát qua mũi, miệng mở tự nhiên.',
    vietnameseGuide: 'Giống chữ "ng" cuối từ như "sing", "song" trong tiếng Việt.',
    spellingPatterns: ['ng (sing, ring, song, long)', 'nk (think, bank)'],
    audioSpelling: 'ng',
    examples: [
      { emoji: '💍', word: 'Ring', ipa: '/rɪŋ/', meaning_vi: 'Chiếc nhẫn', highlight: 'ng' },
      { emoji: '🎤', word: 'Sing', ipa: '/sɪŋ/', meaning_vi: 'Hát ca', highlight: 'ng' }
    ]
  },
  {
    symbol: '/h/',
    name: 'Phụ âm thở hơi /h/',
    category: 'consonant_other',
    categoryLabel: 'Âm thở họng (Glottal)',
    isVoiced: false,
    mouthShape: 'Miệng mở theo nguyên âm sau nó, đẩy luồng hơi nhẹ nhàng từ cuống họng.',
    vietnameseGuide: 'Thở nhẹ nhàng như tiếng thở dốc sau khi chạy bộ.',
    spellingPatterns: ['h (hat, house, happy, hot)', 'wh (who, whose)'],
    audioSpelling: 'h',
    examples: [
      { emoji: '🎩', word: 'Hat', ipa: '/hæt/', meaning_vi: 'Chiếc mũ', highlight: 'h' },
      { emoji: '🏠', word: 'House', ipa: '/haʊs/', meaning_vi: 'Ngôi nhà', highlight: 'h' }
    ]
  },
  {
    symbol: '/l/',
    name: 'Âm bên /l/',
    category: 'consonant_other',
    categoryLabel: 'Âm bên (Lateral Approximant)',
    isVoiced: true,
    mouthShape: 'Đầu lưỡi chạm nướu trên, luồng hơi lách qua 2 bên mép lưỡi.',
    vietnameseGuide: 'Đầu lưỡi chạm chân răng trên. Ở cuối từ (Dark L) cuộn lưỡi tạo âm "ồ" trầm.',
    spellingPatterns: ['l (light, love, play)', 'll (ball, call, full)'],
    audioSpelling: 'l',
    examples: [
      { emoji: '🦁', word: 'Lion', ipa: '/ˈlaɪ.ən/', meaning_vi: 'Sư tử', highlight: 'l' },
      { emoji: '🏀', word: 'Ball', ipa: '/bɔːl/', meaning_vi: 'Quả bóng', highlight: 'll' }
    ]
  },
  {
    symbol: '/r/',
    name: 'Âm cong lưỡi /r/',
    category: 'consonant_other',
    categoryLabel: 'Âm cong lưỡi (Approximant)',
    isVoiced: true,
    mouthShape: 'Đầu lưỡi uốn cong về sau vòm họng và giữ lơ lửng KHÔNG chạm bất cứ đâu.',
    vietnameseGuide: 'Uốn cong lưỡi không chạm vòm họng, môi hơi tròn nhẹ.',
    spellingPatterns: ['r (red, run, road)', 'rr (mirror, carrot)', 'wr (write, wrong)'],
    audioSpelling: 'r',
    examples: [
      { emoji: '🔴', word: 'Red', ipa: '/red/', meaning_vi: 'Màu đỏ thắm', highlight: 'r' },
      { emoji: '🚀', word: 'Rocket', ipa: '/ˈrɒk.ɪt/', meaning_vi: 'Tên lửa', highlight: 'r' }
    ]
  },
  {
    symbol: '/w/',
    name: 'Bán nguyên âm /w/',
    category: 'consonant_other',
    categoryLabel: 'Bán nguyên âm (Semi-vowel)',
    isVoiced: true,
    mouthShape: 'Chu môi tròn thật nhỏ rồi nhanh chóng mở ra chuyển sang nguyên âm tiếp theo.',
    vietnameseGuide: 'Chu tròn môi như chuẩn bị huýt sáo rồi bung ra.',
    spellingPatterns: ['w (wet, win, water, walk)', 'wh (what, when, white)'],
    audioSpelling: 'w',
    examples: [
      { emoji: '💧', word: 'Water', ipa: '/ˈwɔː.tər/', meaning_vi: 'Nước lọc', highlight: 'w' },
      { emoji: '🌬️', word: 'Wind', ipa: '/wɪnd/', meaning_vi: 'Cơn gió', highlight: 'w' }
    ]
  },
  {
    symbol: '/j/',
    name: 'Bán nguyên âm /j/',
    category: 'consonant_other',
    categoryLabel: 'Bán nguyên âm (Semi-vowel)',
    isVoiced: true,
    mouthShape: 'Mặt lưỡi nâng gần ngạc cứng như đang phát âm /i/ rồi trượt mượt mà sang nguyên âm kế tiếp.',
    vietnameseGuide: 'Tương tự âm "d" nhẹ miền Nam (như "dạ", "dữ dội").',
    spellingPatterns: ['y (yes, you, yellow, young)', 'u (use, cute, music)'],
    audioSpelling: 'y',
    examples: [
      { emoji: '🟡', word: 'Yellow', ipa: '/ˈjel.əʊ/', meaning_vi: 'Màu vàng', highlight: 'y' },
      { emoji: '🛥️', word: 'Yacht', ipa: '/jɒt/', meaning_vi: 'Du thuyền', highlight: 'y' }
    ]
  }
];

export const CONFUSING_PAIRS: ConfusingPair[] = [
  {
    id: 'e_vs_i',
    title: 'Chữ cái E vs I',
    tag: 'Tên chữ cái hay bị đảo ngược',
    summary: '90% người học Việt Nam bị nhầm tên chữ cái E và I do thói quen nhìn chữ tiếng Việt.',
    itemA: {
      label: 'Chữ E',
      ipa: '/iː/',
      howToSay: 'Đọc tên là "i" kéo dài',
      example: 'Email',
      exampleIpa: '/ˈiː.meɪl/',
      exampleVi: 'Hộp thư điện tử',
      emoji: '📧'
    },
    itemB: {
      label: 'Chữ I',
      ipa: '/aɪ/',
      howToSay: 'Đọc tên là "ai"',
      example: 'Ice cream',
      exampleIpa: '/ˈaɪs ˌkriːm/',
      exampleVi: 'Cây kem',
      emoji: '🍦'
    },
    proTip: 'Mẹo nhớ: "I" là "tôi" (Tôi thích kem = Ice cream = /aɪ/). Còn "E" cười toe toét đọc là /iː/!'
  },
  {
    id: 'g_vs_j',
    title: 'Chữ cái G vs J',
    tag: 'Cặp phụ âm chu môi',
    summary: 'Cả hai đều phát âm âm gió /dʒ/ nhưng tên gọi khác nhau ở nguyên âm đuôi.',
    itemA: {
      label: 'Chữ G',
      ipa: '/dʒiː/',
      howToSay: 'Đọc là "di" (đuôi âm i)',
      example: 'Gmail',
      exampleIpa: '/ˈdʒiː.meɪl/',
      exampleVi: 'Hòm thư Google',
      emoji: '📮'
    },
    itemB: {
      label: 'Chữ J',
      ipa: '/dʒeɪ/',
      howToSay: 'Đọc là "dây" (đuôi âm ây)',
      example: 'Juice',
      exampleIpa: '/dʒuːs/',
      exampleVi: 'Nước hoa quả',
      emoji: '🧃'
    },
    proTip: 'G tận cùng bằng âm /iː/, J tận cùng bằng âm /eɪ/. Nhớ câu: "G thì G-mail, J thì Japan / Juice".'
  },
  {
    id: 'b_vs_p',
    title: 'Âm /b/ vs /p/',
    tag: 'Rung cổ vs Bật hơi',
    summary: 'Rất nhiều người nói tiếng Anh không bật hơi âm /p/ khiến người bản xứ nghe nhầm thành /b/.',
    itemA: {
      label: 'Âm /p/',
      ipa: '/p/ (Vô thanh)',
      howToSay: 'Mím môi BẬT HƠI làm bay giấy',
      example: 'Pig',
      exampleIpa: '/pɪɡ/',
      exampleVi: 'Con lợn (bật gió)',
      emoji: '🐷'
    },
    itemB: {
      label: 'Âm /b/',
      ipa: '/b/ (Hữu thanh)',
      howToSay: 'Mím môi RUNG THANH QUẢN',
      example: 'Big',
      exampleIpa: '/bɪɡ/',
      exampleVi: 'To lớn (rung cổ)',
      emoji: '🐘'
    },
    proTip: 'Cầm 1 tờ giấy ăn trước miệng. Đọc "Pen" tờ giấy phải bay phần phật, đọc "Ben" tờ giấy đứng yên.'
  },
  {
    id: 's_vs_sh',
    title: 'Âm /s/ vs /ʃ/',
    tag: 'Xì răng vs Chu môi suỵt',
    summary: 'Phân biệt giữa xì răng phẳng (Sea, See) và chu môi thổi gió nặng (She, Ship).',
    itemA: {
      label: 'Âm /s/',
      ipa: '/s/ (S nhẹ phẳng)',
      howToSay: 'Khép răng xì hơi sắc nét',
      example: 'Sea',
      exampleIpa: '/siː/',
      exampleVi: 'Biển khơi',
      emoji: '🌊'
    },
    itemB: {
      label: 'Âm /ʃ/',
      ipa: '/ʃ/ (S nặng tròn môi)',
      howToSay: 'Chu môi tròn thổi gió như "suỵt"',
      example: 'She',
      exampleIpa: '/ʃiː/',
      exampleVi: 'Cô ấy',
      emoji: '👩'
    },
    proTip: 'Câu thần chú luyện lưỡi: "She sells seashells on the seashore"!'
  },
  {
    id: 'th_unvoiced_vs_voiced',
    title: 'Âm /θ/ vs /ð/',
    tag: 'Kẹp đầu lưỡi vô thanh vs hữu thanh',
    summary: 'Âm đặc thù không có trong tiếng Việt, bắt buộc phải đưa đầu lưỡi ra giữa 2 hàm răng.',
    itemA: {
      label: 'Âm /θ/',
      ipa: '/θ/ (Thổi hơi nhẹ)',
      howToSay: 'Kẹp lưỡi thổi gió không rung',
      example: 'Think',
      exampleIpa: '/θɪŋk/',
      exampleVi: 'Suy nghĩ',
      emoji: '🧠'
    },
    itemB: {
      label: 'Âm /ð/',
      ipa: '/ð/ (Rung thanh quản)',
      howToSay: 'Kẹp lưỡi rung cổ họng',
      example: 'This',
      exampleIpa: '/ðɪs/',
      exampleVi: 'Cái này',
      emoji: '👉'
    },
    proTip: 'Hãy dùng gương soi để thấy đầu lưỡi thò ra giữa 2 hàng răng từ 2-3mm khi phát âm cả hai âm này.'
  }
];
