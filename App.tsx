import React, { useState, useEffect } from "react";
import { AppView, Lesson, User, TierAssessmentResult } from "./types";
import { logoutUser, saveUserProgress } from "./services/authService";
import { Dashboard } from "./components/Dashboard";
import { LessonFlow } from "./components/LessonFlow";
import { WordGarden } from "./components/WordGarden";
import { LoginScreen } from "./components/LoginScreen";
import { TierAssessment } from "./components/TierAssessment";
import { MorphologyAnalyzer } from "./components/MorphologyAnalyzer";
import { WordTreePage } from "./components/WordTreePage";
import { LogicPuzzles } from "./components/LogicPuzzles";
import { ProfilePage } from "./components/ProfilePage";
import { UpgradePage } from "./components/UpgradePage";
import { AdminPage } from "./components/AdminPage";
import { Flashcards } from "./components/Flashcards";
import { ReviewPage } from "./components/ReviewPage";
import { ProfessionalTutor } from "./components/ProfessionalTutor";
import { Layout } from "./components/Layout";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { INITIAL_USER_PROGRESS } from "./constants";
import { AppConfig, PartType } from "./types";
import { Key, X } from "lucide-react";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<{
    tierId: number;
    roots: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [appConfig, setAppConfig] = useState<AppConfig>({
    baseFeatures: ["tier_assessments", "word_garden"],
    proFeatures: [
      "morphology_analyzer",
      "ai_lesson_generation",
      "text_to_speech",
    ],
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "config", "features");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AppConfig;
          setAppConfig({
            baseFeatures: data.baseFeatures || [],
            proFeatures: data.proFeatures || [],
          });
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
        const userDocRef = doc(db, "users", firebaseUser.uid);
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
          username: firebaseUser.displayName || firebaseUser.email || "Learner",
          progress,
          uid: firebaseUser.uid,
          isPro,
          proExpiresAt,
          customApiKey,
          email: firebaseUser.email || undefined,
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

  const handleSaveApiKey = async () => {
    if (!user) return;
    handleUpdateUser({ customApiKey: tempApiKey });
    setShowApiKeyModal(false);
    if (user.uid) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { customApiKey: tempApiKey },
          { merge: true },
        );
      } catch (e) {
        console.error("Failed to save API key to Firestore", e);
      }
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setView(AppView.LESSON);
  };

  const checkAchievements = (progress: any) => {
    const newAchievements = progress.achievements ? [...progress.achievements] : [];
    let updated = false;

    const addAchievement = (id: string, title: string, description: string, icon: string) => {
      if (!newAchievements.find(a => a.id === id)) {
        newAchievements.push({
          id,
          title,
          description,
          icon,
          unlockedAt: new Date().toISOString()
        });
        updated = true;
        // Could add a toast notification here
      }
    };

    // Check conditions
    if (progress.completedLessons?.length >= 1) {
      addAchievement('first_lesson', 'First Steps', 'Complete your first lesson', '🌱');
    }
    if (progress.completedLessons?.length >= 10) {
      addAchievement('ten_lessons', 'Dedicated Learner', 'Complete 10 lessons', '🌿');
    }
    if (progress.unlockedTiers?.includes(2)) {
      addAchievement('tier_2', 'Moving Up', 'Unlock Tier 2', '🚀');
    }
    if (progress.assessments?.some((a: any) => a.score === 100)) {
      addAchievement('perfect_score', 'Perfectionist', 'Get a 100% score on an assessment', '⭐');
    }
    if (progress.xp >= 1000) {
      addAchievement('1k_xp', 'XP Hoarder', 'Earn 1000 XP', '💎');
    }

    if (updated) {
      progress.achievements = newAchievements;
    }
    return updated;
  };

  const handleLessonComplete = () => {
    if (!activeLesson || !user) return;

    const newProgress = { ...user.progress };

    // Register root to SRS if not already present
    if (!newProgress.srs) newProgress.srs = {};
    const srsKey = activeLesson.root;
    if (!newProgress.srs[srsKey]) {
      newProgress.srs[srsKey] = {
        morpheme: activeLesson.root,
        meaning_vi: activeLesson.meaning_vi || activeLesson.meaning || "",
        type: PartType.ROOT,
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }

    // Logic: Only add XP/Tree if lesson wasn't done before
    if (!newProgress.completedLessons?.includes(activeLesson.id)) {
      newProgress.completedLessons = newProgress.completedLessons || [];
      newProgress.completedLessons.push(activeLesson.id);
      newProgress.xp += 100;
      newProgress.garden.trees += 1;

      // If it's a remedial lesson, clear the weakness
      if (activeLesson.id.startsWith('remedial_') && newProgress.weaknesses && newProgress.weaknesses[activeLesson.root]) {
         newProgress.weaknesses[activeLesson.root].mistakeCount = 0;
         newProgress.xp += 150; // Extra reward for fixing a weakness
      }

      checkAchievements(newProgress);

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

    if (result.missedMorphemes && result.missedMorphemes.length > 0) {
      if (!newProgress.weaknesses) newProgress.weaknesses = {};
      result.missedMorphemes.forEach(m => {
        if (!newProgress.weaknesses![m]) {
          newProgress.weaknesses![m] = {
            morpheme: m,
            type: PartType.ROOT, // defaults to root for now
            mistakeCount: 1,
            lastMistakeDate: new Date().toISOString()
          };
        } else {
          newProgress.weaknesses![m].mistakeCount++;
          newProgress.weaknesses![m].lastMistakeDate = new Date().toISOString();
        }
        
        // Also update SRS if it exists: lower the interval to enforce review soon
        if (newProgress.srs && newProgress.srs[m]) {
           newProgress.srs[m].interval = 1;
           newProgress.srs[m].repetitions = 0;
           newProgress.srs[m].easinessFactor = Math.max(1.3, newProgress.srs[m].easinessFactor - 0.2);
           newProgress.srs[m].nextReviewDate = new Date().toISOString(); // Due immediately
        }
      });
    }

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

    checkAchievements(newProgress);

    saveUserProgress(user.uid!, newProgress);
    setUser({ ...user, progress: newProgress });

    // Return to dashboard after short delay or button press (handled in component)
    setTimeout(() => setView(AppView.DASHBOARD), 2000);
  };

  // --- RENDER VIEWS ---

  if (window.location.pathname === "/ad-min") {
    return <AdminPage />;
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-stone-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (view === AppView.LOGIN || !user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (view === AppView.UPGRADE && user) {
    return (
      <div className="h-[100dvh] flex flex-col bg-stone-50">
        <div className="flex-1 overflow-y-auto">
          <UpgradePage
            user={user}
            onUpgradeSuccess={() => {
              setUser({ ...user, isPro: true });
              setView(AppView.DASHBOARD);
            }}
          />
        </div>
      </div>
    );
  }

  if (view === AppView.ASSESSMENT && activeAssessment) {
    return (
      <div className="h-[100dvh] flex flex-col bg-stone-50">
        <div className="flex-1 overflow-y-auto">
          <TierAssessment
            tierId={activeAssessment.tierId}
            roots={activeAssessment.roots}
            isPro={user?.isPro || false}
            customApiKey={user?.customApiKey}
            onComplete={handleAssessmentComplete}
            onCancel={() => setView(AppView.DASHBOARD)}
          />
        </div>
      </div>
    );
  }

  if (view === AppView.LESSON && activeLesson) {
    return (
      <LessonFlow
        lesson={activeLesson}
        customApiKey={user?.customApiKey}
        onComplete={handleLessonComplete}
        onExit={() => setView(AppView.DASHBOARD)}
      />
    );
  }

  return (
    <div className="antialiased text-stone-900">
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
              Enter your own Gemini API Key to unlock Pro AI features. Your key
              is stored securely in your profile.
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

      <Layout
        user={user}
        currentView={view}
        onNavigate={setView}
        onLogout={handleLogout}
        onShowApiKeyModal={() => setShowApiKeyModal(true)}
      >
        {view === AppView.DASHBOARD && (
          <Dashboard
            user={user}
            onUpdateUser={handleUpdateUser}
            progress={user.progress}
            appConfig={appConfig}
            onSelectLesson={handleLessonSelect}
            onTakeAssessment={handleTakeAssessment}
          />
        )}

        {view === AppView.GARDEN && <WordGarden progress={user.progress} />}

        {view === AppView.ANALYZER && (
          <MorphologyAnalyzer customApiKey={user?.customApiKey} />
        )}

        {view === AppView.WORD_TREE && (
          <WordTreePage customApiKey={user?.customApiKey} />
        )}

        {view === AppView.PUZZLES && (
          <LogicPuzzles 
            customApiKey={user?.customApiKey} 
            user={user}
            onProgressUpdate={(xpGained) => {
              const newProgress = { ...user.progress };
              newProgress.xp += xpGained;
              checkAchievements(newProgress);
              saveUserProgress(user.uid!, newProgress);
              setUser({ ...user, progress: newProgress });
            }}
          />
        )}

        {view === AppView.FLASHCARDS && (
          <Flashcards 
            progress={user.progress}
            customApiKey={user?.customApiKey}
            onProgressUpdate={(xpGained) => {
              const newProgress = { ...user.progress };
              newProgress.xp += xpGained;
              checkAchievements(newProgress);
              saveUserProgress(user.uid!, newProgress);
              setUser({ ...user, progress: newProgress });
            }}
          />
        )}

        {view === AppView.REVIEW && (
          <ReviewPage
            user={user}
            onBack={() => setView(AppView.DASHBOARD)}
            onUpdateProgress={(p) => setUser({ ...user, progress: p })}
          />
        )}

        {view === AppView.TUTOR && (
          <ProfessionalTutor
            user={user}
            onBack={() => setView(AppView.DASHBOARD)}
          />
        )}

        {view === AppView.PROFILE && (
          <ProfilePage
            user={user}
            appConfig={appConfig}
            onLogout={handleLogout}
            onShowApiKeyModal={() => setShowApiKeyModal(true)}
          />
        )}
      </Layout>
    </div>
  );
};

export default App;
