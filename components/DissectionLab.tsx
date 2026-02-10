import React, { useState, useEffect } from 'react';
import { WordPart, PartType, DissectionTarget } from '../types';
import { GripVertical, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface DissectionLabProps {
  pack: DissectionTarget[];
  onComplete: () => void;
}

export const DissectionLab: React.FC<DissectionLabProps> = ({ pack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bank, setBank] = useState<WordPart[]>([]);
  const [slots, setSlots] = useState<(WordPart | null)[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const currentTarget = pack[currentIndex];

  useEffect(() => {
    if (currentTarget) {
        setupRound();
    }
  }, [currentIndex, pack]);

  const setupRound = () => {
    const parts = currentTarget.parts;
    const shuffled = [...parts].sort(() => Math.random() - 0.5);
    setBank(shuffled);
    setSlots(new Array(parts.length).fill(null));
    setIsSuccess(false);
  };

  const handleDragStart = (e: React.DragEvent, item: WordPart, sourceIndex: number, source: 'bank' | 'slot') => {
    e.dataTransfer.setData('application/json', JSON.stringify({ item, sourceIndex, source }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropSlot = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    
    const { item, sourceIndex, source } = JSON.parse(data);
    const newSlots = [...slots];
    const newBank = [...bank];
    const existingItem = newSlots[targetIndex];

    if (source === 'bank') {
      newBank.splice(sourceIndex, 1);
      newSlots[targetIndex] = item;
      if (existingItem) newBank.push(existingItem); 
    } else {
      newSlots[sourceIndex] = existingItem;
      newSlots[targetIndex] = item;
    }

    setBank(newBank);
    setSlots(newSlots);
    checkCompletion(newSlots);
  };

  const handleDropBank = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    const { item, sourceIndex, source } = JSON.parse(data);
    if (source === 'slot') {
      const newSlots = [...slots];
      const newBank = [...bank];
      newSlots[sourceIndex] = null;
      newBank.push(item);
      setSlots(newSlots);
      setBank(newBank);
    }
  };

  const checkCompletion = (currentSlots: (WordPart | null)[]) => {
    const isFull = currentSlots.every(s => s !== null);
    if (!isFull) return;

    // Strict order check
    const isCorrect = currentSlots.every((s, idx) => s && s.text === currentTarget.parts[idx].text);
    
    if (isCorrect) {
      setIsSuccess(true);
    }
  };

  const nextWord = () => {
      if (currentIndex < pack.length - 1) {
          setCurrentIndex(prev => prev + 1);
      } else {
          onComplete();
      }
  };

  if (!currentTarget) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center gap-6 w-full py-4">
      <div className="text-center">
        <div className="mb-2 text-xs font-bold tracking-widest text-orange-500 uppercase">
            Word {currentIndex + 1} of {pack.length}
        </div>
        <h3 className="text-xl font-bold text-stone-700">Reconstruct: {currentTarget.translation}</h3>
        <p className="text-stone-500 text-sm">Drag parts to build the English word.</p>
      </div>

      {/* Target Slots */}
      <div className="flex flex-wrap items-center gap-2 p-6 bg-stone-100 rounded-xl shadow-inner min-h-[120px] w-full justify-center border border-stone-200">
        {slots.map((slot, index) => (
          <div
            key={`slot-${index}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropSlot(e, index)}
            className={`
              w-28 h-28 rounded-xl border-2 border-dashed flex items-center justify-center transition-all
              ${slot ? 'border-transparent' : 'border-stone-300 bg-white'}
              ${isSuccess ? 'bg-green-50 border-green-400' : ''}
            `}
          >
            {slot ? (
               <div 
                 draggable 
                 onDragStart={(e) => handleDragStart(e, slot, index, 'slot')}
                 className={`
                    w-full h-full rounded-lg shadow-md flex flex-col items-center justify-center cursor-grab active:cursor-grabbing p-2 text-center
                    ${slot.type === PartType.ROOT ? 'bg-orange-500 text-white' : 'bg-stone-800 text-white'}
                 `}
               >
                 <span className="font-bold text-lg leading-tight">{slot.text}</span>
                 <span className="text-[10px] opacity-80 mt-1">{slot.meaning}</span>
                 {slot.meaning_vi && <span className="text-[10px] opacity-80 text-yellow-200">{slot.meaning_vi}</span>}
               </div>
            ) : (
              <span className="text-stone-300 text-xs font-bold">PART {index + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Source Bank */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDropBank}
        className="flex flex-wrap justify-center gap-4 p-4 w-full"
      >
        {bank.map((item, index) => (
          <div
            key={`bank-${index}-${item.text}`}
            draggable
            onDragStart={(e) => handleDragStart(e, item, index, 'bank')}
            className={`
               px-5 py-3 rounded-lg shadow-sm border-b-4 transform hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing flex items-center gap-2
               ${item.type === PartType.ROOT ? 'bg-orange-100 border-orange-300 text-orange-900' : 'bg-stone-200 border-stone-300 text-stone-700'}
            `}
          >
            <GripVertical size={16} className="opacity-50" />
            <span className="font-bold">{item.text}</span>
          </div>
        ))}
      </div>

      {isSuccess && (
        <div className="flex flex-col items-center animate-fade-in mt-2">
            <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle2 size={32} />
                <span className="font-bold text-lg">Correct! {currentTarget.word}</span>
            </div>
            <button 
                onClick={nextWord}
                className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-700 flex items-center gap-2 shadow-lg"
            >
                {currentIndex < pack.length - 1 ? 'Next Word' : 'Complete Phase'} <ArrowRight size={20} />
            </button>
        </div>
      )}
      
      {!isSuccess && bank.length === 0 && slots.every(s => s !== null) && (
          <div className="text-red-500 font-medium flex items-center gap-2 cursor-pointer bg-red-50 px-4 py-2 rounded-full" onClick={setupRound}>
              <RotateCcw size={16} /> Incorrect order. Try again?
          </div>
      )}
    </div>
  );
};