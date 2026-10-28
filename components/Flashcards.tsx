import React, { useState, useEffect } from 'react';
import { UserProgress, Lesson, CustomFlashcard } from '../types';
import { CURRICULUM } from '../constants';
import { Layers, Check, X, RotateCcw, Loader2, Bot, BookmarkCheck, Trash2, Search, SlidersHorizontal } from 'lucide-react';
import { enrichLessonData } from '../services/geminiService';
import { soundFX } from '../utils/soundEffects';

interface FlashcardsProps {
  progress: UserProgress;
  customApiKey?: string;
  onProgressUpdate: (xpGained: number) => void;
  onUpdateProgress?: (progress: UserProgress) => void;
  onNavigateToTutor?: () => void;
  onNavigateToDashboard?: () => void;
}

interface WordCard {
  id?: string;
  word: string;
  translation: string;
  parts?: { text: string; type: string; meaning: string; meaning_vi?: string }[];
  root?: string;
  category?: string;
  isCustom?: boolean;
  colorTheme: { front: string; back: string; text: string };
}

const THEMES = [
  { front: 'bg-gradient-to-br from-blue-500 to-cyan-600', back: 'bg-stone-900', text: 'text-cyan-400' },
  { front: 'bg-gradient-to-br from-orange-500 to-amber-600', back: 'bg-stone-900', text: 'text-amber-400' },
  { front: 'bg-gradient-to-br from-purple-500 to-fuchsia-600', back: 'bg-stone-900', text: 'text-fuchsia-400' },
  { front: 'bg-gradient-to-br from-emerald-500 to-teal-600', back: 'bg-stone-900', text: 'text-teal-400' },
  { front: 'bg-gradient-to-br from-rose-500 to-red-600', back: 'bg-stone-900', text: 'text-rose-400' },
  { front: 'bg-gradient-to-br from-indigo-500 to-violet-600', back: 'bg-stone-900', text: 'text-violet-400' },
];

