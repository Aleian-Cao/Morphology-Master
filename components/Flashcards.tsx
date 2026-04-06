import React, { useState, useMemo } from 'react';
import { UserProgress, Lesson } from '../types';
import { CURRICULUM } from '../constants';
import { Layers, Check, X, RotateCcw, BrainCircuit } from 'lucide-react';

interface FlashcardsProps {
  progress: UserProgress;
  onProgressUpdate: (xpGained: number) => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ progress, onProgressUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);

  // Extract all learned lessons
  const learnedLessons = useMemo(() => {
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
    
    // Shuffle and pick up to 10 for a daily session
    return lessons.sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [progress.completedLessons]);

  if (learnedLessons.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-20">
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
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center mt-20">
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
            }}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
          >
            <RotateCcw size={20} /> Review Again
          </button>
        </div>
      </div>
    );
  }

  const currentCard = learnedLessons[currentIndex];

  const handleNext = (remembered: boolean) => {
    if (remembered) {
      const xp = 10;
      setSessionXP(prev => prev + xp);
      onProgressUpdate(xp);
    }

    if (currentIndex < learnedLessons.length - 1) {
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
            <p className="text-stone-500">Review your learned roots.</p>
          </div>
        </div>
        <div className="text-stone-500 font-medium">
          Card {currentIndex + 1} of {learnedLessons.length}
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/9] perspective-1000">
        <div 
          className={`w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-lg border border-stone-200 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-stone-400 font-bold uppercase tracking-widest mb-4">What does this mean?</p>
            <h2 className="text-6xl md:text-8xl font-serif font-bold text-stone-900">{currentCard.root}</h2>
            <p className="text-stone-400 mt-8 text-sm flex items-center gap-2">
              <RotateCcw size={16} /> Click to flip
            </p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-stone-900 text-white rounded-3xl shadow-lg border border-stone-800 flex flex-col items-center justify-center p-8 text-center rotate-y-180">
            <p className="text-stone-400 font-bold uppercase tracking-widest mb-4">Meaning</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-6">{currentCard.meaning}</h2>
            
            <div className="bg-stone-800/50 p-4 rounded-xl max-w-md w-full">
              <p className="text-stone-300 text-sm uppercase tracking-wider mb-1">Category</p>
              <p className="text-white font-medium">{currentCard.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`mt-8 flex justify-center gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => handleNext(false)}
          className="flex-1 max-w-[200px] py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <X size={24} /> Forgot
        </button>
        <button 
          onClick={() => handleNext(true)}
          className="flex-1 max-w-[200px] py-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Check size={24} /> Remembered
        </button>
      </div>
    </div>
  );
};
