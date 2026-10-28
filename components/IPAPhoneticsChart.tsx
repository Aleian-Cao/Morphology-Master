import React, { useState } from 'react';
import { Volume2, Sparkles, BookOpen, Layers, Lightbulb, Play, Gauge, BookmarkPlus, Check, ArrowRight, GitCompare, HelpCircle } from 'lucide-react';
import { IPA_CHART_DATA, IPASound, CONFUSING_PAIRS, VividWordExample } from '../data/alphabetIpaData';
import { playEnglishAudio } from '../utils/audioHelper';
import { User, UserProgress, CustomFlashcard } from '../types';

interface IPAPhoneticsChartProps {
  user: User | null;
  onUpdateProgress?: (progress: UserProgress) => void;
  onSelectWordToDissect?: (word: string) => void;
}

export const IPAPhoneticsChart: React.FC<IPAPhoneticsChartProps> = ({
  user,
  onUpdateProgress,
  onSelectWordToDissect
}) => {
  const [selectedSound, setSelectedSound] = useState<IPASound>(IPA_CHART_DATA[0]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'monophthong' | 'diphthong' | 'consonant'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  const handlePlaySound = async (sound: IPASound) => {
    setPlayingWord(`sound_${sound.symbol}`);
    // Play either the representative example word or the audio spelling
    const textToSpeak = sound.examples[0]?.word || sound.audioSpelling;
    await playEnglishAudio(textToSpeak, speechRate);
    setPlayingWord(null);
  };

  const handleSelectAndPlaySound = async (sound: IPASound) => {
    setSelectedSound(sound);
    setPlayingWord(`sound_${sound.symbol}`);
    const textToSpeak = sound.examples[0]?.word || sound.audioSpelling;
    await playEnglishAudio(textToSpeak, speechRate);
    setPlayingWord(null);
  };

  const handlePlayWord = async (word: string) => {
    setPlayingWord(word);
    await playEnglishAudio(word, speechRate);
    setPlayingWord(null);
  };

  const handleSaveToFlashcards = (example: VividWordExample, symbol: string) => {
    if (!user || !onUpdateProgress) return;
    const existing = user.progress.customFlashcards || [];
    if (existing.some(f => f.word.toLowerCase() === example.word.toLowerCase())) return;

    const newCard: CustomFlashcard = {
      id: `fc_ipa_${Date.now()}_${example.word.toLowerCase()}`,
      word: `${example.emoji} ${example.word} (Âm ${symbol})`,
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

  // Sound grouping
  const monophthongsLong = IPA_CHART_DATA.filter(s => s.category === 'monophthong_long');
  const monophthongsShort = IPA_CHART_DATA.filter(s => s.category === 'monophthong_short');
  const diphthongs = IPA_CHART_DATA.filter(s => s.category === 'diphthong');
  const consonantsUnvoiced = IPA_CHART_DATA.filter(s => s.category === 'consonant_unvoiced');
  const consonantsVoiced = IPA_CHART_DATA.filter(s => s.category === 'consonant_voiced');
  const consonantsOther = IPA_CHART_DATA.filter(s => s.category === 'consonant_other');

  // Filter helper based on search query
  const matchesSearch = (sound: IPASound) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      sound.symbol.toLowerCase().includes(q) ||
      sound.name.toLowerCase().includes(q) ||
      sound.vietnameseGuide.toLowerCase().includes(q) ||
      sound.examples.some(ex => ex.word.toLowerCase().includes(q) || ex.meaning_vi.toLowerCase().includes(q))
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300">
            <Sparkles size={14} /> Hệ thống 44 âm chuẩn quốc tế IPA
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
            Bảng Phiên Âm Quốc Tế IPA Tương Tác
          </h2>
          <p className="text-indigo-200 text-sm md:text-base leading-relaxed">
            Chạm vào bất kỳ âm nào để <strong>nghe trực tiếp phát âm chuẩn</strong> và xem <strong>từ vựng ví dụ sinh động</strong> kèm khẩu hình miệng, dấu hiệu chữ cái và cặp từ phân biệt!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>12 Nguyên âm đơn (Monophthongs)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span>8 Nguyên âm đôi (Diphthongs)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-3 h-3 rounded-full bg-teal-400"></span>
              <span>24 Phụ âm (Consonants)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speed, Search & Category Filter Bar */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Tất Cả (44 Âm)
          </button>
          <button
            onClick={() => setActiveCategory('monophthong')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'monophthong'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            12 Nguyên Âm Đơn
          </button>
          <button
            onClick={() => setActiveCategory('diphthong')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'diphthong'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            8 Nguyên Âm Đôi
          </button>
          <button
            onClick={() => setActiveCategory('consonant')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'consonant'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            24 Phụ Âm
          </button>
        </div>

        {/* Search & Speed */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm âm / từ (VD: /iː/, cat, θ)..."
              className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Speed toggle */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600 border border-stone-200 shrink-0">
            <Gauge size={13} className="text-indigo-600 ml-1" />
            <button
              onClick={() => setSpeechRate(0.7)}
              className={`px-2 py-1 rounded-lg transition-all ${
                speechRate === 0.7 ? 'bg-white font-bold text-stone-900 shadow-sm' : 'hover:text-stone-900'
              }`}
            >
              0.7x
            </button>
            <button
              onClick={() => setSpeechRate(0.9)}
              className={`px-2 py-1 rounded-lg transition-all ${
                speechRate === 0.9 ? 'bg-white font-bold text-stone-900 shadow-sm' : 'hover:text-stone-900'
              }`}
            >
              0.9x
            </button>
          </div>
        </div>
      </div>

      {/* SELECTED SOUND DETAIL SPOTLIGHT */}
      {selectedSound && (
        <div className="bg-white rounded-3xl shadow-md border-2 border-indigo-200 overflow-hidden">
          <div className="bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-mono font-bold text-3xl md:text-4xl flex items-center justify-center shadow-lg shrink-0 border border-indigo-400/30">
                {selectedSound.symbol}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-indigo-200">
                    {selectedSound.categoryLabel}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedSound.isVoiced ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {selectedSound.isVoiced ? '🔊 Hữu thanh (Rung cổ)' : '💨 Vô thanh (Bật hơi)'}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-serif text-white">
                  {selectedSound.name}
                </h3>
                <p className="text-indigo-200 text-xs md:text-sm">
                  {selectedSound.vietnameseGuide}
                </p>
              </div>
            </div>

            <button
              onClick={() => handlePlaySound(selectedSound)}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
            >
              <Volume2 size={20} className={playingWord === `sound_${selectedSound.symbol}` ? 'animate-bounce text-stone-950' : ''} />
              <span>Phát Âm Chuẩn ({selectedSound.symbol})</span>
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Mouth & Tongue Shape */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block">
                  👅 Khẩu hình miệng & vị trí lưỡi
                </span>
                <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
                  {selectedSound.mouthShape}
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  📝 Dấu hiệu nhận biết trong chữ cái tiếng Anh
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSound.spellingPatterns.map((pat, idx) => (
                    <span key={idx} className="bg-white border border-stone-300 text-stone-800 text-xs px-2.5 py-1 rounded-lg font-medium shadow-2xs">
                      {pat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Minimal Pair comparison if exists */}
            {selectedSound.minimalPair && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <GitCompare size={18} />
                  <span>Cặp Âm Dễ Nhầm Lẫn Cần Phân Biệt:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-stone-900">{selectedSound.minimalPair.word1}</span>
                      <span className="ml-2 font-mono text-xs text-amber-700">{selectedSound.minimalPair.ipa1}</span>
                      <p className="text-xs text-stone-500">{selectedSound.minimalPair.meaning1}</p>
                    </div>
                    <button
                      onClick={() => handlePlayWord(selectedSound.minimalPair!.word1)}
                      className="p-2 bg-amber-500 text-stone-900 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-stone-900">{selectedSound.minimalPair.word2}</span>
                      <span className="ml-2 font-mono text-xs text-amber-700">{selectedSound.minimalPair.ipa2}</span>
                      <p className="text-xs text-stone-500">{selectedSound.minimalPair.meaning2}</p>
                    </div>
                    <button
                      onClick={() => handlePlayWord(selectedSound.minimalPair!.word2)}
                      className="p-2 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-amber-900 font-medium italic">
                  💡 {selectedSound.minimalPair.note}
                </p>
              </div>
            )}

            {/* Examples with audio */}
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-base mb-3">
                🌟 Ví Dụ Thực Tế Trong Từ Vựng:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedSound.examples.map((ex, idx) => {
                  const isSaved = savedWords[ex.word] || (user?.progress.customFlashcards?.some(c => c.word.includes(ex.word)));
                  return (
                    <div
                      key={idx}
                      className="bg-stone-50 hover:bg-white border border-stone-200 rounded-2xl p-4 transition-all shadow-2xs hover:shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-2xs">{ex.emoji}</span>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-stone-900 text-base">{ex.word}</span>
                            <span className="font-mono text-xs text-indigo-600">{ex.ipa}</span>
                          </div>
                          <span className="text-xs text-stone-500">{ex.meaning_vi}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePlayWord(ex.word)}
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-2xs"
                          title="Nghe phát âm"
                        >
                          <Volume2 size={16} />
                        </button>
                        <button
                          onClick={() => handleSaveToFlashcards(ex, selectedSound.symbol)}
                          className={`p-2 rounded-xl transition-all border ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-white hover:bg-stone-100 text-stone-500 border-stone-200'
                          }`}
                          title="Lưu vào flashcards"
                        >
                          {isSaved ? <Check size={16} /> : <BookmarkPlus size={16} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL IPA INTERACTIVE MATRIX */}
      <div className="space-y-8">
        {/* Helper guide */}
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-indigo-600 shrink-0 animate-pulse" />
            <span>
              <strong>Bảng Tương Tác:</strong> Chạm trực tiếp vào bất kỳ ô âm nào để <strong>nghe phát âm ngay lập tức</strong> và mở bộ từ ví dụ sinh động!
            </span>
          </div>
          <span className="text-xs bg-indigo-200/60 text-indigo-800 font-bold px-2.5 py-1 rounded-full shrink-0">
            {IPA_CHART_DATA.filter(matchesSearch).length} / 44 âm hiển thị
          </span>
        </div>

        {/* 1. VOWELS SECTION */}
        {(activeCategory === 'all' || activeCategory === 'monophthong' || activeCategory === 'diphthong') && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                  <span>🍎 BẢNG NGUYÊN ÂM (Vowels - 20 Âm)</span>
                </h3>
                <p className="text-stone-500 text-xs md:text-sm mt-0.5">
                  Gồm 12 nguyên âm đơn (Monophthongs) và 8 nguyên âm đôi (Diphthongs). Nhấn để nghe âm!
                </p>
              </div>
              <span className="text-xs font-bold uppercase text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                20 Âm
              </span>
            </div>

            {/* Monophthongs Grid */}
            {(activeCategory === 'all' || activeCategory === 'monophthong') && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Nguyên âm đơn (12 âm: 5 âm dài + 7 âm ngắn)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[...monophthongsLong, ...monophthongsShort].filter(matchesSearch).map(sound => {
                    const isSelected = selectedSound?.symbol === sound.symbol;
                    const isPlaying = playingWord === `sound_${sound.symbol}`;
                    const isLong = sound.category === 'monophthong_long';
                    const sample = sound.examples[0];
                    return (
                      <button
                        key={sound.symbol}
                        onClick={() => handleSelectAndPlaySound(sound)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-32 group cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300 shadow-md scale-[1.02]'
                            : 'bg-stone-50 hover:bg-white border-stone-200 hover:border-rose-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className={`font-mono font-bold text-2xl transition-colors ${
                            isSelected ? 'text-rose-600' : 'text-stone-900 group-hover:text-rose-600'
                          }`}>
                            {sound.symbol}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg filter drop-shadow-2xs">{sample?.emoji}</span>
                            <span className={`p-1.5 rounded-lg transition-colors ${
                              isPlaying
                                ? 'bg-rose-500 text-white animate-bounce shadow-xs'
                                : 'bg-stone-200/60 text-stone-600 group-hover:bg-rose-100 group-hover:text-rose-700'
                            }`}>
                              <Volume2 size={13} />
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="font-bold text-stone-800">{sample?.word}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              isLong ? 'bg-rose-100 text-rose-700' : 'bg-stone-200 text-stone-600'
                            }`}>
                              {isLong ? 'Dài' : 'Ngắn'}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 truncate block font-medium">
                            {sound.vietnameseGuide}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Diphthongs Grid */}
            {(activeCategory === 'all' || activeCategory === 'diphthong') && (
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Nguyên âm đôi (Diphthongs - 8 âm kết hợp 2 nguyên âm đơn)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {diphthongs.filter(matchesSearch).map(sound => {
                    const isSelected = selectedSound?.symbol === sound.symbol;
                    const isPlaying = playingWord === `sound_${sound.symbol}`;
                    const sample = sound.examples[0];
                    return (
                      <button
                        key={sound.symbol}
                        onClick={() => handleSelectAndPlaySound(sound)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-32 group cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-md scale-[1.02]'
                            : 'bg-stone-50 hover:bg-white border-stone-200 hover:border-amber-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className={`font-mono font-bold text-2xl transition-colors ${
                            isSelected ? 'text-amber-600' : 'text-stone-900 group-hover:text-amber-600'
                          }`}>
                            {sound.symbol}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg filter drop-shadow-2xs">{sample?.emoji}</span>
                            <span className={`p-1.5 rounded-lg transition-colors ${
                              isPlaying
                                ? 'bg-amber-500 text-stone-950 animate-bounce shadow-xs'
                                : 'bg-stone-200/60 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-700'
                            }`}>
                              <Volume2 size={13} />
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="font-bold text-stone-800">{sample?.word}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-800">
                              Âm đôi
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 truncate block font-medium">
                            {sound.vietnameseGuide}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. CONSONANTS SECTION */}
        {(activeCategory === 'all' || activeCategory === 'consonant') && (
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                  <span>💬 BẢNG PHỤ ÂM (Consonants - 24 Âm)</span>
                </h3>
                <p className="text-stone-500 text-xs md:text-sm mt-0.5">
                  Gồm 8 cặp phụ âm đối lập (Vô thanh vs Hữu thanh) cùng 8 phụ âm mũi, lướt và thở hơi.
                </p>
              </div>
              <span className="text-xs font-bold uppercase text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                24 Âm
              </span>
            </div>

            {/* 8 Paired Voiceless vs Voiced Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  8 Cặp Phụ Âm Vô Thanh (Bật hơi) vs Hữu Thanh (Rung cổ)
                </span>
                <span className="text-[11px] text-stone-400 italic">
                  Chạm để nghe đối chiếu độ rung
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {consonantsUnvoiced.map((unvoicedSound, idx) => {
                  const voicedSound = consonantsVoiced[idx];
                  if (!matchesSearch(unvoicedSound) && !(voicedSound && matchesSearch(voicedSound))) {
                    return null;
                  }
                  const isUnvoicedSelected = selectedSound?.symbol === unvoicedSound.symbol;
                  const isUnvoicedPlaying = playingWord === `sound_${unvoicedSound.symbol}`;
                  const isVoicedSelected = voicedSound && selectedSound?.symbol === voicedSound.symbol;
                  const isVoicedPlaying = voicedSound && playingWord === `sound_${voicedSound.symbol}`;

                  return (
                    <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-2.5 space-y-2">
                      {/* Unvoiced Item */}
                      <button
                        onClick={() => handleSelectAndPlaySound(unvoicedSound)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                          isUnvoicedSelected
                            ? 'bg-rose-50 border border-rose-300 ring-2 ring-rose-200 shadow-xs'
                            : 'bg-white hover:bg-stone-100 border border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg text-stone-900">{unvoicedSound.symbol}</span>
                          <span className="text-xs text-stone-700 font-semibold">{unvoicedSound.examples[0]?.word}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                            💨 Vô thanh
                          </span>
                          <span className={`p-1 rounded ${isUnvoicedPlaying ? 'text-rose-600 animate-pulse' : 'text-stone-400'}`}>
                            <Volume2 size={12} />
                          </span>
                        </div>
                      </button>

                      {/* Voiced Counterpart */}
                      {voicedSound && (
                        <button
                          onClick={() => handleSelectAndPlaySound(voicedSound)}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                            isVoicedSelected
                              ? 'bg-teal-50 border border-teal-300 ring-2 ring-teal-200 shadow-xs'
                              : 'bg-white hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg text-teal-800">{voicedSound.symbol}</span>
                            <span className="text-xs text-stone-700 font-semibold">{voicedSound.examples[0]?.word}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                              🔊 Hữu thanh
                            </span>
                            <span className={`p-1 rounded ${isVoicedPlaying ? 'text-teal-600 animate-pulse' : 'text-stone-400'}`}>
                              <Volume2 size={12} />
                            </span>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other 8 Consonants (Nasals, Approximants) */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                8 Phụ Âm Còn Lại (Âm mũi /m/, /n/, /ŋ/, âm thở /h/, âm lướt /l/, /r/, /w/, /j/)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {consonantsOther.filter(matchesSearch).map(sound => {
                  const isSelected = selectedSound?.symbol === sound.symbol;
                  const isPlaying = playingWord === `sound_${sound.symbol}`;
                  const sample = sound.examples[0];
                  return (
                    <button
                      key={sound.symbol}
                      onClick={() => handleSelectAndPlaySound(sound)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-300 shadow-sm scale-[1.02]'
                          : 'bg-stone-50 hover:bg-white border-stone-200 hover:border-teal-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xl text-stone-900">
                            {sound.symbol}
                          </span>
                          <span className={`p-1 rounded ${isPlaying ? 'text-teal-600 animate-pulse' : 'text-stone-400'}`}>
                            <Volume2 size={13} />
                          </span>
                        </div>
                        <span className="text-xs text-stone-700 font-bold block mt-0.5">
                          {sample?.word}
                        </span>
                      </div>
                      <span className="text-2xl filter drop-shadow-2xs">
                        {sample?.emoji}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONFUSING PAIRS & TRAPS SECTION */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
              <GitCompare size={14} /> Bí kíp sửa lỗi
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">
              Các Cặp Âm & Chữ Cái Dễ Lẫn Nhất Cho Người Việt
            </h3>
            <p className="text-stone-400 text-xs md:text-sm mt-0.5">
              Học cách đối chiếu để nghe và nói không bao giờ bị nhầm lẫn hay hiểu sai nghĩa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONFUSING_PAIRS.map(pair => (
            <div
              key={pair.id}
              className="bg-stone-800/80 border border-stone-700 rounded-2xl p-5 space-y-4 hover:border-amber-400/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-400 text-base">
                  {pair.title}
                </h4>
                <span className="text-[10px] bg-black/40 text-stone-300 px-2 py-0.5 rounded-full">
                  {pair.tag}
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {pair.summary}
              </p>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Item A */}
                <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{pair.itemA.label}</span>
                    <span className="text-xl">{pair.itemA.emoji}</span>
                  </div>
                  <div className="font-mono text-xs text-amber-300 font-bold">
                    {pair.itemA.ipa}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <div>
                      <span className="text-xs font-bold text-stone-200 block">{pair.itemA.example}</span>
                      <span className="text-[10px] text-stone-400">{pair.itemA.exampleVi}</span>
                    </div>
                    <button
                      onClick={() => handlePlayWord(pair.itemA.example)}
                      className="p-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-lg transition-colors"
                      title="Nghe"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Item B */}
                <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{pair.itemB.label}</span>
                    <span className="text-xl">{pair.itemB.emoji}</span>
                  </div>
                  <div className="font-mono text-xs text-amber-300 font-bold">
                    {pair.itemB.ipa}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <div>
                      <span className="text-xs font-bold text-stone-200 block">{pair.itemB.example}</span>
                      <span className="text-[10px] text-stone-400">{pair.itemB.exampleVi}</span>
                    </div>
                    <button
                      onClick={() => handlePlayWord(pair.itemB.example)}
                      className="p-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-lg transition-colors"
                      title="Nghe"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pro tip */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                💡 <strong>Mẹo:</strong> {pair.proTip}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
