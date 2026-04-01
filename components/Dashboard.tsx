import React, { useState } from 'react';
import { CURRICULUM } from '../constants';
import { Lesson, UserProgress, AppConfig, User } from '../types';
import { Lock, Unlock, Star, Leaf, ChevronDown, ChevronUp, Book, LogOut, GraduationCap, CheckCircle, Search, Shield, Key, X } from 'lucide-react';

interface DashboardProps {
  user: User;
  progress: UserProgress;
  appConfig: AppConfig;
  onSelectLesson: (lesson: Lesson) => void;
  onGoToGarden: () => void;
  onTakeAssessment: (tierId: number, roots: string[]) => void;
  onGoToAnalyzer: () => void;
  onGoToUpgrade: () => void;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<User>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, progress, appConfig, onSelectLesson, onGoToGarden, onTakeAssessment, onGoToAnalyzer, onGoToUpgrade, onLogout, onUpdateUser }) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(user.customApiKey || '');

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSaveApiKey = async () => {
    onUpdateUser({ customApiKey: tempApiKey });
    setShowApiKeyModal(false);
    if (user.uid) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await setDoc(doc(db, 'users', user.uid), { customApiKey: tempApiKey }, { merge: true });
      } catch (e) {
        console.error("Failed to save API key to Firestore", e);
      }
    }
  };

  const isTierUnlocked = (tierId: number) => {
      // Always unlock Tier 1
      if (tierId === 1) return true;
      // Unlock if in unlockedTiers list (from skipping)
      if (progress.unlockedTiers?.includes(tierId)) return true;
      
      // Unlock if previous tier assessment passed
      const prevTierAssessment = progress.assessments?.find(a => a.tierId === tierId - 1 && a.passed);
      if (prevTierAssessment) return true;

      // Legacy logic fallback: Check if enough lessons from previous tier are done
      // (Simplified for this version to rely on Assessments mainly for unlocking)
      return false; 
  };

  const hasFeature = (featureId: string) => {
    if (appConfig.baseFeatures.includes(featureId)) return true;
    if (appConfig.proFeatures.includes(featureId)) {
      return user.isPro || !!user.customApiKey;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowApiKeyModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold font-serif mb-2 flex items-center gap-2">
              <Key className="text-amber-500" />
              Custom API Key
            </h2>
            <p className="text-stone-600 mb-6 text-sm">
              Enter your own Gemini API Key to unlock Pro AI features. Your key is stored securely in your profile.
            </p>
            <input 
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 border border-stone-300 rounded-xl mb-6 font-mono text-sm"
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="flex-1 py-3 font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveApiKey}
                className="flex-1 py-3 font-bold bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-xl transition-colors"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-serif font-bold text-stone-900">Morphology Master</h1>
                <span className="text-stone-400 text-sm font-mono px-2 py-1 bg-stone-100 rounded">v2.0</span>
                {user.isPro && (
                  <span className="flex items-center gap-1 text-amber-600 text-sm font-bold px-2 py-1 bg-amber-100 rounded-full">
                    <Shield size={14} /> PRO
                  </span>
                )}
            </div>
            <p className="text-stone-500 text-lg">Welcome back, <span className="font-bold text-stone-800">{user.username}</span>.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
             {!user.isPro && (
               <button 
                  onClick={onGoToUpgrade}
                  className="bg-amber-100 hover:bg-amber-200 border border-amber-300 px-6 py-3 rounded-xl flex items-center gap-4 transition-all flex-1 md:flex-none"
              >
                  <div className="text-right">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">Upgrade</p>
                  <p className="text-amber-900 font-bold">Get Pro</p>
                  </div>
                  <Star className="text-amber-600" size={28} />
              </button>
             )}

             {hasFeature('morphology_analyzer') && (
               <button 
                  onClick={() => onGoToAnalyzer()}
                  className="bg-blue-100 hover:bg-blue-200 border border-blue-300 px-6 py-3 rounded-xl flex items-center gap-4 transition-all flex-1 md:flex-none"
              >
                  <div className="text-right">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Analyzer</p>
                  <p className="text-blue-900 font-bold">Word Lab</p>
                  </div>
                  <Search className="text-blue-600" size={28} />
              </button>
             )}

             {hasFeature('word_garden') && (
               <div 
                  onClick={onGoToGarden}
                  className="cursor-pointer bg-green-100 hover:bg-green-200 border border-green-300 px-6 py-3 rounded-xl flex items-center gap-4 transition-all flex-1 md:flex-none"
              >
                  <div className="text-right">
                  <p className="text-xs font-bold text-green-800 uppercase tracking-widest">Garden</p>
                  <p className="text-green-900 font-bold">{progress.garden.trees} Plants</p>
                  </div>
                  <Leaf className="text-green-600" size={28} />
              </div>
             )}

            <button 
                onClick={() => setShowApiKeyModal(true)}
                className="bg-stone-200 hover:bg-stone-300 p-3 rounded-xl transition-colors"
                title="Custom API Key"
            >
                <Key size={24} className={user.customApiKey ? "text-amber-600" : "text-stone-600"} />
            </button>

            <button 
                onClick={onLogout}
                className="bg-stone-200 hover:bg-stone-300 p-3 rounded-xl transition-colors"
                title="Logout"
            >
                <LogOut size={24} className="text-stone-600" />
            </button>
          </div>
        </div>

        {/* Curriculum List */}
        <div className="space-y-16">
          {CURRICULUM.map((tier) => {
            const unlocked = isTierUnlocked(tier.id);
            const passedAssessment = progress.assessments?.find(a => a.tierId === tier.id && a.passed);
            // Gather all roots for this tier for assessment generation
            const tierRoots = tier.modules.flatMap(m => m.lessons.map(l => l.root));

            return (
                <div key={tier.id} className={`relative ${!unlocked ? 'opacity-60 grayscale' : ''}`}>
                <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-4">
                    <div className="flex items-center gap-4">
                        <span className={`text-stone-50 text-xs font-bold px-3 py-1 rounded-full ${unlocked ? 'bg-stone-900' : 'bg-stone-400'}`}>TIER {tier.id}</span>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-stone-800">{tier.title.split(":")[1]}</h2>
                            <p className="text-stone-500 text-sm">{tier.description}</p>
                        </div>
                    </div>
                    
                    {/* Tier Assessment / Skip Button */}
                    <div>
                        {passedAssessment ? (
                            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg">
                                <CheckCircle size={20} /> Tier Mastered
                            </div>
                        ) : (
                            hasFeature('tier_assessments') && (
                              <button 
                                  onClick={() => onTakeAssessment(tier.id, tierRoots)}
                                  className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                              >
                                  <GraduationCap size={18} />
                                  {unlocked ? "Take Final Exam" : "Skip to this Tier"}
                              </button>
                            )
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tier.modules.map((module) => {
                    const isExpanded = expandedModules[module.id] || false;
                    const shouldExpand = (tier.id === 1 && module.id === "m1_neg") ? true : isExpanded; 

                    return (
                        <div key={module.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden self-start">
                        <div 
                            onClick={() => unlocked && toggleModule(module.id)}
                            className={`p-6 cursor-pointer transition-colors flex justify-between items-center ${unlocked ? 'hover:bg-stone-50' : 'cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                                    <Book size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-stone-800">{module.title}</h3>
                                    <p className="text-xs text-stone-500">{module.lessons.length} Lessons</p>
                                </div>
                            </div>
                            {shouldExpand ? <ChevronUp size={20} className="text-stone-400"/> : <ChevronDown size={20} className="text-stone-400"/>}
                        </div>
                        
                        {(shouldExpand || (tier.id === 1 && module.id === "m1_neg")) && unlocked && (
                            <div className="border-t border-stone-100 bg-stone-50/50 p-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {module.lessons.map((lesson) => {
                                const isCompleted = progress.completedLessons?.includes(lesson.id) || passedAssessment; // Assessment passes all lessons
                                
                                return (
                                <button
                                    key={lesson.id}
                                    onClick={() => onSelectLesson(lesson)}
                                    className={`
                                    w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all
                                    bg-white hover:bg-white hover:shadow-md border-transparent hover:border-orange-200
                                    ${isCompleted ? 'bg-green-50 border-green-100' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                    {isCompleted ? <Star size={14} className="text-green-500 fill-current" /> : <Unlock size={14} className="text-orange-500" />}
                                    <div>
                                        <span className="font-bold block text-sm text-stone-800">{lesson.root}</span>
                                        <span className="text-xs text-stone-500">{lesson.meaning || "..."}</span>
                                    </div>
                                    </div>
                                    {isCompleted && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">DONE</span>}
                                </button>
                                );
                            })}
                            </div>
                        )}
                        </div>
                    );
                    })}
                </div>
                </div>
            );
        })}
        </div>
      </div>
    </div>
  );
};