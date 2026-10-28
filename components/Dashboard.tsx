import React, { useState } from 'react';
import { CURRICULUM } from '../constants';
import { AppView, Lesson, UserProgress, AppConfig, User } from '../types';
import { Lock, Unlock, Star, Leaf, ChevronDown, ChevronUp, Book, LogOut, GraduationCap, CheckCircle, Search, Shield, Key, X, Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ProgressChart } from './ProgressChart';
import { LessonsRechartsChart } from './LessonsRechartsChart';
import { DailyStreakWidget } from './DailyStreakWidget';
import { DailyGoalWidget } from './DailyGoalWidget';

interface DashboardProps {
  user: User;
  progress: UserProgress;
  appConfig: AppConfig;
  onSelectLesson: (lesson: Lesson) => void;
  onTakeAssessment: (tierId: number, roots: string[]) => void;
  onUpdateUser: (updates: Partial<User>) => void;
  onNavigateView?: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, progress, appConfig, onSelectLesson, onTakeAssessment, onUpdateUser, onNavigateView }) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [chartEngine, setChartEngine] = useState<'recharts' | 'd3'>('recharts');

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
      if (progress.unlockedTiers?.includes(tierId)) return true;
      
      // Unlock if previous tier assessment passed
      const prevTierAssessment = progress.assessments?.find(a => a.tierId === tierId - 1 && a.passed);
      if (prevTierAssessment) return true;

      // Legacy logic fallback: Check if enough lessons from previous tier are done
      // (Simplified for this version to rely on Assessments mainly for unlocking)
      return false; 
  };

  const hasFeature = (featureId: string) => {
    if (appConfig.baseFeatures?.includes(featureId)) return true;
    if (appConfig.proFeatures?.includes(featureId)) {
      return user.isPro || !!user.customApiKey;
    }
    return false;
  };

  // Adaptive Learning Path Logic
  const getRecommendedLesson = () => {
    for (const tier of CURRICULUM) {
      if (!isTierUnlocked(tier.id)) continue;
      for (const module of tier.modules) {
        for (const lesson of module.lessons) {
          if (!progress.completedLessons?.includes(lesson.id)) {
            return lesson;
          }
        }
      }
    }
    return null;
  };

  const getTopWeakness = () => {
    if (!progress.weaknesses) return null;
    const items = Object.values(progress.weaknesses);
    if (items.length === 0) return null;
    items.sort((a, b) => b.mistakeCount - a.mistakeCount);
    return items[0].mistakeCount > 1 ? items[0] : null; // recommend if made mistake at least twice
  };

  const recommendedLesson = getRecommendedLesson();
  const topWeakness = getTopWeakness();

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Welcome back, {user.username}!</h1>
          <p className="text-stone-500 text-lg">Ready to continue your morphological journey?</p>
        </div>

        {/* Daily Learning Goal Tracker */}
        <DailyGoalWidget
          progress={progress}
          onUpdateProgress={(updated) => onUpdateUser({ progress: updated })}
          onStartLesson={recommendedLesson ? () => onSelectLesson(recommendedLesson) : undefined}
          className="mb-6"
        />

        {/* Daily Streak Counter & Flame Indicator */}
        <DailyStreakWidget
          progress={progress}
          onStartLesson={recommendedLesson ? () => onSelectLesson(recommendedLesson) : undefined}
          className="mb-8"
        />

        {/* Phonics & Syllable Lab Highlight Banner */}
        {onNavigateView && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 mb-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner shrink-0">
                <Volume2 size={32} className="text-amber-100" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-amber-200 mb-1">
                  <Sparkles size={12} /> Chuyên đề trực quan
                </div>
                <h2 className="text-xl md:text-2xl font-serif font-bold">Cách Đọc Chữ Cái, Bảng IPA & Phonics</h2>
                <p className="text-amber-100 text-xs md:text-sm mt-1 max-w-xl">
                  Đọc chuẩn 26 chữ cái với ví dụ minh họa sinh động, tra cứu trọn bộ 44 âm IPA quốc tế & mổ xẻ âm tiết tiếng Anh.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateView(AppView.PHONICS)}
              className="w-full md:w-auto bg-white hover:bg-amber-50 text-stone-900 px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0 group text-sm"
            >
              <span>Khám Phá Ngay</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Adaptive Learning Path Recommendation */}
        {topWeakness ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-red-500 text-white p-4 rounded-xl shadow-inner">
                <Shield size={32} />
              </div>
              <div>
                <p className="text-red-700 font-bold text-sm uppercase tracking-wider mb-1">Học Củng Cố (Remedial Target)</p>
                <h2 className="text-2xl font-serif font-bold text-stone-900">Morpheme: {topWeakness.morpheme}</h2>
                <p className="text-stone-600 truncate max-w-sm">Dữ liệu ghi nhận bạn đã nhầm lẫn hình vị này {topWeakness.mistakeCount} lần.</p>
              </div>
            </div>
            <button 
              onClick={() => onSelectLesson({
                id: `remedial_${topWeakness.morpheme}`,
                title: `Khắc phục: ${topWeakness.morpheme}`,
                root: topWeakness.morpheme,
                meaning: "Luyện tập bổ sung",
                category: "Remedial",
                tier: 0
              })}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md"
            >
              Ôn tập chuyên sâu
            </button>
          </div>
        ) : recommendedLesson && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 text-white p-4 rounded-xl shadow-inner">
                <GraduationCap size={32} />
              </div>
              <div>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-1">Recommended Next Step</p>
                <h2 className="text-2xl font-serif font-bold text-stone-900">{recommendedLesson.title}</h2>
                <p className="text-stone-600">Based on your progress, this is the optimal next root to learn.</p>
              </div>
            </div>
            <button 
              onClick={() => onSelectLesson(recommendedLesson)}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md"
            >
              Start Lesson
            </button>
          </div>
        )}

        {/* Learning Progress Visual Motivation (Recharts Line Chart / D3) */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Theo dõi nhịp độ & động lực học:
            </span>
            <div className="bg-stone-100 p-1 rounded-xl flex items-center text-xs font-bold border border-stone-200">
              <button
                onClick={() => setChartEngine('recharts')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartEngine === 'recharts'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                📈 Recharts (Bài học 30 ngày)
              </button>
              <button
                onClick={() => setChartEngine('d3')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartEngine === 'd3'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                📊 D3.js (Chi tiết XP)
              </button>
            </div>
          </div>

          {chartEngine === 'recharts' ? (
            <LessonsRechartsChart
              progress={progress}
              onStartLesson={recommendedLesson ? () => onSelectLesson(recommendedLesson) : undefined}
            />
          ) : (
            <ProgressChart progress={progress} />
          )}
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