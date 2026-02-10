import React, { useState, useEffect, useCallback } from 'react';
import { DrillQuestion, TierAssessmentResult } from '../types';
import { generateTierAssessment, evaluateAssessment } from '../services/geminiService';
import { CheckCircle, XCircle, Loader2, Award, AlertCircle, RefreshCw, Clock } from 'lucide-react';

interface TierAssessmentProps {
  tierId: number;
  roots: string[];
  onComplete: (result: TierAssessmentResult) => void;
  onCancel: () => void;
}

export const TierAssessment: React.FC<TierAssessmentProps> = ({ tierId, roots, onComplete, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<DrillQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [evaluation, setEvaluation] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(false);
  
  // Timer State
  const [seconds, setSeconds] = useState(0);

  const loadExam = useCallback(() => {
    setLoading(true);
    setError(false);
    setSeconds(0);
    generateTierAssessment(tierId, roots)
      .then(qs => {
        if (qs && qs.length > 0) {
            setQuestions(qs);
        } else {
            setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
          setError(true);
          setLoading(false);
      });
  }, [tierId, roots]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (!loading && !finished && !error) {
        interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, finished, error]);

  const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatFeedback = (text: string) => {
      if (!text) return null;
      return text.split('\n').map((line, i) => {
          if (!line.trim()) return <br key={i} />;
          // Parse bold markers **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
              <p key={i} className="mb-2 text-stone-700 leading-relaxed">
                  {parts.map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                          return <span key={j} className="font-bold text-stone-900">{part.slice(2, -2)}</span>;
                      }
                      return part;
                  })}
              </p>
          );
      });
  };

  const handleSelect = (idx: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [idx]: opt }));
  };

  const submitExam = async () => {
    setFinished(true);
    setEvaluating(true);
    
    let score = 0;
    const missedConcepts: string[] = [];
    
    questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) {
            score++;
        } else {
            missedConcepts.push(q.question); // Send full question for better context
        }
    });

    const finalScore = Math.round((score / questions.length) * 100);
    const passed = finalScore >= 70;

    const feedback = await evaluateAssessment(tierId, score, questions.length, missedConcepts, seconds);
    setEvaluation(feedback);
    setEvaluating(false);

    // Auto-save after delay
    setTimeout(() => {
        onComplete({
            tierId,
            score: finalScore,
            passed,
            feedback,
            date: new Date().toISOString()
        });
    }, 6000); // Increased delay so user can read feedback
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-stone-700">Generating Tier {tierId} Exam...</h2>
              <p className="text-stone-500">Consulting the AI for challenging questions.</p>
          </div>
      );
  }

  if (error || questions.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Assessment Generation Failed</h2>
              <p className="text-stone-500 mb-6">The AI historians couldn't assemble your exam papers. Please try again.</p>
              <div className="flex gap-4">
                  <button onClick={onCancel} className="px-6 py-2 rounded-lg text-stone-600 hover:bg-stone-100 font-bold">Cancel</button>
                  <button 
                    onClick={loadExam}
                    className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-700 flex items-center gap-2 font-bold"
                  >
                    <RefreshCw size={18} /> Retry
                  </button>
              </div>
          </div>
      );
  }

  if (finished) {
      const score = Object.keys(answers).filter(k => answers[parseInt(k)] === questions[parseInt(k)].correctAnswer).length;
      const passed = (score / questions.length) >= 0.7;

      return (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl text-center">
              {passed ? (
                  <div className="flex flex-col items-center text-green-600 mb-6">
                      <Award size={64} className="mb-2" />
                      <h2 className="text-3xl font-serif font-bold">Tier Mastered!</h2>
                  </div>
              ) : (
                  <div className="flex flex-col items-center text-orange-600 mb-6">
                      <AlertCircle size={64} className="mb-2" />
                      <h2 className="text-3xl font-serif font-bold">Keep Practicing</h2>
                  </div>
              )}
              
              <div className="flex justify-center gap-8 mb-6">
                  <div>
                    <p className="text-sm text-stone-500 uppercase font-bold">Score</p>
                    <p className="text-4xl font-bold text-stone-800">{score} / {questions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 uppercase font-bold">Time</p>
                    <p className={`text-4xl font-bold ${seconds < 30 ? 'text-red-500' : 'text-stone-800'}`}>{formatTime(seconds)}</p>
                  </div>
              </div>
              
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6 text-left">
                 <h3 className="font-bold text-stone-700 mb-4 border-b pb-2">AI Performance Analysis:</h3>
                 {evaluating ? (
                     <div className="flex items-center justify-center py-4">
                         <Loader2 className="animate-spin text-stone-400 mr-2" />
                         <span className="text-stone-500">Analyzing your speed and accuracy...</span>
                     </div>
                 ) : (
                     <div className="text-sm">
                         {formatFeedback(evaluation)}
                     </div>
                 )}
              </div>

              <p className="text-stone-400 text-sm">Saving results and returning...</p>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
        <div className="sticky top-0 z-30 bg-stone-50 pt-4 pb-4 border-b border-stone-200 mb-6 flex justify-between items-center px-2">
            <div>
                <h1 className="text-2xl font-serif font-bold">Tier {tierId} Assessment</h1>
                <p className="text-xs text-stone-500">Answer carefully.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg ${seconds > 300 ? 'text-red-600 bg-red-50' : 'text-stone-700 bg-white shadow-sm'}`}>
                    <Clock size={20} />
                    {formatTime(seconds)}
                </div>
                <button onClick={onCancel} className="text-stone-500 underline text-sm">Cancel</button>
            </div>
        </div>

        <div className="space-y-8">
            {questions.map((q, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <div className="flex gap-4 mb-4">
                        <span className="bg-stone-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">{idx + 1}</span>
                        <h3 className="text-lg font-medium">{q.question}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                        {q.options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => handleSelect(idx, opt)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${answers[idx] === opt ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-stone-100 hover:bg-stone-50'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={submitExam}
                disabled={Object.keys(answers).length < questions.length}
                className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all ${Object.keys(answers).length < questions.length ? 'bg-stone-300 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-stone-700'}`}
            >
                Submit Exam
            </button>
        </div>
    </div>
  );
};