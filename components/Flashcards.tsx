import React, { useState, useEffect } from 'react';
import { UserProgress, Lesson } from '../types';
import { CURRICULUM } from '../constants';
import { Layers, Check, X, RotateCcw, Loader2 } from 'lucide-react';
import { enrichLessonData } from '../services/geminiService';

interface FlashcardsProps {
  progress: UserProgress;
  customApiKey?: string;
  onProgressUpdate: (xpGained: number) => void;
}

interface WordCard {
  word: string;
  translation: string;
  parts: { text: string; type: string; meaning: string; meaning_vi?: string }[];
  root: string;
  category: string;
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

export const Flashcards: React.FC<FlashcardsProps> = ({ progress, customApiKey, onProgressUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  
  const [deck, setDeck] = useState<WordCard[]>([]);
  const [loadingDeck, setLoadingDeck] = useState(true);

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

      if (lessons.length === 0) {
        setLoadingDeck(false);
        return;
      }

      // 2. Pick up to 5 random lessons to keep loading time reasonable
      const selectedLessons = lessons.sort(() => 0.5 - Math.random()).slice(0, 5);

      // 3. Fetch enriched data
      const newDeck: WordCard[] = [];
      await Promise.all(selectedLessons.map(async (lesson, idx) => {
        const theme = THEMES[idx % THEMES.length];
        try {
          const enriched = await enrichLessonData(lesson.id, lesson.root, lesson.category, lesson.tier, customApiKey);
          if (enriched && enriched.dissectionPack) {
             // Add each word from the dissection pack as its own flashcard
             enriched.dissectionPack.forEach(item => {
               newDeck.push({
                 word: item.word,
                 translation: item.translation,
                 parts: item.parts,
                 root: lesson.root,
                 category: lesson.category,
                 colorTheme: theme
               });
             });
          }
        } catch (e) {
          console.error(e);
        }
      }));

      // 4. Shuffle the deck
      setDeck(newDeck.sort(() => 0.5 - Math.random()));
      setLoadingDeck(false);
    };

    buildDeck();
  }, [progress.completedLessons, customApiKey]);

  if (loadingDeck) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-20 min-h-[100dvh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Building your deck...</h2>
        <p className="text-stone-500">Gathering words from your learned roots.</p>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-20 min-h-[100dvh]">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-200">
          <Layers size={64} className="mx-auto text-stone-300 mb-6" />
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">No Flashcards Yet</h2>
          <p className="text-stone-600">
            You haven't completed any lessons yet. Start learning some roots in the Dashboard to unlock your daily flashcards!
          </p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-20 min-h-[100dvh]">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-200 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={48} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Daily Review Complete!</h2>
          <p className="text-stone-600 mb-8">
            Great job reviewing your vocabulary. You earned <span className="font-bold text-amber-500">{sessionXP} XP</span> today.
          </p>
          <button 
            onClick={() => {
              setCurrentIndex(0);
              setCompleted(false);
              setSessionXP(0);
              setIsFlipped(false);
              setDeck(prev => [...prev].sort(() => 0.5 - Math.random()));
            }}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
          >
            <RotateCcw size={20} /> Review Again
          </button>
        </div>
      </div>
    );
  }

  const currentCard = deck[currentIndex];

  const handleNext = (remembered: boolean) => {
    if (remembered) {
      const xp = 5; // 5 XP per word
      setSessionXP(prev => prev + xp);
      onProgressUpdate(xp);
    }

    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Layers size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Daily Flashcards</h1>
            <p className="text-stone-500">Review words from your learned roots.</p>
          </div>
        </div>
        <div className="text-stone-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-stone-200">
          Card {currentIndex + 1} of {deck.length}
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/9] perspective-1000">
        <div 
          className={`w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className={`absolute w-full h-full backface-hidden ${currentCard.colorTheme.front} rounded-3xl shadow-xl border border-white/20 flex flex-col items-center justify-center p-8 text-center`}>
            <p className="text-white/80 font-bold uppercase tracking-widest mb-4">What does this word mean?</p>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white drop-shadow-md">{currentCard.word}</h2>
            <p className="text-white/80 mt-8 text-sm flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full">
              <RotateCcw size={16} /> Click to flip
            </p>
          </div>

          {/* Back */}
          <div className={`absolute w-full h-full backface-hidden ${currentCard.colorTheme.back} text-white rounded-3xl shadow-xl border border-stone-700 flex flex-col items-center justify-center p-6 md:p-8 text-center rotate-y-180 overflow-y-auto custom-scrollbar`}>
            <p className="text-stone-400 font-bold uppercase tracking-widest mb-2">Meaning</p>
            <h2 className={`text-3xl md:text-4xl font-serif font-bold ${currentCard.colorTheme.text} mb-6`}>{currentCard.translation}</h2>
            
            <div className="w-full max-w-lg space-y-4 text-left">
              <div className="bg-stone-800/80 p-5 rounded-xl border border-stone-700">
                <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-3 text-center">Structure</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentCard.parts.map((part, pIdx) => (
                    <span key={pIdx} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${
                      part.type === 'PREFIX' ? 'bg-blue-900/50 text-blue-300 border border-blue-800/50' :
                      part.type === 'ROOT' ? 'bg-orange-900/50 text-orange-300 border border-orange-800/50' :
                      'bg-purple-900/50 text-purple-300 border border-purple-800/50'
                    }`}>
                      {part.text} <span className="opacity-60 font-normal ml-1">({part.meaning})</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-stone-800/50 p-4 rounded-xl flex justify-between items-center border border-stone-700/50">
                <div>
                  <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">From Root</p>
                  <p className="text-white font-bold text-lg">{currentCard.root}</p>
                </div>
                <div className="text-right">
                  <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">Category</p>
                  <p className="text-white font-medium">{currentCard.category}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`mt-8 flex justify-center gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => handleNext(false)}
          className="flex-1 max-w-[200px] py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <X size={24} /> Forgot
        </button>
        <button 
          onClick={() => handleNext(true)}
          className="flex-1 max-w-[200px] py-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Check size={24} /> Remembered
        </button>
      </div>
    </div>
  );
};
