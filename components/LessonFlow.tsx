import React, { useState, useEffect, useRef } from 'react';
import { Lesson, DrillQuestion, RichDerivative, RemediationPlan, WordPart, PartType } from '../types';
import { generateDrillQuestions, enrichLessonData, verifyUserDerivative, generateRemediation } from '../services/geminiService';
import { DissectionLab } from './DissectionLab';
import { WordTree } from './WordTree';
import { BrainCircuit, Construction, Loader2, RefreshCw, Volume2, History, Lightbulb, BookOpen, Send, Globe, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';

interface LessonFlowProps {
  lesson: Lesson;
  onComplete: () => void;
  onExit: () => void;
}

type Phase = 'PREPARING' | 'DISCOVERY' | 'DISSECTION' | 'DERIVATION' | 'DRILL' | 'REMEDIATION';

export const LessonFlow: React.FC<LessonFlowProps> = ({ lesson: initialLesson, onComplete, onExit }) => {
  const [lesson, setLesson] = useState<Lesson>(initialLesson);
  const [phase, setPhase] = useState<Phase>('PREPARING');
  const [bilingual, setBilingual] = useState(true); // Toggle for Vietnamese

  // Drill State
  const [drillQuestions, setDrillQuestions] = useState<DrillQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loadingDrill, setLoadingDrill] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [missedConcepts, setMissedConcepts] = useState<string[]>([]);
  
  // Remediation State
  const [remediation, setRemediation] = useState<RemediationPlan | null>(null);
  const [loadingRemediation, setLoadingRemediation] = useState(false);

  // Derivation/Sandbox State
  const [selectedDerivative, setSelectedDerivative] = useState<RichDerivative | null>(null);
  const [userWord, setUserWord] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<{valid: boolean, text: string} | null>(null);

  // Hydration
  useEffect(() => {
    const hydrate = async () => {
        if (!lesson.dissectionPack || lesson.dissectionPack.length === 0) {
            const enriched = await enrichLessonData(lesson.root, lesson.category);
            setLesson(prev => ({ ...prev, ...enriched }));
        }
        setPhase('DISCOVERY');
    };
    hydrate();
  }, [lesson.id]);

  // Load Drill
  useEffect(() => {
    if (phase === 'DRILL' && drillQuestions.length === 0 && !loadingDrill) {
      setLoadingDrill(true);
      generateDrillQuestions(lesson.root, lesson.meaning || "Unknown").then(questions => {
        setDrillQuestions(questions);
        setLoadingDrill(false);
      });
    }
  }, [phase]);

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; 
        window.speechSynthesis.speak(utterance);
    }
  };

  const handleSandboxCheck = async () => {
      if(!userWord.trim()) return;
      setIsVerifying(true);
      setSandboxResult(null);
      
      const result = await verifyUserDerivative(lesson.root, userWord);
      
      setIsVerifying(false);
      setSandboxResult({
          valid: result.isValid,
          text: result.analysis
      });

      if (result.isValid && result.parts) {
          // If valid, show it like a derivative card
           setSelectedDerivative({
              word: userWord,
              definition: result.meaning || "",
              definition_vi: result.meaning_vi || "",
              example: "User submitted word",
              example_vi: "Từ người dùng đóng góp"
           });
           playAudio(userWord);
      }
  };

  const startRemediation = async () => {
      setLoadingRemediation(true);
      setPhase('REMEDIATION');
      const plan = await generateRemediation(lesson.root, missedConcepts);
      setRemediation(plan);
      setLoadingRemediation(false);
  };

  const retryDrill = () => {
      // Reset Drill State
      setScore(0);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowAnswer(false);
      setMissedConcepts([]);
      // Shuffle questions for retry? Or fetch new ones? 
      // For simplicity, shuffle existing
      setDrillQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
      setPhase('DRILL');
  };

  if (phase === 'PREPARING') {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
              <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
              <h2 className="text-xl font-serif font-bold text-stone-700">Consulting AI...</h2>
              <p className="text-stone-500">Generating bespoke lesson for {lesson.root}</p>
          </div>
      );
  }

  // --- RENDERERS ---

  const renderHeader = () => (
      <div className="bg-white border-b border-stone-200 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <button onClick={onExit} className="text-stone-500 hover:text-stone-800 text-sm font-bold uppercase tracking-wider">
          &larr; Exit
        </button>
        
        {/* Progress Bar */}
        <div className="flex gap-1">
           {['DISCOVERY', 'DISSECTION', 'DERIVATION', 'DRILL'].map((p, i) => {
             const phases = ['DISCOVERY', 'DISSECTION', 'DERIVATION', 'DRILL', 'REMEDIATION'];
             const currIdx = phases.indexOf(phase);
             const thisIdx = phases.indexOf(p);
             const active = currIdx >= thisIdx;
             return (
                 <div key={p} className={`h-1.5 w-8 rounded-full transition-colors ${active ? 'bg-orange-500' : 'bg-stone-200'}`} />
             );
           })}
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => setBilingual(!bilingual)}
                className={`p-2 rounded-full transition-colors ${bilingual ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-400'}`}
                title="Toggle Bilingual Mode"
            >
                <Globe size={20} />
            </button>
            <div className="font-mono font-bold text-orange-600">XP: {score}</div>
        </div>
      </div>
  );

  const renderDiscovery = () => (
    <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in p-4 max-w-2xl mx-auto w-full pb-20">
      
      {/* Root Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-100 w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
        <h2 className="text-sm font-bold tracking-widest text-stone-400 uppercase mb-2">The Root</h2>
        <div className="flex items-center justify-center gap-3 mb-2">
             <h1 className="text-6xl font-serif font-bold text-stone-900">{lesson.root}</h1>
             <button onClick={() => playAudio(lesson.root)} className="text-orange-500 hover:text-orange-600"><Volume2 size={32} /></button>
        </div>
        <div className="inline-block bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-lg font-medium mb-6">
            {lesson.phonetic}
        </div>
        
        <div className="space-y-2">
            <p className="text-2xl font-serif text-stone-800 font-bold">{lesson.meaning}</p>
            {bilingual && <p className="text-xl font-serif text-blue-600 font-medium">{lesson.meaning_vi}</p>}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="bg-stone-100 rounded-xl p-6 relative">
             <History className="absolute top-4 right-4 text-stone-400" size={24} />
             <h3 className="font-bold text-stone-700 mb-2">Origin</h3>
             <p className="text-stone-600 text-sm mb-2">{lesson.etymology}</p>
             {bilingual && <p className="text-blue-600 text-sm italic">{lesson.etymology_vi}</p>}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 relative">
             <Lightbulb className="absolute top-4 right-4 text-yellow-500" size={24} />
             <h3 className="font-bold text-stone-800 mb-2">Fun Fact</h3>
             <p className="text-stone-700 text-sm mb-2">{lesson.funFact}</p>
             {bilingual && <p className="text-blue-600 text-sm italic">{lesson.funFact_vi}</p>}
          </div>
      </div>

      <div className="w-full bg-stone-900 rounded-xl p-6 flex items-center gap-6 text-white shadow-lg">
          <div>
              <h3 className="font-bold text-orange-400 mb-1">Metaphor</h3>
              <p className="italic text-stone-300 mb-1">"{lesson.metaphor}"</p>
              {bilingual && <p className="italic text-blue-300 text-sm">"{lesson.metaphor_vi}"</p>}
          </div>
      </div>

      <button 
        onClick={() => setPhase('DISSECTION')}
        className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        Start Dissection <Construction size={20} />
      </button>
    </div>
  );

  const renderDissection = () => (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-serif font-bold text-center mb-6">Phase 2: Dissection</h2>
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-stone-200">
        {/* Pass the whole pack of words */}
        <DissectionLab 
            pack={lesson.dissectionPack || []} 
            onComplete={() => setPhase('DERIVATION')} 
        />
      </div>
    </div>
  );

  const renderDerivation = () => (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start h-[calc(100vh-140px)]">
      
      {/* LEFT: Tree & Sandbox */}
      <div className="flex-1 w-full flex flex-col h-full">
        <h2 className="text-2xl font-serif font-bold mb-4">Phase 3: Word Lab</h2>
        
        {/* Interactive Tree */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-2 flex-grow min-h-[300px] mb-4 overflow-hidden relative">
            <WordTree 
                root={lesson.root} 
                derivatives={lesson.richDerivatives?.map(d => d.word) || []} 
                onNodeClick={(word) => {
                    const found = lesson.richDerivatives?.find(d => d.word === word);
                    if(found) {
                        setSelectedDerivative(found);
                        playAudio(word);
                        setSandboxResult(null);
                    }
                }}
                selectedWord={selectedDerivative?.word || null}
            />
            <div className="absolute bottom-2 right-2 text-xs text-stone-400">Click nodes to explore</div>
        </div>

        {/* Sandbox Input */}
        <div className="bg-stone-100 p-4 rounded-xl border border-stone-200">
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Experimental Sandbox</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={userWord}
                    onChange={(e) => setUserWord(e.target.value)}
                    placeholder="Type a word containing this root..."
                    className="flex-1 px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-200 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleSandboxCheck()}
                />
                <button 
                    onClick={handleSandboxCheck}
                    disabled={isVerifying || !userWord}
                    className="bg-stone-800 text-white px-4 rounded-lg hover:bg-stone-700 disabled:opacity-50"
                >
                    {isVerifying ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                </button>
            </div>
            {sandboxResult && (
                <div className={`mt-2 text-sm p-2 rounded ${sandboxResult.valid ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {sandboxResult.text}
                </div>
            )}
        </div>
        
        <div className="mt-4 flex justify-end">
             <button 
                onClick={() => setPhase('DRILL')}
                className="px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg"
            >
                Start Final Drill <BrainCircuit size={20} />
            </button>
        </div>
      </div>

      {/* RIGHT: Definition Card */}
      <div className="w-full md:w-80 flex-shrink-0 h-full overflow-y-auto custom-scrollbar">
          {selectedDerivative ? (
             <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100 animate-slide-in-right h-full">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="text-3xl font-serif font-bold text-stone-900">{selectedDerivative.word}</h3>
                    <button onClick={() => playAudio(selectedDerivative.word)} className="text-orange-500 bg-orange-50 p-2 rounded-full"><Volume2 size={20}/></button>
                 </div>
                 
                 <div className="space-y-6">
                     <div>
                         <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Definition</h4>
                         <p className="text-stone-800 font-medium">{selectedDerivative.definition}</p>
                         {bilingual && <p className="text-blue-600 mt-1">{selectedDerivative.definition_vi}</p>}
                     </div>
                     
                     <div>
                         <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Usage</h4>
                         <div className="bg-stone-50 p-4 rounded-lg border-l-4 border-stone-300">
                            <p className="italic text-stone-600 mb-2">"{selectedDerivative.example}"</p>
                            {bilingual && <p className="italic text-blue-500 text-sm">"{selectedDerivative.example_vi}"</p>}
                         </div>
                     </div>
                 </div>
             </div>
          ) : (
             <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl h-full flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                 <BookOpen size={48} className="mb-4 opacity-50" />
                 <p>Select a word from the tree or type one in the sandbox to analyze it.</p>
             </div>
          )}
      </div>
    </div>
  );

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    setSelectedOption(option);
    setShowAnswer(true);
    if (option === drillQuestions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 10); // Visual Score
    } else {
        // Track missed concepts
        setMissedConcepts(prev => [...prev, drillQuestions[currentQuestionIndex].question]);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < drillQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      finishDrill();
    }
  };

  const finishDrill = () => {
      // Calculate real score based on 100 points
      const correctCount = 10 - missedConcepts.length; // assuming 10 questions
      const finalScore = (correctCount / 10) * 100;
      
      if (correctCount >= 7) {
          onComplete();
      } else {
          startRemediation();
      }
  };

  const renderDrill = () => {
    if (loadingDrill || drillQuestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
           <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
           <p className="text-stone-500">AI is crafting 10 challenges...</p>
        </div>
      );
    }

    const currentQ = drillQuestions[currentQuestionIndex];
    if (!currentQ) return null;

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-serif font-bold">Phase 4: Deep Drill</h2>
           <div className="flex items-center gap-2">
               <span className="text-sm text-stone-500">Pass: 7/10</span>
               <span className="bg-stone-200 px-3 py-1 rounded-full text-sm font-mono font-bold">Q{currentQuestionIndex + 1}/10</span>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-200 relative overflow-hidden">
           {/* Progress bar for drill */}
           <div className="absolute top-0 left-0 h-1 bg-stone-100 w-full">
               <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / drillQuestions.length) * 100}%`}}></div>
           </div>

           <h3 className="text-lg font-medium text-stone-800 mb-6 leading-relaxed mt-4">{currentQ.question}</h3>
           
           <div className="space-y-3">
             {currentQ.options.map((option, idx) => {
               let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
               if (showAnswer) {
                 if (option === currentQ.correctAnswer) btnClass += "bg-green-100 border-green-500 text-green-800";
                 else if (option === selectedOption) btnClass += "bg-red-50 border-red-300 text-red-800";
                 else btnClass += "border-stone-100 text-stone-400 opacity-50";
               } else {
                 btnClass += "border-stone-100 hover:border-stone-300 hover:bg-stone-50";
               }

               return (
                 <button 
                   key={idx}
                   onClick={() => handleOptionSelect(option)}
                   disabled={showAnswer}
                   className={btnClass}
                 >
                   {option}
                 </button>
               );
             })}
           </div>

           {showAnswer && (
             <div className="mt-6 pt-6 border-t border-stone-100 animate-fade-in">
               <div className="mb-4">
                   <p className="text-sm font-bold text-stone-700">Explanation:</p>
                   <p className="text-stone-600 text-sm">{currentQ.explanation}</p>
                   {bilingual && <p className="text-blue-600 text-sm mt-1">{currentQ.explanation_vi}</p>}
               </div>
               <div className="flex justify-end">
                 <button 
                   onClick={nextQuestion}
                   className="px-6 py-2 bg-stone-900 text-white rounded-lg font-bold hover:bg-stone-700"
                 >
                   {currentQuestionIndex === drillQuestions.length - 1 ? 'Finish & Grade' : 'Next'}
                 </button>
               </div>
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderRemediation = () => {
      if (loadingRemediation || !remediation) {
           return (
             <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
                <p className="text-stone-500">Analyzing your mistakes...</p>
             </div>
           );
      }

      return (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border-t-4 border-red-500">
              <div className="flex flex-col items-center mb-6">
                  <XCircle size={64} className="text-red-500 mb-2" />
                  <h2 className="text-2xl font-bold text-stone-800">Not quite there yet</h2>
                  <p className="text-stone-500">You need 7/10 to pass. Let's review.</p>
              </div>

              <div className="bg-stone-50 p-6 rounded-xl mb-6">
                  <h3 className="font-bold text-stone-800 mb-2">AI Coach Analysis</h3>
                  <p className="text-stone-700 italic mb-4">"{remediation.analysis}"</p>
                  
                  <div className="space-y-2">
                      {remediation.reviewPoints.map((point, i) => (
                          <div key={i} className="flex gap-2 items-start">
                              <span className="bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">{i+1}</span>
                              <p className="text-sm text-stone-600">{point}</p>
                          </div>
                      ))}
                  </div>
              </div>

              <button 
                onClick={retryDrill}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
              >
                  Try Again
              </button>
          </div>
      );
  };

  // Main Layout
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {renderHeader()}
      <div className="flex-1 p-6 flex items-center justify-center">
        {phase === 'DISCOVERY' && renderDiscovery()}
        {phase === 'DISSECTION' && renderDissection()}
        {phase === 'DERIVATION' && renderDerivation()}
        {phase === 'DRILL' && renderDrill()}
        {phase === 'REMEDIATION' && renderRemediation()}
      </div>
    </div>
  );
};