import React, { useState } from 'react';
import { CURRICULUM } from '../constants';
import { Lesson, UserProgress } from '../types';
import { Lock, Unlock, Star, Leaf, ChevronDown, ChevronUp, Book, LogOut, GraduationCap, CheckCircle } from 'lucide-react';

interface DashboardProps {
  user: { username: string };
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onGoToGarden: () => void;
  onTakeAssessment: (tierId: number, roots: string[]) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, progress, onSelectLesson, onGoToGarden, onTakeAssessment, onLogout }) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const isTierUnlocked = (tierId: number) => {
      // Always unlock Tier 1
      if (tierId === 1) return true;
      // Unlock if in unlockedTiers list (from skipping)
      if (progress.unlockedTiers.includes(tierId)) return true;
      
      // Unlock if previous tier assessment passed
      const prevTierAssessment = progress.assessments.find(a => a.tierId === tierId - 1 && a.passed);
      if (prevTierAssessment) return true;

      // Legacy logic fallback: Check if enough lessons from previous tier are done
      // (Simplified for this version to rely on Assessments mainly for unlocking)
      return false; 
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-serif font-bold text-stone-900">Morphology Master</h1>
                <span className="text-stone-400 text-sm font-mono px-2 py-1 bg-stone-100 rounded">v2.0</span>
            </div>
            <p className="text-stone-500 text-lg">Welcome back, <span className="font-bold text-stone-800">{user.username}</span>.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
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
            const passedAssessment = progress.assessments.find(a => a.tierId === tier.id && a.passed);
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
                            <button 
                                onClick={() => onTakeAssessment(tier.id, tierRoots)}
                                className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                            >
                                <GraduationCap size={18} />
                                {unlocked ? "Take Final Exam" : "Skip to this Tier"}
                            </button>
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
                                const isCompleted = progress.completedLessons.includes(lesson.id) || passedAssessment; // Assessment passes all lessons
                                
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