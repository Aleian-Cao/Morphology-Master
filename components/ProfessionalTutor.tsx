import React, { useState } from 'react';
import { Bot, Send, ShieldAlert, ArrowLeft, Briefcase, Activity, CheckCircle2, Layers, RotateCcw, X, Check, BookmarkCheck, Volume2 } from 'lucide-react';
import { getTutorPipeline } from '../services/tutorService';
import { User, UserProgress, CustomFlashcard } from '../types';
import { playEnglishAudio } from '../utils/audioHelper';
import { soundFX } from '../utils/soundEffects';

interface ProfessionalTutorProps {
  user: User | null;
  onBack: () => void;
  onUpdateProgress: (progress: UserProgress) => void;
  onNavigateToFlashcards?: () => void;
}

interface Flashcard {
  word: string;
  translation: string;
}

const THEMES = [
  { front: 'bg-gradient-to-br from-blue-500 to-cyan-600', back: 'bg-stone-900', text: 'text-cyan-400' },
  { front: 'bg-gradient-to-br from-orange-500 to-amber-600', back: 'bg-stone-900', text: 'text-amber-400' },
  { front: 'bg-gradient-to-br from-purple-500 to-fuchsia-600', back: 'bg-stone-900', text: 'text-fuchsia-400' },
  { front: 'bg-gradient-to-br from-emerald-500 to-teal-600', back: 'bg-stone-900', text: 'text-teal-400' },
  { front: 'bg-gradient-to-br from-rose-500 to-red-600', back: 'bg-stone-900', text: 'text-rose-400' },
  { front: 'bg-gradient-to-br from-indigo-500 to-violet-600', back: 'bg-stone-900', text: 'text-violet-400' },
];

