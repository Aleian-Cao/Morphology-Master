import React, { useState, useEffect } from 'react';
import { AppView, Lesson, User, TierAssessmentResult } from './types';
import { getCurrentUser, logoutUser, saveUserProgress } from './services/authService';
import { Dashboard } from './components/Dashboard';
import { LessonFlow } from './components/LessonFlow';
import { WordGarden } from './components/WordGarden';
import { LoginScreen } from './components/LoginScreen';
import { TierAssessment } from './components/TierAssessment';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<{tierId: number, roots: string[]} | null>(null);

  // Check for existing session
  useEffect(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
        setUser(sessionUser);
        setView(AppView.DASHBOARD);
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
      setUser(loggedInUser);
      setView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
      logoutUser();
      setUser(null);
      setView(AppView.LOGIN);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setView(AppView.LESSON);
  };

  const handleLessonComplete = () => {
    if (!activeLesson || !user) return;
    
    const newProgress = { ...user.progress };
    
    // Logic: Only add XP/Tree if lesson wasn't done before
    if (!newProgress.completedLessons.includes(activeLesson.id)) {
        newProgress.completedLessons.push(activeLesson.id);
        newProgress.xp += 100;
        newProgress.garden.trees += 1;
        
        // Save to DB
        saveUserProgress(user.username, newProgress);
        setUser({ ...user, progress: newProgress });
    }

    // Go to Garden to celebrate
    setTimeout(() => {
        setView(AppView.GARDEN);
    }, 500);
  };

  const handleTakeAssessment = (tierId: number, roots: string[]) => {
      setActiveAssessment({ tierId, roots });
      setView(AppView.ASSESSMENT);
  };

  const handleAssessmentComplete = (result: TierAssessmentResult) => {
      if (!user) return;

      const newProgress = { ...user.progress };
      
      // Add result history
      newProgress.assessments.push(result);

      if (result.passed) {
          // Unlock next tier if not already unlocked
          const nextTier = result.tierId + 1;
          if (!newProgress.unlockedTiers.includes(nextTier)) {
              newProgress.unlockedTiers.push(nextTier);
          }
          // Also make sure current tier is unlocked (for skipping scenario)
          if (!newProgress.unlockedTiers.includes(result.tierId)) {
              newProgress.unlockedTiers.push(result.tierId);
          }
          newProgress.xp += 500; // Big bonus
      }

      saveUserProgress(user.username, newProgress);
      setUser({ ...user, progress: newProgress });

      // Return to dashboard after short delay or button press (handled in component)
      setTimeout(() => setView(AppView.DASHBOARD), 2000);
  };

  // --- RENDER VIEWS ---

  if (view === AppView.LOGIN || !user) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  if (view === AppView.ASSESSMENT && activeAssessment) {
      return (
          <div className="min-h-screen bg-stone-50 p-6">
            <TierAssessment 
                tierId={activeAssessment.tierId}
                roots={activeAssessment.roots}
                onComplete={handleAssessmentComplete}
                onCancel={() => setView(AppView.DASHBOARD)}
            />
          </div>
      );
  }

  return (
    <div className="antialiased text-stone-900">
      {view === AppView.DASHBOARD && (
        <Dashboard 
          user={user}
          progress={user.progress} 
          onSelectLesson={handleLessonSelect} 
          onGoToGarden={() => setView(AppView.GARDEN)} 
          onTakeAssessment={handleTakeAssessment}
          onLogout={handleLogout}
        />
      )}

      {view === AppView.LESSON && activeLesson && (
        <LessonFlow 
          lesson={activeLesson} 
          onComplete={handleLessonComplete} 
          onExit={() => setView(AppView.DASHBOARD)} 
        />
      )}

      {view === AppView.GARDEN && (
        <WordGarden 
          progress={user.progress} 
          onBack={() => setView(AppView.DASHBOARD)} 
        />
      )}
    </div>
  );
};

export default App;