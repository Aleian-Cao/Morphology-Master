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
import { PhonicsLab } from "./components/PhonicsLab";
import { Layout } from "./components/Layout";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { INITIAL_USER_PROGRESS } from "./constants";
import { AppConfig, PartType } from "./types";
import { recordWeeklyActivity } from "./components/ProgressChart";
import { recordStreakActivity } from "./utils/streak";
import { recordDailyGoalProgress } from "./utils/dailyGoal";
import { soundFX } from "./utils/soundEffects";
import { Key, X } from "lucide-react";

export const getInitialViewFromUrl = (): AppView | null => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname.replace(/^\/+/, "").toLowerCase();
  const searchParam = new URLSearchParams(window.location.search).get("view")?.toLowerCase();
  const target = searchParam || path;

  switch (target) {
    case "phonics":
      return AppView.PHONICS;
    case "analyzer":
      return AppView.ANALYZER;
    case "flashcards":
      return AppView.FLASHCARDS;
    case "word-tree":
    case "word_tree":
      return AppView.WORD_TREE;
    case "garden":
      return AppView.GARDEN;
    case "puzzles":
      return AppView.PUZZLES;
    case "tutor":
      return AppView.TUTOR;
    case "review":
      return AppView.REVIEW;
    case "upgrade":
      return AppView.UPGRADE;
    case "profile":
      return AppView.PROFILE;
    case "curriculum":
    case "dashboard":
      return AppView.DASHBOARD;
    default:
      return null;
  }
};

