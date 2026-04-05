import React, { useState, useEffect } from 'react';
import { Puzzle, Loader2, Brain, Trophy, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

interface LogicPuzzlesProps {
  customApiKey?: string;
}

interface PuzzleData {
  type: 'morphology_chain' | 'decoding';
  question: string;
  question_vi: string;
  clues: string[];
  targetWord: string;
  explanation: string;
  explanation_vi: string;
}

export const LogicPuzzles: React.FC<LogicPuzzlesProps> = ({ customApiKey }) => {
  const [loading, setLoading] = useState(false);
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);

  const generatePuzzle = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setUserAnswer('');
    setPuzzle(null);

    try {
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key is missing");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Generate a morphological logic puzzle for an English learner (Vietnamese speaker).
The puzzle should be either a "morphology_chain" (transforming a word by changing affixes) or "decoding" (guessing a word based on its root/affix meanings).

Return a JSON object matching this schema:
{
  "type": "morphology_chain" or "decoding",
  "question": "The puzzle prompt in English",
  "question_vi": "The puzzle prompt in Vietnamese",
  "clues": ["Clue 1", "Clue 2"], // 2-3 clues
  "targetWord": "The exact English word they need to guess",
  "explanation": "Explanation of the morphological breakdown",
  "explanation_vi": "Vietnamese explanation of the breakdown"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              question: { type: Type.STRING },
              question_vi: { type: Type.STRING },
              clues: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              targetWord: { type: Type.STRING },
              explanation: { type: Type.STRING },
              explanation_vi: { type: Type.STRING }
            },
            required: ["type", "question", "question_vi", "clues", "targetWord", "explanation", "explanation_vi"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setPuzzle(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate puzzle. Please check your API key or try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  const checkAnswer = () => {
    if (!puzzle) return;
    
    const isCorrect = userAnswer.trim().toLowerCase() === puzzle.targetWord.toLowerCase();
    setResult(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(s => s + 100);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
              <Brain size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-stone-900">Logic Puzzles</h1>
              <p className="text-stone-500">Become a language detective.</p>
            </div>
          </div>
          <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-stone-200 flex items-center gap-3">
            <Trophy className="text-amber-500" size={24} />
            <span className="text-xl font-bold text-stone-800">{score} XP</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
            <p className="text-stone-500 font-medium">Generating your next case, Detective...</p>
          </div>
        ) : puzzle ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
              {puzzle.type === 'morphology_chain' ? 'Morphology Chain' : 'Code Breaker'}
            </div>
            
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">{puzzle.question}</h2>
            <p className="text-stone-600 mb-8 italic">{puzzle.question_vi}</p>

            <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 mb-8">
              <h3 className="font-bold text-stone-500 uppercase tracking-wider text-sm mb-4">Clues</h3>
              <ul className="space-y-3">
                {puzzle.clues.map((clue, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-stone-700">
                    <span className="bg-purple-200 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      {idx + 1}
                    </span>
                    {clue}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 mb-8">
              <input 
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !result && checkAnswer()}
                disabled={result !== null}
                placeholder="Enter your answer..."
                className="flex-1 px-6 py-4 rounded-xl border border-stone-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-xl shadow-sm transition-all disabled:bg-stone-50 disabled:text-stone-500"
              />
              {!result && (
                <button 
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  Solve
                </button>
              )}
            </div>

            {result && (
              <div className={`p-6 rounded-xl border animate-in zoom-in-95 duration-300 ${result === 'correct' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {result === 'correct' ? (
                    <>
                      <CheckCircle2 className="text-green-600" size={32} />
                      <h3 className="text-2xl font-bold text-green-800">Brilliant!</h3>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={32} />
                      <h3 className="text-2xl font-bold text-red-800">Not quite right.</h3>
                    </>
                  )}
                </div>
                
                {result === 'incorrect' && (
                  <p className="text-red-700 mb-4">The correct word was: <strong className="text-xl">{puzzle.targetWord}</strong></p>
                )}

                <div className="bg-white/60 p-4 rounded-lg">
                  <p className="text-stone-800 mb-2">{puzzle.explanation}</p>
                  <p className="text-stone-600 italic">{puzzle.explanation_vi}</p>
                </div>

                <button 
                  onClick={generatePuzzle}
                  className="mt-6 flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  Next Puzzle <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
