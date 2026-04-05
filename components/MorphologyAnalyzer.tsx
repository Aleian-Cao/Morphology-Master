import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Save, Trash2, Loader2, BookOpen, Volume2 } from 'lucide-react';
import { MorphologyAnalysis } from '../types';
import { analyzeMorphology } from '../services/geminiService';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';

interface MorphologyAnalyzerProps {
  customApiKey?: string;
}

export const MorphologyAnalyzer: React.FC<MorphologyAnalyzerProps> = ({ customApiKey }) => {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MorphologyAnalysis | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<(MorphologyAnalysis & { id: string })[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!auth.currentUser) {
      setLoadingHistory(false);
      return;
    }
    
    try {
      const q = query(
        collection(db, 'analyses'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const history: any[] = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      setSavedAnalyses(history);
    } catch (error) {
      console.error("Error fetching history: ", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAnalyze = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const analysis = await analyzeMorphology(word.trim(), customApiKey);
      if (analysis) {
        setResult(analysis);
      } else {
        alert("Failed to analyze the word. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !auth.currentUser) return;
    
    try {
      const docRef = await addDoc(collection(db, 'analyses'), {
        ...result,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });
      setSavedAnalyses([{ id: docRef.id, ...result }, ...savedAnalyses]);
      alert("Analysis saved successfully!");
    } catch (error) {
      console.error("Error saving analysis: ", error);
      alert("Failed to save analysis.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'analyses', id));
      setSavedAnalyses(savedAnalyses.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting analysis: ", error);
      alert("Failed to delete analysis.");
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderAnalysis = (analysis: MorphologyAnalysis, isSaved = false) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mt-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-serif font-bold text-stone-900">{analysis.word}</h2>
            <button 
              onClick={() => handleSpeak(analysis.word)}
              className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Listen to pronunciation"
            >
              <Volume2 size={24} />
            </button>
          </div>
          <p className="text-stone-500 font-mono text-lg">{analysis.phonetic}</p>
        </div>
        {!isSaved && (
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Save size={18} /> Save
          </button>
        )}
      </div>
      
      <p className="text-xl text-stone-800 mb-6 pb-4 border-b border-stone-100">
        <span className="font-bold text-stone-500 text-sm uppercase tracking-wider block mb-1">Meaning</span>
        {analysis.meaning_vi}
      </p>

      {analysis.explanation_vi && (
        <div className="mb-6 pb-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-500 text-sm uppercase tracking-wider mb-2">Giải thích (Explanation)</h3>
          <p className="text-stone-700 italic">{analysis.explanation_vi}</p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-bold text-stone-500 text-sm uppercase tracking-wider mb-3">Morphology Breakdown</h3>
        <div className="space-y-3">
          {analysis.parts?.map((part, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                part.type === 'PREFIX' ? 'bg-blue-100 text-blue-800' :
                part.type === 'ROOT' ? 'bg-orange-100 text-orange-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {part.type}
              </span>
              <span className="font-bold text-lg text-stone-800">{part.text}</span>
              <span className="text-stone-600 md:ml-auto">{part.meaning}</span>
              <span className="text-stone-500 italic">({part.meaning_vi})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-stone-500 text-sm uppercase tracking-wider mb-3">Synonyms</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.synonyms?.map((syn, idx) => (
              <span key={idx} className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-sm">
                {syn}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-stone-500 text-sm uppercase tracking-wider mb-3">Morphological Relatives</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.morphologicalRelatives?.map((rel, idx) => (
              <span key={idx} className="bg-orange-50 text-orange-800 border border-orange-100 px-3 py-1 rounded-full text-sm">
                {rel}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Morphology Analyzer</h1>
            <p className="text-stone-500">Analyze any English word to understand its roots, prefixes, and suffixes.</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Enter an English word (e.g., 'unbelievable', 'democracy')"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading || !word.trim()}
            className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
          </button>
        </div>

        {/* Current Result */}
        {result && renderAnalysis(result)}

        {/* History */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Saved Analyses</h2>
          {loadingHistory ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-stone-400" size={32} />
            </div>
          ) : savedAnalyses.length === 0 ? (
            <div className="text-center p-12 bg-stone-100 rounded-xl border border-stone-200 border-dashed">
              <p className="text-stone-500">No saved analyses yet. Search for a word and save it!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {savedAnalyses.map((analysis) => (
                <div key={analysis.id} className="relative group">
                  {renderAnalysis(analysis, true)}
                  <button 
                    onClick={() => handleDelete(analysis.id)}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete saved analysis"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
