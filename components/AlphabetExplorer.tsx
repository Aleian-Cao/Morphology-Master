import React, { useState } from 'react';
import { Volume2, Sparkles, BookOpen, Search, ArrowRight, Lightbulb, Play, Gauge, AlertCircle, BookmarkPlus, Check, VolumeX } from 'lucide-react';
import { ALPHABET_DATA, AlphabetLetter, VividWordExample } from '../data/alphabetIpaData';
import { playEnglishAudio } from '../utils/audioHelper';
import { User, UserProgress, CustomFlashcard } from '../types';

interface AlphabetExplorerProps {
  user: User | null;
  onUpdateProgress?: (progress: UserProgress) => void;
  onSelectWordToDissect?: (word: string) => void;
}

export const AlphabetExplorer: React.FC<AlphabetExplorerProps> = ({
  user,
  onUpdateProgress,
  onSelectWordToDissect
}) => {
  const [filterType, setFilterType] = useState<'all' | 'vowel' | 'consonant' | 'semivowel'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter | null>(ALPHABET_DATA[0]);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  const filteredLetters = ALPHABET_DATA.filter(item => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    const matchesSearch = searchQuery === '' || 
      item.letter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vietnameseGuide.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vividExamples.some(ex => ex.word.toLowerCase().includes(searchQuery.toLowerCase()) || ex.meaning_vi.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handlePlayLetterName = async (letter: AlphabetLetter) => {
    setPlayingWord(`name_${letter.letter}`);
    await playEnglishAudio(letter.letter, speechRate);
    setPlayingWord(null);
  };

  const handlePlayLetterSound = async (letter: AlphabetLetter) => {
    setPlayingWord(`sound_${letter.letter}`);
    // If vowel, play primary sound or sample word
    const primarySound = letter.phonicsSounds[0]?.examples[0] || letter.letter;
    await playEnglishAudio(primarySound, speechRate);
    setPlayingWord(null);
  };

  const handlePlayWord = async (word: string) => {
    setPlayingWord(word);
    await playEnglishAudio(word, speechRate);
    setPlayingWord(null);
  };

  const handlePlaySentence = async (sentence: string) => {
    setPlayingWord(sentence);
    await playEnglishAudio(sentence, speechRate);
    setPlayingWord(null);
  };

  const handleSaveToFlashcards = (example: VividWordExample) => {
    if (!user || !onUpdateProgress) return;
    const existing = user.progress.customFlashcards || [];
    if (existing.some(f => f.word.toLowerCase() === example.word.toLowerCase())) return;

    const newCard: CustomFlashcard = {
      id: `fc_alpha_${Date.now()}_${example.word.toLowerCase()}`,
      word: `${example.emoji} ${example.word}`,
      translation: `${example.ipa} - ${example.meaning_vi}`,
      createdAt: new Date().toISOString()
    };

    const updatedCards = [newCard, ...existing];
    onUpdateProgress({
      ...user.progress,
      customFlashcards: updatedCards,
      xp: user.progress.xp + 20
    });

    setSavedWords(prev => ({ ...prev, [example.word]: true }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Intro Header & Concept Differentiation */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-200">
            <Sparkles size={14} /> Bí quyết nền tảng phát âm
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
            Cách Đọc 26 Chữ Cái & Phonics Sinh Động
          </h2>
          <p className="text-amber-100 text-sm md:text-base leading-relaxed">
            90% người học tiếng Anh thường nhầm lẫn giữa <strong>Tên chữ cái (Letter Name)</strong> và <strong>Âm phát âm (Letter Sound)</strong>. 
            Mỗi chữ cái dưới đây đều có ví dụ minh họa bằng hình ảnh, âm thanh chuẩn bản xứ, khẩu hình và mẹo nhớ cho người Việt.
          </p>

          {/* Golden Rule Comparison Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-200 font-bold text-sm mb-1">
                <span>🏷️ 1. TÊN CHỮ CÁI (Letter Name)</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Là cách xướng tên chữ cái trong bảng ABC: <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">A = /eɪ/ (ây)</code>, <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">B = /biː/ (bi)</code>.
                Dùng khi: Đánh vần tên riêng, email, biển số xe, các từ viết tắt (<strong>VIP, CEO, FBI, USA</strong>).
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-200 font-bold text-sm mb-1">
                <span>🗣️ 2. ÂM PHÁT ÂM (Letter Sound - Phonics)</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Là âm thanh phát ra khi ghép chữ vào từ: <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">A đọc là /æ/</code> trong <em>cat, apple</em>; <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300">B đọc là /b/</code> trong <em>book</em>.
                Khoảng <strong>80–85% từ vựng</strong> tuân theo quy tắc phát âm này!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Speed */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất cả 26 Chữ Cái
          </button>
          <button
            onClick={() => setFilterType('vowel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'vowel'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>🔴 5 Nguyên Âm</span>
            <span className="text-[10px] bg-white/30 px-1.5 py-0.2 rounded-full">A, E, I, O, U</span>
          </button>
          <button
            onClick={() => setFilterType('consonant')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'consonant'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            🔵 20 Phụ Âm
          </button>
          <button
            onClick={() => setFilterType('semivowel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'semivowel'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            🟣 Bán Nguyên Âm (Y, W)
          </button>
        </div>

        {/* Speed Toggle & Search */}
        <div className="flex items-center gap-3">
          {/* Speed selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600 border border-stone-200 shrink-0">
            <Gauge size={14} className="text-amber-600 ml-1.5" />
            <button
              onClick={() => setSpeechRate(0.7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                speechRate === 0.7 ? 'bg-white font-bold text-stone-900 shadow-sm' : 'hover:text-stone-900'
              }`}
            >
              🐢 Chậm (0.7x)
            </button>
            <button
              onClick={() => setSpeechRate(0.9)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                speechRate === 0.9 ? 'bg-white font-bold text-stone-900 shadow-sm' : 'hover:text-stone-900'
              }`}
            >
              Chuẩn (0.9x)
            </button>
          </div>

          {/* Quick search input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm chữ hoặc từ (VD: A, Cat)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Alphabet Quick Scroller Bar (A to Z Pills) */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-200 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1.5 min-w-max">
          {ALPHABET_DATA.map(item => {
            const isSelected = selectedLetter?.letter === item.letter;
            const isVowel = item.type === 'vowel';
            const isSemi = item.type === 'semivowel';
            return (
              <button
                key={item.letter}
                onClick={() => setSelectedLetter(item)}
                className={`w-10 h-10 rounded-xl font-serif font-bold text-sm transition-all flex flex-col items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-md scale-105 ring-2 ring-amber-400 ring-offset-1'
                    : isVowel
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : isSemi
                    ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{item.letter}</span>
                <span className="text-[9px] font-mono opacity-70 -mt-1">{item.lower}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE LETTER SPOTLIGHT CARD */}
      {selectedLetter && (
        <div className="bg-white rounded-3xl shadow-md border-2 border-amber-200/80 overflow-hidden">
          {/* Card Top Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-900 font-serif font-extrabold text-4xl md:text-5xl flex items-center justify-center shadow-lg shrink-0">
                <span>{selectedLetter.letter}</span>
                <span className="text-2xl md:text-3xl font-light text-stone-800 ml-0.5">{selectedLetter.lower}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedLetter.type === 'vowel'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : selectedLetter.type === 'semivowel'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {selectedLetter.categoryLabel}
                  </span>
                  <span className="text-stone-400 text-xs font-mono">Letter #{selectedLetter.letter.charCodeAt(0) - 64}</span>
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 className="text-2xl md:text-3xl font-bold font-serif text-white">
                    Chữ cái {selectedLetter.letter}
                  </h3>
                  <span className="text-amber-400 font-mono text-lg font-bold">
                    {selectedLetter.nameIpa}
                  </span>
                  <span className="text-stone-300 text-sm">
                    ({selectedLetter.vietnameseGuide})
                  </span>
                </div>
              </div>
            </div>

            {/* Audio action buttons for the letter */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handlePlayLetterName(selectedLetter)}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-3 rounded-xl font-bold text-xs md:text-sm transition-all shadow-md flex items-center gap-2"
                title="Nghe tên chữ cái (Letter Name)"
              >
                <Volume2 size={18} className={playingWord === `name_${selectedLetter.letter}` ? 'animate-bounce text-stone-950' : ''} />
                <span>🔊 Nghe Tên ({selectedLetter.nameIpa})</span>
              </button>

              <button
                onClick={() => handlePlayLetterSound(selectedLetter)}
                className="bg-stone-700 hover:bg-stone-600 text-white px-4 py-3 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm flex items-center gap-2 border border-stone-600"
                title="Nghe âm phát âm chính trong từ (Letter Sound)"
              >
                <Play size={16} />
                <span>🗣️ Nghe Âm Phonics</span>
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Vietnamese Pro-tip Callout */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0 mt-0.5">
                <Lightbulb size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <span>💡 Bí Kíp Người Việt Hay Sai & Khẩu Hình Chuẩn:</span>
                </h4>
                <p className="text-stone-700 text-xs md:text-sm leading-relaxed">
                  {selectedLetter.vietnameseTip}
                </p>
              </div>
            </div>

            {/* Phonics Sound Variants Table */}
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-lg mb-3 flex items-center gap-2">
                <span>Các Cách Đọc Thực Tế Khi Chữ "{selectedLetter.letter}" Xuất Hiện Trong Từ:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {selectedLetter.phonicsSounds.map((ps, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 hover:border-amber-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-base font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-lg">
                          {ps.sound}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-stone-400">
                          {ps.label}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mb-3">
                        {ps.condition}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Ví dụ tiêu biểu:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ps.examples.map(exWord => (
                          <button
                            key={exWord}
                            onClick={() => handlePlayWord(exWord)}
                            className="text-xs font-semibold bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-400 text-stone-800 px-2 py-0.5 rounded-md transition-all flex items-center gap-1"
                          >
                            <span>{exWord}</span>
                            <Volume2 size={10} className="text-stone-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Vivid Word Examples with Audio & Sentences */}
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-lg mb-3 flex items-center gap-2">
                <span>🌟 3 Ví Dụ Sinh Động Minh Họa Cho Chữ "{selectedLetter.letter}":</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedLetter.vividExamples.map((ex, idx) => {
                  const isSaved = savedWords[ex.word] || (user?.progress.customFlashcards?.some(c => c.word.includes(ex.word)));
                  return (
                    <div
                      key={idx}
                      className="bg-gradient-to-b from-stone-50 to-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{ex.emoji}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePlayWord(ex.word)}
                              className="p-2 bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-xl transition-all shadow-sm"
                              title={`Nghe phát âm từ "${ex.word}"`}
                            >
                              <Volume2 size={16} className={playingWord === ex.word ? 'animate-bounce' : ''} />
                            </button>
                            <button
                              onClick={() => handleSaveToFlashcards(ex)}
                              className={`p-2 rounded-xl transition-all border ${
                                isSaved
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  : 'bg-white hover:bg-stone-100 text-stone-500 border-stone-200'
                              }`}
                              title="Lưu vào Daily Flashcards"
                            >
                              {isSaved ? <Check size={16} /> : <BookmarkPlus size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-2">
                            <h5 className="text-xl font-bold font-serif text-stone-900">
                              {ex.word}
                            </h5>
                            <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {ex.ipa}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-stone-600 mt-1">
                            {ex.meaning_vi}
                          </p>
                        </div>

                        {ex.sentence && (
                          <div className="bg-stone-100/80 rounded-xl p-3 text-xs space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-stone-800 font-medium italic">
                                "{ex.sentence}"
                              </p>
                              <button
                                onClick={() => handlePlaySentence(ex.sentence!)}
                                className="text-stone-400 hover:text-amber-600 shrink-0 p-1"
                                title="Nghe cả câu"
                              >
                                <Volume2 size={12} />
                              </button>
                            </div>
                            <p className="text-stone-500 text-[11px]">
                              {ex.sentence_vi}
                            </p>
                          </div>
                        )}
                      </div>

                      {onSelectWordToDissect && (
                        <button
                          onClick={() => onSelectWordToDissect(ex.word.toLowerCase())}
                          className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-stone-200 group-hover:border-amber-300"
                        >
                          <span>Mổ Xẻ Âm Tiết Từ Này</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Letters (26 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-stone-900 text-xl">
            Danh Sách 26 Chữ Cái Tiếng Anh ({filteredLetters.length})
          </h3>
          <span className="text-xs text-stone-400">
            Nhấp vào bất kỳ chữ cái nào để xem chi tiết & nghe phát âm
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredLetters.map(letterItem => {
            const isSelected = selectedLetter?.letter === letterItem.letter;
            const primaryExample = letterItem.vividExamples[0];
            return (
              <div
                key={letterItem.letter}
                onClick={() => setSelectedLetter(letterItem)}
                className={`cursor-pointer rounded-2xl p-4 border transition-all text-left flex flex-col justify-between space-y-3 relative group ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-300'
                    : 'bg-white hover:bg-stone-50 border-stone-200 shadow-sm hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif font-black text-2xl text-stone-900">
                      {letterItem.letter}
                    </span>
                    <span className="font-serif text-lg text-stone-500">
                      {letterItem.lower}
                    </span>
                  </div>
                  <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                    {primaryExample?.emoji || '✨'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
                      {letterItem.nameIpa}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayLetterName(letterItem);
                      }}
                      className="text-stone-400 hover:text-amber-600 p-1"
                      title="Nghe phát âm"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">
                    {letterItem.vietnameseGuide}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-700 truncate">
                    {primaryExample?.word}
                  </span>
                  <span className="text-stone-400 text-[10px]">
                    {primaryExample?.ipa}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
