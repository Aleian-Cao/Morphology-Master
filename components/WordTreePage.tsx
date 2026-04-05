import React, { useState } from 'react';
import { Search, Loader2, Network, Puzzle, Languages, Check, X } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

interface WordTreePageProps {
  customApiKey?: string;
}

interface WordTreeData {
  root: string;
  meaning_en: string;
  meaning_vi: string;
  sino_vietnamese_cognate: string;
  sino_vietnamese_explanation: string;
  prefixes: { text: string; meaning_vi: string }[];
  suffixes: { text: string; meaning_vi: string }[];
  validWords: {
    word: string;
    prefix: string | null;
    suffix: string | null;
    meaning_vi: string;
    formula: string;
  }[];
}

export const WordTreePage: React.FC<WordTreePageProps> = ({ customApiKey }) => {
  const [rootInput, setRootInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<WordTreeData | null>(null);
  const [error, setError] = useState('');

  // Builder State
  const [selectedPrefix, setSelectedPrefix] = useState<string | null>(null);
  const [selectedSuffix, setSelectedSuffix] = useState<string | null>(null);
  const [builderResult, setBuilderResult] = useState<{ valid: boolean; wordData?: any } | null>(null);

  const handleAnalyze = async () => {
    if (!rootInput.trim()) return;
    setLoading(true);
    setError('');
    setTreeData(null);
    setBuilderResult(null);
    setSelectedPrefix(null);
    setSelectedSuffix(null);

    try {
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key is missing");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze the English morphological root "${rootInput.trim()}".
Provide a comprehensive word family matrix and bilingual cognate mapping.

Return a JSON object matching this schema:
{
  "root": "the root itself (e.g., spect)",
  "meaning_en": "English meaning of the root",
  "meaning_vi": "Vietnamese meaning of the root",
  "sino_vietnamese_cognate": "Sino-Vietnamese equivalent roots (e.g., 'Khán', 'Thị', 'Quan')",
  "sino_vietnamese_explanation": "Brief explanation of how the Sino-Vietnamese root maps to the English root's logic",
  "prefixes": [{"text": "prefix", "meaning_vi": "meaning"}], // List common prefixes used with this root
  "suffixes": [{"text": "suffix", "meaning_vi": "meaning"}], // List common suffixes used with this root
  "validWords": [
    {
      "word": "full word (e.g., inspect)",
      "prefix": "prefix used or null",
      "suffix": "suffix used or null",
      "meaning_vi": "Vietnamese meaning of the full word",
      "formula": "e.g., in (vào) + spect (nhìn) = nhìn vào, kiểm tra"
    }
  ]
}
Include at least 6-10 valid words in the validWords array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              root: { type: Type.STRING },
              meaning_en: { type: Type.STRING },
              meaning_vi: { type: Type.STRING },
              sino_vietnamese_cognate: { type: Type.STRING },
              sino_vietnamese_explanation: { type: Type.STRING },
              prefixes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    meaning_vi: { type: Type.STRING }
                  }
                }
              },
              suffixes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    meaning_vi: { type: Type.STRING }
                  }
                }
              },
              validWords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    prefix: { type: Type.STRING, nullable: true },
                    suffix: { type: Type.STRING, nullable: true },
                    meaning_vi: { type: Type.STRING },
                    formula: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["root", "meaning_en", "meaning_vi", "sino_vietnamese_cognate", "sino_vietnamese_explanation", "prefixes", "suffixes", "validWords"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setTreeData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate word tree. Please try another root or check your API key.');
    }
    setLoading(false);
  };

  const handleCombine = () => {
    if (!treeData) return;
    
    // Find if this combination exists
    const match = treeData.validWords.find(w => {
      const pMatch = (w.prefix || null) === selectedPrefix;
      const sMatch = (w.suffix || null) === selectedSuffix;
      return pMatch && sMatch;
    });

    if (match) {
      setBuilderResult({ valid: true, wordData: match });
    } else {
      setBuilderResult({ valid: false });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <Network size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Word Tree & Matrix</h1>
            <p className="text-stone-500">Explore word families, build words, and map to Sino-Vietnamese roots.</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text"
              value={rootInput}
              onChange={(e) => setRootInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Enter a root (e.g., 'spect', 'dict', 'port')"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-lg shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading || !rootInput.trim()}
            className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generate Tree'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100">
            {error}
          </div>
        )}

        {treeData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Bilingual Cognate Mapping */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <div className="flex items-center gap-2 mb-4 text-emerald-600">
                <Languages size={24} />
                <h2 className="text-xl font-bold font-serif text-stone-900">Bilingual Cognate Mapping</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <p className="text-sm text-stone-500 uppercase tracking-wider font-bold mb-1">English Root</p>
                  <p className="text-3xl font-serif font-bold text-stone-900 mb-2">{treeData.root}</p>
                  <p className="text-stone-700">{treeData.meaning_en} / {treeData.meaning_vi}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-sm text-emerald-600/80 uppercase tracking-wider font-bold mb-1">Âm Hán Việt Tương Đương</p>
                  <p className="text-3xl font-serif font-bold text-emerald-900 mb-2">{treeData.sino_vietnamese_cognate}</p>
                  <p className="text-emerald-800">{treeData.sino_vietnamese_explanation}</p>
                </div>
              </div>
            </div>

            {/* Word Builder (Matrix) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <div className="flex items-center gap-2 mb-6 text-blue-600">
                <Puzzle size={24} />
                <h2 className="text-xl font-bold font-serif text-stone-900">Word Matrix Builder</h2>
              </div>
              <p className="text-stone-600 mb-8">Select a prefix and/or suffix to combine with the root and see if it forms a valid word.</p>

              <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 mb-8">
                {/* Prefixes */}
                <div className="flex-1 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h3 className="font-bold text-stone-500 text-sm uppercase tracking-wider mb-4 text-center">Prefixes</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setSelectedPrefix(null)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPrefix === null ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                    >
                      (None)
                    </button>
                    {treeData.prefixes.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPrefix(p.text)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPrefix === p.text ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-stone-200 text-stone-600 hover:bg-blue-50'}`}
                        title={p.meaning_vi}
                      >
                        {p.text}-
                      </button>
                    ))}
                  </div>
                </div>

                {/* Root */}
                <div className="flex items-center justify-center px-6 py-4 bg-emerald-100 rounded-xl border border-emerald-200 shadow-inner">
                  <span className="text-2xl font-serif font-bold text-emerald-800">{treeData.root}</span>
                </div>

                {/* Suffixes */}
                <div className="flex-1 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <h3 className="font-bold text-stone-500 text-sm uppercase tracking-wider mb-4 text-center">Suffixes</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setSelectedSuffix(null)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSuffix === null ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                    >
                      (None)
                    </button>
                    {treeData.suffixes.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSuffix(s.text)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSuffix === s.text ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-stone-200 text-stone-600 hover:bg-purple-50'}`}
                        title={s.meaning_vi}
                      >
                        -{s.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <button 
                  onClick={handleCombine}
                  className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg"
                >
                  Combine & Test
                </button>
              </div>

              {/* Builder Result */}
              {builderResult && (
                <div className={`p-6 rounded-xl border ${builderResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-in zoom-in-95 duration-300`}>
                  {builderResult.valid ? (
                    <div>
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <Check size={24} />
                        <h3 className="text-xl font-bold">Valid Word!</h3>
                      </div>
                      <p className="text-4xl font-serif font-bold text-stone-900 mb-4">{builderResult.wordData.word}</p>
                      <div className="space-y-2">
                        <p className="text-stone-700"><span className="font-bold">Meaning:</span> {builderResult.wordData.meaning_vi}</p>
                        <p className="text-stone-700"><span className="font-bold">Formula:</span> {builderResult.wordData.formula}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700">
                      <X size={24} />
                      <h3 className="text-xl font-bold">Invalid Combination</h3>
                      <p className="ml-2 text-red-600">This combination doesn't form a common English word.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Valid Words List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h2 className="text-xl font-bold font-serif text-stone-900 mb-6">Word Family Network</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {treeData.validWords.map((w, i) => (
                  <div key={i} className="p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-emerald-200 transition-colors">
                    <p className="text-xl font-serif font-bold text-stone-900 mb-1">{w.word}</p>
                    <p className="text-stone-600 text-sm mb-2">{w.meaning_vi}</p>
                    <p className="text-xs font-mono text-stone-500 bg-stone-200/50 inline-block px-2 py-1 rounded">{w.formula}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