const viewPathMap: Partial<Record<AppView, string>> = {
  [AppView.DASHBOARD]: "/",
  [AppView.PHONICS]: "/phonics",
  [AppView.ANALYZER]: "/analyzer",
  [AppView.FLASHCARDS]: "/flashcards",
  [AppView.WORD_TREE]: "/word-tree",
  [AppView.GARDEN]: "/garden",
  [AppView.PUZZLES]: "/puzzles",
  [AppView.TUTOR]: "/tutor",
  [AppView.REVIEW]: "/review",
  [AppView.UPGRADE]: "/upgrade",
  [AppView.PROFILE]: "/profile",
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(getInitialViewFromUrl() || AppView.LOGIN);
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
        // Race with 3.5s timeout to prevent blocking on network latency
        const docSnap = await Promise.race([
          getDoc(docRef),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500))
        ]);
        if (docSnap && docSnap.exists()) {
          const data = docSnap.data() as AppConfig;
          setAppConfig({
            baseFeatures: data.baseFeatures || [],
            proFeatures: data.proFeatures || [],
          });
        }
      } catch (e) {
        console.warn("Using default app features config due to offline/timeout:", e);
      }
    };
    fetchConfig();
  }, []);

  // Check for existing session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let progress = { ...INITIAL_USER_PROGRESS };
          let isPro = false;
          let proExpiresAt: string | undefined;
          let customApiKey: string | undefined;

          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            // Quick 3.5s timeout race so user never hangs on loading screen
            const userDoc = await Promise.race([
              getDoc(userDocRef),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500))
            ]);

            if (userDoc && userDoc.exists()) {
              const data = userDoc.data();
              progress = { ...INITIAL_USER_PROGRESS, ...data.progress };
              isPro = data.isPro || false;
              proExpiresAt = data.proExpiresAt;
              customApiKey = data.customApiKey;

              if (isPro && proExpiresAt) {
                if (new Date(proExpiresAt) < new Date()) {
                  isPro = false;
                  setDoc(userDocRef, { isPro: false }, { merge: true }).catch(() => {});
                }
              }
            }
          } catch (docErr) {
            console.warn("Could not fetch user doc immediately, using cached/default progress:", docErr);
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
          const urlView = getInitialViewFromUrl();
          setView(urlView || AppView.DASHBOARD);
        } else {
          const urlView = getInitialViewFromUrl();
          if (urlView && urlView !== AppView.LOGIN) {
            setUser({
              username: "Guest Explorer",
              progress: { ...INITIAL_USER_PROGRESS },
            });
            setView(urlView);
          } else {
            setUser(null);
            setView(AppView.LOGIN);
          }
        }
      } catch (err) {
        console.error("Auth state handling error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const targetView = getInitialViewFromUrl();
      if (targetView) {
        setView(targetView);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (newView: AppView) => {
    setView(newView);
    if (typeof window !== "undefined") {
      const path = viewPathMap[newView];
      if (path && window.location.pathname !== path) {
        window.history.pushState(null, "", path);
      }
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    const urlView = getInitialViewFromUrl();
    handleNavigate(urlView || AppView.DASHBOARD);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setView(AppView.LOGIN);
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.history.pushState(null, "", "/");
    }
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      if (updates.progress && user.uid) {
        saveUserProgress(user.uid, updates.progress);
      }
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
    // Streak achievements
    if ((progress.streak || 0) >= 3) {
      addAchievement('streak_3', 'Ngọn Lửa Kiên Trì', 'Duy trì chuỗi học tập 3 ngày liên tiếp', '🔥');
    }
    if ((progress.streak || 0) >= 7) {
      addAchievement('streak_7', 'Tuần Lễ Rực Rỡ', 'Duy trì chuỗi học tập 7 ngày liên tiếp', '⚡');
    }
    if ((progress.streak || 0) >= 14) {
      addAchievement('streak_14', 'Kỷ Luật Thép', 'Duy trì chuỗi học tập 14 ngày liên tiếp', '🛡️');
    }
    if ((progress.streak || 0) >= 30) {
      addAchievement('streak_30', 'Bậc Thầy Kiên Trì', 'Duy trì chuỗi học tập 30 ngày liên tiếp', '👑');
    }

    if (updated) {
      progress.achievements = newAchievements;
    }
    return updated;
  };

  const handleLessonComplete = () => {
    if (!activeLesson || !user) return;

    let newProgress = { ...user.progress };

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

    let xpEarned = 0;
    let lessonsDelta = 0;

    // Logic: If lesson wasn't done before, award first-time XP and tree
    if (!newProgress.completedLessons?.includes(activeLesson.id)) {
      newProgress.completedLessons = newProgress.completedLessons || [];
      newProgress.completedLessons.push(activeLesson.id);
      xpEarned += 100;
      newProgress.xp += 100;
      newProgress.garden.trees += 1;
      lessonsDelta = 1;

      // If it's a remedial lesson, clear the weakness
      if (activeLesson.id.startsWith('remedial_') && newProgress.weaknesses && newProgress.weaknesses[activeLesson.root]) {
         newProgress.weaknesses[activeLesson.root].mistakeCount = 0;
         newProgress.xp += 150; // Extra reward for fixing a weakness
         xpEarned += 150;
      }
    } else {
      // Reviewing an existing lesson still gives modest practice XP
      xpEarned += 25;
      newProgress.xp += 25;
      lessonsDelta = 1;
    }

    // Record weekly progress
    newProgress = recordWeeklyActivity(newProgress, xpEarned, lessonsDelta);

    // Record Daily Streak activity (updates streak and marks today completed)
    const { updatedProgress: streakProgress } = recordStreakActivity(newProgress);
    newProgress = streakProgress;

    // Record Daily Learning Goal progress (+1 lesson, +10 study minutes)
    const { updatedProgress: goalProgress } = recordDailyGoalProgress(newProgress, {
      lessons: 1,
      minutes: 10
    });
    newProgress = goalProgress;

    checkAchievements(newProgress);

    // Play triumphant completion sound & XP chime
    soundFX.playLessonComplete();

    // Save to DB
    if (user.uid) {
      saveUserProgress(user.uid, newProgress);
    }
    setUser({ ...user, progress: newProgress });

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

    let newProgress = { ...user.progress };

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
      soundFX.playLessonComplete();
      newProgress = recordWeeklyActivity(newProgress, 500, 0);
    }

    // Record Daily Streak activity for assessment
    const { updatedProgress: streakProgress } = recordStreakActivity(newProgress);
    newProgress = streakProgress;

    checkAchievements(newProgress);

    if (user.uid) {
      saveUserProgress(user.uid, newProgress);
    }
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
        onNavigate={handleNavigate}
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
            onNavigateView={handleNavigate}
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
              let newProgress = { ...user.progress };
              newProgress.xp += xpGained;
              const { updatedProgress: streakProgress } = recordStreakActivity(newProgress);
              newProgress = streakProgress;
              checkAchievements(newProgress);
              if (user.uid) saveUserProgress(user.uid, newProgress);
              setUser({ ...user, progress: newProgress });
            }}
          />
        )}

        {view === AppView.FLASHCARDS && (
          <Flashcards 
            progress={user.progress}
            customApiKey={user?.customApiKey}
            onProgressUpdate={(xpGained) => {
              let newProgress = { ...user.progress };
              newProgress.xp += xpGained;
              const { updatedProgress: streakProgress } = recordStreakActivity(newProgress);
              newProgress = streakProgress;
              checkAchievements(newProgress);
              if (user.uid) saveUserProgress(user.uid, newProgress);
              setUser({ ...user, progress: newProgress });
            }}
            onUpdateProgress={(newProgress) => {
              if (user.uid) saveUserProgress(user.uid, newProgress);
              setUser({ ...user, progress: newProgress });
            }}
            onNavigateToTutor={() => setView(AppView.TUTOR)}
            onNavigateToDashboard={() => setView(AppView.DASHBOARD)}
          />
        )}

        {view === AppView.REVIEW && (
          <ReviewPage
            user={user}
            onBack={() => setView(AppView.DASHBOARD)}
            onUpdateProgress={(p) => {
              if (user.uid) saveUserProgress(user.uid, p);
              setUser({ ...user, progress: p });
            }}
          />
        )}

        {view === AppView.TUTOR && (
          <ProfessionalTutor
            user={user}
            onBack={() => setView(AppView.DASHBOARD)}
            onNavigateToFlashcards={() => setView(AppView.FLASHCARDS)}
            onUpdateProgress={(p) => {
              if (user.uid) saveUserProgress(user.uid, p);
              setUser({ ...user, progress: p });
            }}
          />
        )}

        {view === AppView.PHONICS && (
          <PhonicsLab
            user={user}
            customApiKey={user?.customApiKey}
            onUpdateProgress={(p) => {
              saveUserProgress(user.uid!, p);
              setUser({ ...user, progress: p });
            }}
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