export const ProfessionalTutor: React.FC<ProfessionalTutorProps> = ({ user, onBack, onUpdateProgress, onNavigateToFlashcards }) => {
  const [jobDescription, setJobDescription] = useState(user?.progress?.jobDescription || 'Software Engineer');
  const [userInput, setUserInput] = useState('');
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    
    setErrorMsg('');
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
    setIsLoading(true);

    try {
      setCurrentStatus('Guardrail đang kiểm tra an toàn...');
      const app = await getTutorPipeline(user?.customApiKey);
      const initialState = {
        user_input: userInput,
        job_description: jobDescription,
        is_safe: true,
        intent: '',
        final_output: ''
      };

      const stream = await app.stream(initialState, { configurable: { thread_id: "test-thread-" + Date.now() } });
      let finalState: any = null;
      for await (const s of (stream as AsyncIterable<any>)) {
          if (s.guardrail_node) {
              setCurrentStatus('Trích xuất phân loại...');
          }
          if (s.intent_routing_node) {
              setCurrentStatus(`Đang tạo thẻ từ mới...`);
          }
          if (s.generation_node) {
             finalState = s.generation_node;
          }
      }

      const outputStr = finalState?.final_output || '[]';
      // Try parsing JSON
      let resultCards: Flashcard[] = [];
      try {
         // Some LLMs wrap JSON in markdown block like ```json
         let cleanStr = outputStr.replace(/```json/gi, '').replace(/```/g, '').trim();
         resultCards = JSON.parse(cleanStr);
         if (!Array.isArray(resultCards)) {
             resultCards = [];
         }
      } catch (err) {
         console.error("Failed to parse flashcards JSON:", outputStr);
         throw new Error("Không thể tạo flashcards. Vui lòng thử lại với yêu cầu khác.");
      }

      if (resultCards.length === 0) {
         throw new Error("Không tìm thấy từ vựng nào từ yêu cầu của bạn.");
      }

      setCards(resultCards);

      if (user) {
        const newCustomCards: CustomFlashcard[] = resultCards.map(c => ({
            id: 'fc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            word: c.word,
            translation: c.translation,
            createdAt: new Date().toISOString()
        }));
        const currentCards = user.progress.customFlashcards || [];
        onUpdateProgress({
            ...user.progress,
            customFlashcards: [...currentCards, ...newCustomCards]
        });
      }

    } catch (e: any) {
       console.error(e);
       setErrorMsg(`Lỗi hệ thống: ${e.message}`);
    }

    setIsLoading(false);
    setCurrentStatus('');
  };

  const currentTheme = THEMES[currentIndex % THEMES.length];
  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    soundFX.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    soundFX.playXpGain();
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      soundFX.playLessonComplete();
      setCompleted(true);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-stone-50 flex flex-col pt-16">
      <div className="flex justify-between items-center bg-white border-b border-stone-200 p-4 fixed top-0 w-full z-10 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-bold">
          <ArrowLeft size={20} /> Quay lại
        </button>
        <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
           <Bot size={18} /> AI Flashcard Generator
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col mt-2">
        
        {/* Settings Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="bg-stone-100 p-2 rounded-lg"><Briefcase size={20} className="text-stone-600"/></div>
               <div className="flex flex-col flex-1">
                   <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ngành nghề / Vị trí</label>
                   <input 
                      type="text" 
                        value={jobDescription} 
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="font-serif font-bold text-lg text-stone-800 bg-transparent border-b border-stone-300 focus:border-orange-500 outline-none w-full max-w-[200px]"
                      placeholder="VD: Software Engineer"
                   />
               </div>
           </div>
           <div className="flex items-center gap-4 text-xs font-medium text-stone-500 bg-stone-50 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500"/> Guardrail Active</div>
           </div>
        </div>

        {/* Generator Input */}
        {cards.length === 0 && !isLoading && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col mb-6">
                 <div className="p-8 text-center border-b border-stone-100">
                     <Layers size={48} className="mx-auto text-amber-500 mb-4" />
                     <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Tạo Flashcards Chuyên Ngành</h2>
                     <p className="text-stone-500">Mô tả chủ đề, hoặc dán một đoạn văn/email để trích xuất từ vựng quan trọng.</p>
                 </div>
                <div className="p-4 bg-stone-50">
                    <div className="relative">
                        <textarea 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Nhập yêu cầu (VD: Danh sách từ vựng viết email xin phép nghỉ ốm, hoặc dán email vào đây...)"
                            className="w-full bg-white border border-stone-300 rounded-xl pl-4 pr-14 py-4 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none resize-none min-h-[120px]"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading || !userInput.trim()}
                            className="absolute right-3 bottom-3 bg-amber-500 text-stone-900 font-bold px-4 py-2 rounded-lg hover:bg-amber-600 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
                        >
                            Tạo <Bot size={18} />
                        </button>
                    </div>
                    {errorMsg && (
                      <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm font-medium">
                         <ShieldAlert size={16} /> {errorMsg}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                       {['Từ vựng kế toán', 'Viết email phàn nàn', 'Tham gia cuộc họp dự án', 'Đọc tài liệu kỹ thuật'].map(hint => (
                           <button 
                              key={hint}
                              onClick={() => setUserInput(hint)}
                              className="text-xs font-medium text-stone-500 bg-stone-200/50 hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors"
                           >
                               {hint}
                           </button>
                       ))}
                    </div>
                </div>
            </div>
        )}

        {/* Loading State */}
        {isLoading && (
            <div className="p-12 bg-white rounded-3xl shadow-sm border border-stone-200 text-center flex flex-col items-center flex-1 justify-center">
                 <Bot size={48} className="text-amber-500 animate-bounce mb-6"/>
                 <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">AI đang phân tích...</h2>
                 <p className="text-stone-500">{currentStatus}</p>
                 <div className="w-full max-w-xs h-2 bg-stone-100 rounded-full mt-6 overflow-hidden">
                     <div className="h-full bg-amber-500 rounded-full animate-pulse w-full"></div>
                 </div>
            </div>
        )}

        {/* Completion State */}
        {completed && cards.length > 0 && !isLoading && (
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-200 text-center animate-in zoom-in-95 duration-500">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                 <Check size={40} />
               </div>
               <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-2">Đã học xong {cards.length} thẻ!</h2>
               <p className="text-stone-600 mb-2">Toàn bộ các thẻ từ vựng này đã được lưu vào <span className="font-semibold text-stone-900">Kho Flashcards chung</span>.</p>
               <p className="text-stone-500 text-sm mb-6">Bạn có thể ôn tập bất cứ lúc nào qua chế độ lặp lại ngắt quãng (SRS) tại mục Flashcards.</p>
               
               <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                 {onNavigateToFlashcards && (
                   <button 
                     onClick={onNavigateToFlashcards}
                     className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm"
                   >
                     <Layers size={18} /> Đến Kho Flashcards
                   </button>
                 )}
                 <button 
                   onClick={() => {
                     setCards([]);
                     setUserInput('');
                     setCompleted(false);
                   }}
                   className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
                 >
                   <RotateCcw size={18} /> Tạo bộ thẻ khác
                 </button>
               </div>
            </div>
        )}

        {/* Deck View */}
        {cards.length > 0 && !isLoading && !completed && currentCard && (
           <div className="flex flex-col w-full my-auto pb-6">
             {/* Saved notice banner */}
             <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between mb-4 shadow-xs">
                <span className="flex items-center gap-1.5 font-semibold">
                  <BookmarkCheck size={16} className="text-amber-600 shrink-0" />
                  Đã lưu chung vào kho Flashcards ({user?.progress?.customFlashcards?.length || cards.length} thẻ đã lưu)
                </span>
                {onNavigateToFlashcards && (
                  <button 
                    onClick={onNavigateToFlashcards}
                    className="underline text-orange-700 hover:text-orange-900 font-bold ml-2 shrink-0"
                  >
                    Mở kho thẻ
                  </button>
                )}
             </div>

             <div className="flex justify-between items-center text-sm font-medium text-stone-500 mb-3 px-1">
                 <span className="bg-stone-200/70 text-stone-700 px-3 py-1 rounded-full text-xs font-bold">
                   Thẻ {currentIndex + 1} / {cards.length}
                 </span>
                 <button onClick={() => setCards([])} className="text-stone-400 hover:text-red-500 text-xs font-medium transition-colors">
                   Hủy phiên học
                 </button>
             </div>
             
             {/* Flashcard with explicit fixed responsive height so it never collapses */}
             <div 
               style={{ minHeight: '380px', height: '380px' }}
               className="w-full max-w-xl mx-auto min-h-[380px] sm:min-h-[420px] h-[380px] sm:h-[420px] shrink-0 perspective-1000 relative select-none"
             >
               <div 
                 style={{ minHeight: '380px', height: '100%' }}
                 className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                 onClick={handleFlip}
               >
                 {/* Front */}
                 <div 
                   style={{ minHeight: '380px', height: '100%', boxSizing: 'border-box' }}
                   className={`absolute inset-0 w-full h-full backface-hidden ${currentTheme.front} rounded-3xl shadow-xl border border-white/20 flex flex-col items-center justify-between p-6 sm:p-8 text-center select-none overflow-hidden`}
                 >
                   <div className="w-full flex justify-between items-center text-white/80 text-xs font-semibold tracking-wider">
                     <span className="truncate max-w-[180px]">{jobDescription || 'Chuyên ngành'}</span>
                     <span className="bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px]">Chạm để lật</span>
                   </div>
                   
                   <div className="my-auto px-4 py-2 flex flex-col items-center justify-center">
                     <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white drop-shadow-md break-words max-w-full leading-tight">
                       {currentCard.word}
                     </h2>
                     <button
                       type="button"
                       onClick={(e) => {
                         e.stopPropagation();
                         playEnglishAudio(currentCard.word);
                       }}
                       className="mt-4 px-3 py-1.5 bg-black/25 hover:bg-black/40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                       title="Nghe phát âm chuẩn"
                     >
                       <Volume2 size={15} /> Nghe phát âm
                     </button>
                   </div>

                   <p className="text-white/90 text-xs sm:text-sm flex items-center gap-2 bg-black/25 backdrop-blur-sm px-4 py-2 rounded-full font-medium">
                     <RotateCcw size={14} /> Chạm để xem nghĩa tiếng Việt
                   </p>
                 </div>

                 {/* Back */}
                 <div 
                   style={{ minHeight: '380px', height: '100%', boxSizing: 'border-box' }}
                   className={`absolute inset-0 w-full h-full backface-hidden ${currentTheme.back} text-white rounded-3xl shadow-xl border border-stone-700 flex flex-col items-center justify-between p-6 sm:p-8 text-center rotate-y-180 select-none overflow-hidden`}
                 >
                   <div className="w-full flex justify-between items-center text-stone-400 text-xs font-semibold tracking-wider">
                     <span className="font-mono text-stone-300 truncate max-w-[160px]">{currentCard.word}</span>
                     <span className="text-amber-400 font-medium">Flashcard Chung</span>
                   </div>

                   <div className="my-auto px-4 py-2 flex flex-col items-center justify-center">
                     <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-3">Ý nghĩa tiếng Việt</p>
                     <h2 className={`text-2xl sm:text-4xl font-serif font-bold ${currentTheme.text} leading-snug break-words max-w-full mb-3`}>
                       {currentCard.translation}
                     </h2>
                     <button
                       type="button"
                       onClick={(e) => {
                         e.stopPropagation();
                         playEnglishAudio(currentCard.word);
                       }}
                       className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                     >
                       <Volume2 size={14} className="text-amber-400" /> Nghe lại: {currentCard.word}
                     </button>
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
                 onClick={handleNext}
                 className="w-full max-w-xs py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md text-base"
               >
                 {currentIndex < cards.length - 1 ? 'Thẻ tiếp theo' : 'Hoàn thành bộ thẻ'}
               </button>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};
