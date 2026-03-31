import React, { useState, useEffect } from 'react';
import { AppView, Lesson, User, TierAssessmentResult } from './types';
import { logoutUser, saveUserProgress } from './services/authService';
import { Dashboard } from './components/Dashboard';
import { LessonFlow } from './components/LessonFlow';
import { WordGarden } from './components/WordGarden';
import { LoginScreen } from './components/LoginScreen';
import { TierAssessment } from './components/TierAssessment';
import { MorphologyAnalyzer } from './components/MorphologyAnalyzer';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { INITIAL_USER_PROGRESS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<{tierId: number, roots: string[]} | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        let progress = { ...INITIAL_USER_PROGRESS };
        if (userDoc.exists()) {
          progress = userDoc.data().progress;
        }
        setUser({ username: firebaseUser.displayName || firebaseUser.email || 'Learner', progress, uid: firebaseUser.uid });
        setView(AppView.DASHBOARD);
      } else {
        setUser(null);
        setView(AppView.LOGIN);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (loggedInUser: User) => {
      setUser(loggedInUser);
      setView(AppView.DASHBOARD);
  };

  const handleLogout = async () => {
      await logoutUser();
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
        saveUserProgress(user.uid!, newProgress);
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

      saveUserProgress(user.uid!, newProgress);
      setUser({ ...user, progress: newProgress });

      // Return to dashboard after short delay or button press (handled in component)
      setTimeout(() => setView(AppView.DASHBOARD), 2000);
  };

  // --- RENDER VIEWS ---

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading...</div>;
  }

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

  if (view === AppView.ANALYZER) {
      return <MorphologyAnalyzer onBack={() => setView(AppView.DASHBOARD)} />;
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
          onGoToAnalyzer={() => setView(AppView.ANALYZER)}
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