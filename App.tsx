import React, { useState, useEffect } from 'react';
import { AppView, Lesson, User, TierAssessmentResult } from './types';
import { logoutUser, saveUserProgress } from './services/authService';
import { Dashboard } from './components/Dashboard';
import { LessonFlow } from './components/LessonFlow';
import { WordGarden } from './components/WordGarden';
import { LoginScreen } from './components/LoginScreen';
import { TierAssessment } from './components/TierAssessment';
import { MorphologyAnalyzer } from './components/MorphologyAnalyzer';
import { UpgradePage } from './components/UpgradePage';
import { AdminPage } from './components/AdminPage';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { INITIAL_USER_PROGRESS } from './constants';
import { AppConfig } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<{tierId: number, roots: string[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [appConfig, setAppConfig] = useState<AppConfig>({
    baseFeatures: ['tier_assessments', 'word_garden'],
    proFeatures: ['morphology_analyzer', 'ai_lesson_generation', 'text_to_speech']
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'features');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAppConfig(docSnap.data() as AppConfig);
        } else {
          await setDoc(docRef, appConfig);
        }
      } catch (e) {
        console.error("Failed to load config", e);
      }
    };
    fetchConfig();
  }, []);

  // Check for existing session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        let progress = { ...INITIAL_USER_PROGRESS };
        let isPro = false;
        let proExpiresAt: string | undefined;
        let customApiKey: string | undefined;

        if (userDoc.exists()) {
          const data = userDoc.data();
          progress = { ...INITIAL_USER_PROGRESS, ...data.progress };
          isPro = data.isPro || false;
          proExpiresAt = data.proExpiresAt;
          customApiKey = data.customApiKey;

          if (isPro && proExpiresAt) {
            if (new Date(proExpiresAt) < new Date()) {
              isPro = false;
              await setDoc(userDocRef, { isPro: false }, { merge: true });
            }
          }
        }
        setUser({ 
          username: firebaseUser.displayName || firebaseUser.email || 'Learner', 
          progress, 
          uid: firebaseUser.uid,
          isPro,
          proExpiresAt,
          customApiKey,
          email: firebaseUser.email || undefined
        });
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

  const handleUpdateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setView(AppView.LESSON);
  };

  const handleLessonComplete = () => {
    if (!activeLesson || !user) return;
    
    const newProgress = { ...user.progress };
    
    // Logic: Only add XP/Tree if lesson wasn't done before
    if (!newProgress.completedLessons?.includes(activeLesson.id)) {
        newProgress.completedLessons = newProgress.completedLessons || [];
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
      newProgress.assessments = newProgress.assessments || [];
      newProgress.assessments.push(result);

      if (result.passed) {
          // Unlock next tier if not already unlocked
          const nextTier = result.tierId + 1;
          newProgress.unlockedTiers = newProgress.unlockedTiers || [];
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

  if (window.location.pathname === '/ad-min') {
    return <AdminPage />;
  }

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading...</div>;
  }

  if (view === AppView.LOGIN || !user) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  if (view === AppView.UPGRADE && user) {
      return (
          <UpgradePage 
              user={user} 
              onBack={() => setView(AppView.DASHBOARD)} 
              onUpgradeSuccess={() => setUser({ ...user, isPro: true })} 
          />
      );
  }

  if (view === AppView.ASSESSMENT && activeAssessment) {
      return (
          <div className="min-h-screen bg-stone-50 p-6">
            <TierAssessment 
                tierId={activeAssessment.tierId}
                roots={activeAssessment.roots}
                isPro={user?.isPro || false}
                customApiKey={user?.customApiKey}
                onComplete={handleAssessmentComplete}
                onCancel={() => setView(AppView.DASHBOARD)}
            />
          </div>
      );
  }

  if (view === AppView.ANALYZER) {
      return <MorphologyAnalyzer onBack={() => setView(AppView.DASHBOARD)} customApiKey={user?.customApiKey} />;
  }

  return (
    <div className="antialiased text-stone-900">
      {view === AppView.DASHBOARD && (
        <Dashboard 
          user={user}
          onUpdateUser={handleUpdateUser}
          progress={user.progress} 
          appConfig={appConfig}
          onSelectLesson={handleLessonSelect} 
          onGoToGarden={() => setView(AppView.GARDEN)} 
          onTakeAssessment={handleTakeAssessment}
          onGoToAnalyzer={() => setView(AppView.ANALYZER)}
          onGoToUpgrade={() => setView(AppView.UPGRADE)}
          onLogout={handleLogout}
        />
      )}

      {view === AppView.LESSON && activeLesson && (
        <LessonFlow 
          lesson={activeLesson} 
          customApiKey={user?.customApiKey}
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