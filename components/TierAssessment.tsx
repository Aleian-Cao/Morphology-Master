import React, { useState, useEffect } from 'react';
import { DrillQuestion, TierAssessmentResult } from '../types';
import { generateTierAssessment, evaluateAssessment } from '../services/geminiService';
import { CheckCircle, XCircle, Loader2, Award, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    generateTierAssessment(tierId, roots).then(qs => {
        setQuestions(qs);
        setLoading(false);
    });
  }, [tierId]);

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
            missedConcepts.push(q.question.substring(0, 20) + "..."); // Rough tracking
        }
    });

    const finalScore = Math.round((score / questions.length) * 100);
    const passed = finalScore >= 70;

    const feedback = await evaluateAssessment(tierId, score, questions.length, missedConcepts);
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
    }, 4000);
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
              
              <p className="text-4xl font-bold text-stone-800 mb-6">{score} / {questions.length}</p>
              
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mb-6">
                 <h3 className="font-bold text-stone-700 mb-2">AI Assessment:</h3>
                 {evaluating ? <Loader2 className="animate-spin mx-auto text-stone-400" /> : <p className="text-stone-600 italic">"{evaluation}"</p>}
              </div>

              <p className="text-stone-400 text-sm">Saving results and returning...</p>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-serif font-bold">Tier {tierId} Assessment</h1>
            <button onClick={onCancel} className="text-stone-500 underline">Cancel</button>
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