export const Flashcards: React.FC<FlashcardsProps> = ({ 
  progress, 
  customApiKey, 
  onProgressUpdate,
  onUpdateProgress,
  onNavigateToTutor,
  onNavigateToDashboard
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  
  const [filterMode, setFilterMode] = useState<'all' | 'curriculum' | 'custom'>('all');
  const [allCards, setAllCards] = useState<WordCard[]>([]);
  const [deck, setDeck] = useState<WordCard[]>([]);
  const [loadingDeck, setLoadingDeck] = useState(true);
  
  // Custom cards management modal
  const [showManager, setShowManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const buildDeck = async () => {
      setLoadingDeck(true);
      
      // 1. Get completed lessons
      const lessons: Lesson[] = [];
      CURRICULUM.forEach(tier => {
        tier.modules.forEach(module => {
          module.lessons.forEach(lesson => {
            if (progress.completedLessons.includes(lesson.id)) {
              lessons.push(lesson);
            }
          });
        });
      });

      const customCards = progress.customFlashcards || [];

      // If user has neither completed lessons nor custom cards
      if (lessons.length === 0 && customCards.length === 0) {
        setAllCards([]);
        setDeck([]);
        setLoadingDeck(false);
        return;
      }

      const builtCards: WordCard[] = [];

      // 2. Fetch enriched data for completed lessons (up to 5 random)
      if (lessons.length > 0) {
        const selectedLessons = lessons.sort(() => 0.5 - Math.random()).slice(0, 5);
        await Promise.all(selectedLessons.map(async (lesson, idx) => {
          const theme = THEMES[idx % THEMES.length];
          try {
            const enriched = await enrichLessonData(lesson.id, lesson.root, lesson.category, lesson.tier, customApiKey);
            if (enriched && enriched.dissectionPack) {
              enriched.dissectionPack.forEach(item => {
                builtCards.push({
                  id: `curr_${lesson.id}_${item.word}`,
                  word: item.word,
                  translation: item.translation,
                  parts: item.parts,
                  root: lesson.root,
                  category: lesson.category,
                  isCustom: false,
                  colorTheme: theme
                });
              });
            }
          } catch (e) {
            console.error(e);
          }
        }));
      }

      // 3. Add custom flashcards from UserProgress
      if (customCards.length > 0) {
        customCards.forEach((fc, idx) => {
          builtCards.push({
            id: fc.id,
            word: fc.word,
            translation: fc.translation,
            category: 'AI Tutor',
            root: 'Custom',
            isCustom: true,
            colorTheme: THEMES[(idx + builtCards.length) % THEMES.length],
            parts: []
          });
        });
      }

      setAllCards(builtCards);
      setLoadingDeck(false);
    };

    buildDeck();
  }, [progress.completedLessons, progress.customFlashcards, customApiKey]);

  // Apply filter when allCards or filterMode changes
  useEffect(() => {
    let filtered = [...allCards];
    if (filterMode === 'curriculum') {
      filtered = filtered.filter(c => !c.isCustom);
    } else if (filterMode === 'custom') {
      filtered = filtered.filter(c => c.isCustom);
    }
    setDeck(filtered.sort(() => 0.5 - Math.random()));
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  }, [allCards, filterMode]);

  const handleDeleteCustomCard = (cardId: string) => {
    if (!onUpdateProgress || !progress.customFlashcards) return;
    const updated = progress.customFlashcards.filter(c => c.id !== cardId);
    onUpdateProgress({
      ...progress,
      customFlashcards: updated
    });
  };

  const handleClearAllCustomCards = () => {
    if (!onUpdateProgress || !window.confirm('Bạn có chắc muốn xóa tất cả thẻ tự tạo không?')) return;
    onUpdateProgress({
      ...progress,
      customFlashcards: []
    });
  };

  const customCardsCount = progress.customFlashcards?.length || 0;
  const curriculumCardsCount = allCards.filter(c => !c.isCustom).length;

  if (loadingDeck) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-20 min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Đang nạp kho Flashcards...</h2>
        <p className="text-stone-500">Đồng bộ các gốc từ đã học và từ vựng chuyên ngành bạn đã lưu.</p>
      </div>
    );
  }

  if (allCards.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-12 min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-200 max-w-xl w-full">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
            <Layers size={40} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">Kho Flashcards đang trống</h2>
          <p className="text-stone-600 mb-6 leading-relaxed">
            Kho Flashcards này là nơi lưu trữ chung toàn bộ từ vựng bạn đã học từ bài học gốc và các từ mới được AI Tutor tạo riêng cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onNavigateToTutor && (
              <button
                onClick={onNavigateToTutor}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Bot size={18} /> Tạo thẻ từ vựng với AI Tutor
              </button>
            )}
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Học bài gốc tại Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-12 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 max-w-md w-full">
          <p className="text-stone-500 mb-4">Không có thẻ nào trong bộ lọc này.</p>
          <button 
            onClick={() => setFilterMode('all')}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold"
          >
            Hiện tất cả thẻ
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-12 min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-200 animate-in zoom-in-95 duration-500 max-w-xl w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Check size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Hoàn thành phiên ôn tập!</h2>
          <p className="text-stone-600 mb-6">
            Bạn đã ôn luyện xuất sắc và tích lũy thêm <span className="font-bold text-amber-500">+{sessionXP} XP</span> vào tiến trình học.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setCompleted(false);
                setSessionXP(0);
                setIsFlipped(false);
                setDeck(prev => [...prev].sort(() => 0.5 - Math.random()));
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
            >
              <RotateCcw size={18} /> Ôn tập lại lần nữa
            </button>
            {onNavigateToTutor && (
              <button 
                onClick={onNavigateToTutor}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-100 text-orange-800 rounded-xl font-bold hover:bg-orange-200 transition-colors"
              >
                <Bot size={18} /> Tạo thêm thẻ mới với AI
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleFlip = () => {
    soundFX.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const handleNext = (remembered: boolean) => {
    if (remembered) {
      const xp = 5;
      setSessionXP(prev => prev + xp);
      soundFX.playXpGain();
      onProgressUpdate(xp);
    }

    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      soundFX.playLessonComplete();
      setCompleted(true);
    }
  };

  const filteredCustomCards = (progress.customFlashcards || []).filter(c => 
    c.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 shadow-xs">
            <Layers size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Kho Flashcards Chung</h1>
            <p className="text-xs sm:text-sm text-stone-500">
              Lưu trữ từ vựng bài học gốc & từ vựng AI chuyên ngành đã tạo ({allCards.length} thẻ).
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start md:self-auto">
          {customCardsCount > 0 && (
            <button
              onClick={() => setShowManager(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              title="Quản lý các từ đã lưu từ AI Tutor"
            >
              <BookmarkCheck size={16} className="text-amber-500" />
              Quản lý thẻ AI ({customCardsCount})
            </button>
          )}
          <div className="text-stone-600 font-bold text-xs sm:text-sm bg-stone-100 px-3.5 py-2 rounded-xl">
            Thẻ {currentIndex + 1} / {deck.length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
            filterMode === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Tất cả thẻ ({allCards.length})
        </button>
        {curriculumCardsCount > 0 && (
          <button
            onClick={() => setFilterMode('curriculum')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              filterMode === 'curriculum'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Từ gốc bài học ({curriculumCardsCount})
          </button>
        )}
        {customCardsCount > 0 && (
          <button
            onClick={() => setFilterMode('custom')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterMode === 'custom'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Bot size={14} className={filterMode === 'custom' ? 'text-amber-400' : 'text-stone-500'} />
            Từ vựng AI tạo ({customCardsCount})
          </button>
        )}
      </div>

      {/* Flashcard with fixed responsive height to guarantee never squishing */}
      <div className="w-full max-w-2xl mx-auto h-[380px] sm:h-[430px] perspective-1000">
        <div 
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={handleFlip}
        >
          {/* Front */}
          <div className={`absolute inset-0 w-full h-full backface-hidden ${currentCard.colorTheme.front} rounded-3xl shadow-xl border border-white/20 flex flex-col items-center justify-between p-6 sm:p-8 text-center select-none`}>
            <div className="w-full flex justify-between items-center text-white/80 text-xs font-semibold">
              <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-full">
                {currentCard.isCustom ? <Bot size={13} className="text-amber-300" /> : null}
                {currentCard.category || 'Từ vựng'}
              </span>
              <span className="bg-black/20 px-2.5 py-1 rounded-full text-[11px]">Chạm để lật thẻ</span>
            </div>

            <div className="my-auto px-4 py-2 flex flex-col items-center justify-center">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white drop-shadow-md break-words max-w-full leading-tight">
                {currentCard.word}
              </h2>
              {currentCard.root && currentCard.root !== 'Custom' && (
                <span className="mt-3 text-white/70 text-xs font-medium">Gốc từ: {currentCard.root}</span>
              )}
            </div>

            <p className="text-white/90 text-xs sm:text-sm flex items-center gap-2 bg-black/25 backdrop-blur-sm px-4 py-2 rounded-full font-medium">
              <RotateCcw size={14} /> Chạm để xem nghĩa
            </p>
          </div>

          {/* Back */}
          <div className={`absolute inset-0 w-full h-full backface-hidden ${currentCard.colorTheme.back} text-white rounded-3xl shadow-xl border border-stone-700 flex flex-col items-center justify-between p-6 sm:p-8 text-center rotate-y-180 select-none overflow-y-auto`}>
            <div className="w-full flex justify-between items-center text-stone-400 text-xs font-semibold">
              <span className="font-mono text-stone-300 truncate max-w-[200px]">{currentCard.word}</span>
              <span className={currentCard.isCustom ? 'text-amber-400' : 'text-blue-400'}>
                {currentCard.isCustom ? 'Thẻ lưu từ AI Tutor' : 'Bài học gốc'}
              </span>
            </div>

            <div className="my-auto px-4 py-2 flex flex-col items-center justify-center w-full">
              <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-2">Ý nghĩa</p>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-serif font-bold ${currentCard.colorTheme.text} mb-4 leading-snug break-words max-w-full`}>
                {currentCard.translation}
              </h2>
              
              {currentCard.parts && currentCard.parts.length > 0 && (
                <div className="w-full max-w-md bg-stone-800/80 p-3 sm:p-4 rounded-xl border border-stone-700">
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-2 text-center">Cấu trúc hình vị</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {currentCard.parts.map((part, pIdx) => (
                      <span key={pIdx} className="text-xs px-2.5 py-1 rounded-lg font-medium bg-stone-700/80 text-stone-200">
                        {part.text} <span className="opacity-60 text-[10px]">({part.meaning_vi || part.meaning})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-stone-500 text-xs">
              Chạm vào thẻ để lật lại
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`mt-6 flex justify-center gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => handleNext(false)}
          className="flex-1 max-w-[200px] py-3.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <X size={20} /> Chưa nhớ
        </button>
        <button 
          onClick={() => handleNext(true)}
          className="flex-1 max-w-[200px] py-3.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Check size={20} /> Đã thuộc (+5 XP)
        </button>
      </div>

      {/* Saved Custom Flashcards Manager Modal */}
      {showManager && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-2.5">
                <BookmarkCheck className="text-amber-500" size={24} />
                <h3 className="text-xl font-bold font-serif text-stone-900">Quản lý thẻ từ vựng đã lưu</h3>
              </div>
              <button 
                onClick={() => setShowManager(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
              <div className="relative w-full sm:w-auto flex-1">
                <Search size={16} className="absolute left-3 top-3 text-stone-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa..."
                  className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              {customCardsCount > 0 && (
                <button
                  onClick={handleClearAllCustomCards}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap self-end sm:self-auto"
                >
                  Xóa tất cả ({customCardsCount})
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredCustomCards.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm">
                  {searchQuery ? 'Không tìm thấy từ nào phù hợp với tìm kiếm.' : 'Chưa có thẻ tự tạo nào.'}
                </div>
              ) : (
                filteredCustomCards.map((card) => (
                  <div key={card.id} className="p-3.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 flex justify-between items-center transition-colors">
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-base">{card.word}</h4>
                      <p className="text-stone-600 text-xs sm:text-sm">{card.translation}</p>
                      <span className="text-[10px] text-stone-400">
                        {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'Vừa tạo'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCustomCard(card.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa thẻ này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowManager(false)}
                className="px-5 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

