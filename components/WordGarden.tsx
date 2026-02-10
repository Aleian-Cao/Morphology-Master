import React from 'react';
import { UserProgress } from '../types';
import { ArrowLeft, Sprout, Trees, Cloud, Sun } from 'lucide-react';

interface WordGardenProps {
  progress: UserProgress;
  onBack: () => void;
}

export const WordGarden: React.FC<WordGardenProps> = ({ progress, onBack }) => {
  const treeCount = progress.garden.trees;

  return (
    <div className="min-h-screen bg-sky-100 relative overflow-hidden flex flex-col">
      
      {/* Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={onBack}
          className="bg-white/80 backdrop-blur p-3 rounded-full hover:bg-white shadow-sm transition-all text-stone-700"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Sky Decor */}
      <Sun className="absolute top-10 right-10 text-yellow-400 animate-pulse" size={80} />
      <Cloud className="absolute top-20 left-1/4 text-white opacity-80" size={64} />
      <Cloud className="absolute top-40 right-1/3 text-white opacity-60" size={48} />

      {/* Stats */}
      <div className="relative z-10 pt-20 pb-10 text-center">
        <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">The Word Garden</h1>
        <p className="text-stone-600">Every lesson learned plants a seed of knowledge.</p>
        <div className="mt-4 bg-white/50 inline-block px-6 py-2 rounded-full backdrop-blur">
          <span className="font-bold text-green-800 text-xl">{treeCount}</span> <span className="text-green-900">Roots Planted</span>
        </div>
      </div>

      {/* The Ground & Trees */}
      <div className="flex-1 bg-gradient-to-b from-green-200 to-green-600 relative mt-auto border-t-4 border-green-700">
        <div className="absolute -top-8 w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNDAgQTIwIDIwIDAgMCAxIDQwIDQwIFoiIGZpbGw9IiM4NmM1ZDAiLz48L3N2Zz4=')] bg-repeat-x opacity-100"></div>
        
        <div className="max-w-6xl mx-auto p-8 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 items-end justify-items-center h-full min-h-[400px]">
          {/* Render Trees based on progress */}
          {Array.from({ length: treeCount }).map((_, i) => (
             <div key={i} className="flex flex-col items-center animate-bounce-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <Trees 
                  size={40 + (i % 3) * 10} 
                  className={`${i % 2 === 0 ? 'text-green-800' : 'text-green-900'} drop-shadow-lg transform hover:scale-110 transition-transform cursor-pointer`} 
                />
                <div className="w-8 h-2 bg-black opacity-10 rounded-full mt-1 blur-sm"></div>
             </div>
          ))}

          {/* Placeholders for unearned trees */}
          {Array.from({ length: Math.max(0, 20 - treeCount) }).map((_, i) => (
            <div key={`empty-${i}`} className="opacity-20 flex flex-col items-center">
               <Sprout size={24} className="text-stone-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};