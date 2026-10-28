import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  Plus,
  Copy,
  Settings,
  GripVertical,
  Lock,
  LogIn,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { AppConfig } from "../types";

export const AdminPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [error, setError] = useState("");

  const [adminKeys, setAdminKeys] = useState<any[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const [config, setConfig] = useState<AppConfig>({
    baseFeatures: [],
    proFeatures: [],
  });
  const [configLoading, setConfigLoading] = useState(false);

  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
  const adminEmail = "10a10caonguyenthanhan@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadConfig();
      if (firebaseUser?.email === adminEmail) {
        loadAdminKeys();
        loadUpgradeRequests();
        loadUsers();
      }
    }
  }, [isAuthenticated, firebaseUser]);

  const loadUsers = async () => {
    if (firebaseUser?.email !== adminEmail) return;
    setUsersLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleTogglePro = async (userId: string, currentStatus: boolean) => {
    if (firebaseUser?.email !== adminEmail) return;
    try {
      const userRef = doc(db, "users", userId);
      const newStatus = !currentStatus;
      const updates: any = { isPro: newStatus };
      if (newStatus) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        updates.proExpiresAt = expiresAt.toISOString();
      }
      await setDoc(userRef, updates, { merge: true });
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert("Failed to update user status");
    }
  };

  const loadUpgradeRequests = async () => {
    try {
      const q = query(collection(db, "upgrade_requests"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setUpgradeRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) {
      console.error(e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleFirebaseLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Firebase login failed", error);
      setError("Failed to sign in with Google.");
    }
  };

  const loadAdminKeys = async () => {
    setAdminLoading(true);
    try {
      const q = query(collection(db, "pro_keys"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setAdminKeys(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Failed to load keys", e);
      setError(
        "Failed to load keys. Ensure you are logged in with the admin Google account.",
      );
    }
    setAdminLoading(false);
  };

  const handleGenerateKey = async () => {
    if (firebaseUser?.email !== adminEmail) {
      setError(
        "You must be logged in with the admin Google account to generate keys.",
      );
      return;
    }
    setAdminLoading(true);
    try {
      const newKey =
        "PRO-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      await setDoc(doc(db, "pro_keys", newKey), {
        used: false,
        createdAt: new Date().toISOString(),
      });
      await loadAdminKeys();
    } catch (e) {
      console.error("Failed to generate key", e);
      setError("Failed to generate key. Check permissions.");
    }
    setAdminLoading(false);
  };

  const handleRenewKey = async (userId: string) => {
    if (firebaseUser?.email !== adminEmail) {
      setError(
        "You must be logged in with the admin Google account to renew keys.",
      );
      return;
    }
    setAdminLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        let newExpiresAt = new Date();
        if (userData.proExpiresAt) {
          const currentExpiresAt = new Date(userData.proExpiresAt);
          if (currentExpiresAt > new Date()) {
            newExpiresAt = currentExpiresAt;
          }
        }
        newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);

        await setDoc(
          userRef,
          {
            isPro: true,
            proExpiresAt: newExpiresAt.toISOString(),
          },
          { merge: true },
        );

        alert(
          `Successfully renewed Pro access for user ${userId} until ${newExpiresAt.toLocaleDateString()}`,
        );
      } else {
        setError(`User ${userId} not found.`);
      }
    } catch (e) {
      console.error("Failed to renew key", e);
      setError("Failed to renew key. Check permissions.");
    }
    setAdminLoading(false);
  };

  const handleApproveRequest = async (request: any) => {
    if (firebaseUser?.email !== adminEmail) return;
    try {
      setAdminLoading(true);
      
      const userRef = doc(db, "users", request.userId);
      const userSnap = await getDoc(userRef);
      let newExpiresAt = new Date();
      if (userSnap.exists()) {
         const userData = userSnap.data();
         if (userData.proExpiresAt) {
            const currentExpiresAt = new Date(userData.proExpiresAt);
            if (currentExpiresAt > new Date()) {
               newExpiresAt = currentExpiresAt;
            }
         }
      }
      newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
      
      await setDoc(userRef, {
        isPro: true,
        proExpiresAt: newExpiresAt.toISOString()
      }, { merge: true });

      await setDoc(doc(db, "upgrade_requests", request.id), { status: "approved" }, { merge: true });
      await loadUpgradeRequests();
      alert("Request approved! The user now has PRO access.");
    } catch(e) {
      console.error(e);
      alert("Failed to approve request.");
    }
    setAdminLoading(false);
  };

  const handleRejectRequest = async (requestId: string) => {
    if (firebaseUser?.email !== adminEmail) return;
    try {
      setAdminLoading(true);
      await setDoc(doc(db, "upgrade_requests", requestId), { status: "rejected" }, { merge: true });
      await loadUpgradeRequests();
    } catch(e) {
      console.error(e);
      alert("Failed to reject request.");
    }
    setAdminLoading(false);
  };

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const docRef = doc(db, "config", "features");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as AppConfig;
        setConfig({
          baseFeatures: data.baseFeatures || [],
          proFeatures: data.proFeatures || [],
        });
      } else {
        const defaultConfig: AppConfig = {
          baseFeatures: ["tier_assessments", "word_garden"],
          proFeatures: [
            "morphology_analyzer",
            "ai_lesson_generation",
            "text_to_speech",
          ],
        };
        await setDoc(docRef, defaultConfig);
        setConfig(defaultConfig);
      }
    } catch (e) {
      console.error("Failed to load config", e);
    }
    setConfigLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const onDragStart = (
    e: React.DragEvent,
    feature: string,
    source: "base" | "pro",
  ) => {
    e.dataTransfer.setData("feature", feature);
    e.dataTransfer.setData("source", source);
  };

  const onDrop = async (e: React.DragEvent, target: "base" | "pro") => {
    e.preventDefault();
    const feature = e.dataTransfer.getData("feature");
    const source = e.dataTransfer.getData("source") as "base" | "pro";

    if (!feature || !source || source === target) return;

    const newConfig = { ...config };
    newConfig[source === "base" ? "baseFeatures" : "proFeatures"] = newConfig[
      source === "base" ? "baseFeatures" : "proFeatures"
    ].filter((f) => f !== feature);
    newConfig[target === "base" ? "baseFeatures" : "proFeatures"].push(feature);

    setConfig(newConfig);

    try {
      await setDoc(doc(db, "config", "features"), newConfig);
    } catch (err) {
      console.error("Failed to save config", err);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-stone-950 flex items-center justify-center p-6">
        <div className="bg-stone-900 p-8 rounded-2xl shadow-xl border border-stone-800 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-stone-800 rounded-full">
              <Lock className="text-amber-500" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-stone-100 text-center mb-6">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-stone-950 border border-stone-700 text-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-4 rounded-xl transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-stone-950 text-stone-100 min-h-[100dvh]">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-center gap-4 border-b border-stone-800 pb-6">
          <Shield className="text-amber-500" size={40} />
          <h1 className="text-4xl font-serif font-bold">Admin Dashboard</h1>
        </div>

        {/* Feature Management */}
        <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Settings className="text-amber-500" />
            Feature Management (Drag & Drop)
          </h2>
          <p className="text-stone-400 mb-8">
            Drag features between Base and Pro tiers to instantly update access
            across the app.
          </p>

          {configLoading ? (
            <div className="text-stone-500">Loading configuration...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Base Features */}
              <div
                className="bg-stone-950 border border-stone-700 rounded-xl p-6 min-h-[300px]"
                onDrop={(e) => onDrop(e, "base")}
                onDragOver={onDragOver}
              >
                <h3 className="text-lg font-bold text-stone-300 mb-4 border-b border-stone-800 pb-2">
                  Base Features
                </h3>
                <div className="space-y-3">
                  {config.baseFeatures.map((feature) => (
                    <div
                      key={feature}
                      draggable
                      onDragStart={(e) => onDragStart(e, feature, "base")}
                      className="bg-stone-800 p-4 rounded-lg flex items-center gap-3 cursor-grab hover:bg-stone-700 transition-colors border border-stone-700"
                    >
                      <GripVertical className="text-stone-500" size={18} />
                      <span className="font-mono text-sm text-stone-200">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {config.baseFeatures.length === 0 && (
                    <div className="text-stone-600 text-sm italic text-center py-4">
                      Drag features here
                    </div>
                  )}
                </div>
              </div>

              {/* Pro Features */}
              <div
                className="bg-stone-950 border border-amber-900/30 rounded-xl p-6 min-h-[300px]"
                onDrop={(e) => onDrop(e, "pro")}
                onDragOver={onDragOver}
              >
                <h3 className="text-lg font-bold text-amber-500 mb-4 border-b border-stone-800 pb-2">
                  Pro Features
                </h3>
                <div className="space-y-3">
                  {config.proFeatures.map((feature) => (
                    <div
                      key={feature}
                      draggable
                      onDragStart={(e) => onDragStart(e, feature, "pro")}
                      className="bg-amber-900/20 p-4 rounded-lg flex items-center gap-3 cursor-grab hover:bg-amber-900/40 transition-colors border border-amber-900/50"
                    >
                      <GripVertical className="text-amber-600" size={18} />
                      <span className="font-mono text-sm text-amber-200">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {config.proFeatures.length === 0 && (
                    <div className="text-stone-600 text-sm italic text-center py-4">
                      Drag features here
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Management */}
        <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Key className="text-amber-500" />
              Pro Key Management
            </h2>
            <div className="flex items-center gap-4">
              {firebaseUser?.email !== adminEmail && (
                <button
                  onClick={handleFirebaseLogin}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-stone-700"
                >
                  <LogIn size={20} />
                  Login with Google
                </button>
              )}
              <button
                onClick={handleGenerateKey}
                disabled={adminLoading || firebaseUser?.email !== adminEmail}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                title={
                  firebaseUser?.email !== adminEmail
                    ? "Please login with admin Google account first"
                    : ""
                }
              >
                <Plus size={20} />
                Generate New Key
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 text-red-400 p-4 rounded-xl mb-6 border border-red-900/50">
              {error}
            </div>
          )}

          <div className="bg-stone-950 rounded-xl overflow-hidden border border-stone-800">
            <table className="w-full text-left">
              <thead className="bg-stone-900 text-stone-400 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4">Key</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Used By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {adminKeys.map((k) => (
                  <tr
                    key={k.id}
                    className="hover:bg-stone-900 transition-colors"
                  >
                    <td className="p-4 font-mono text-amber-400 flex items-center gap-2">
                      {k.id}
                      <button
                        onClick={() => copyToClipboard(k.id)}
                        className="text-stone-500 hover:text-stone-300"
                      >
                        <Copy size={16} />
                      </button>
                    </td>
                    <td className="p-4">
                      {k.used ? (
                        <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-bold border border-red-900/50">
                          USED
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-bold border border-green-900/50">
                          AVAILABLE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-stone-400 text-sm">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-stone-400 text-sm font-mono">
                      {k.usedBy ? (
                        <div className="flex items-center gap-2">
                          {k.usedBy}
                          <button
                            onClick={() => handleRenewKey(k.usedBy)}
                            className="text-amber-500 hover:text-amber-400 text-xs bg-amber-900/20 px-2 py-1 rounded"
                          >
                            Renew
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
                {adminKeys.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-stone-500">
                      No keys generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Upgrade Requests Management */}
        <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Key className="text-amber-500" />
              Upgrade Requests
            </h2>
            <button
              onClick={loadUpgradeRequests}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-stone-700"
            >
              Refresh
            </button>
          </div>

          <div className="bg-stone-950 rounded-xl overflow-hidden border border-stone-800">
            <table className="w-full text-left">
              <thead className="bg-stone-900 text-stone-400 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Transfer Code</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {upgradeRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-900 transition-colors">
                    <td className="p-4 text-stone-300">
                      <div>{r.userEmail}</div>
                      <div className="text-xs text-stone-500 font-mono">{r.userId}</div>
                    </td>
                    <td className="p-4 font-mono text-amber-400">{r.transferCode}</td>
                    <td className="p-4">
                      {r.status === "pending" && <span className="px-2 py-1 bg-amber-900/30 text-amber-400 rounded text-xs font-bold border border-amber-900/50">PENDING</span>}
                      {r.status === "approved" && <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-bold border border-green-900/50">APPROVED</span>}
                      {r.status === "rejected" && <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-bold border border-red-900/50">REJECTED</span>}
                    </td>
                    <td className="p-4 text-stone-400 text-sm">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                           <button onClick={() => handleApproveRequest(r)} className="px-3 py-1 bg-green-900/50 hover:bg-green-800 text-green-300 rounded font-bold text-xs transition-colors">Approve</button>
                           <button onClick={() => handleRejectRequest(r.id)} className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-300 rounded font-bold text-xs transition-colors">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {upgradeRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-500">
                      No upgrade requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Management & Analytics */}
        <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="text-amber-500" />
                User Directory & Analytics ({users.length} registered)
              </h2>
              <p className="text-stone-400 text-sm mt-1">
                Theo dõi tất cả tài khoản học viên, người dùng mới đăng ký và phân quyền Pro.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-3 text-stone-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm email, ID người dùng..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={loadUsers}
                disabled={usersLoading}
                className="bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-stone-700 text-sm whitespace-nowrap"
              >
                {usersLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Tổng học viên</span>
              <p className="text-2xl font-bold text-stone-100 mt-1">{users.length}</p>
            </div>
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Tài khoản PRO</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{users.filter(u => u.isPro).length}</p>
            </div>
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Thẻ AI Flashcard</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {users.reduce((acc, u) => acc + (u.progress?.customFlashcards?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Tổng điểm XP</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {users.reduce((acc, u) => acc + (u.progress?.xp || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-stone-950 rounded-xl overflow-x-auto border border-stone-800">
            <table className="w-full text-left">
              <thead className="bg-stone-900 text-stone-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Học viên</th>
                  <th className="p-4">Gói dịch vụ</th>
                  <th className="p-4">Tiến độ (XP / Bài)</th>
                  <th className="p-4">Flashcard đã lưu</th>
                  <th className="p-4">Hạn Pro</th>
                  <th className="p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-sm">
                {users
                  .filter(u => 
                    (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                    (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                    (u.id || '').toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map((u) => {
                    const customCount = u.progress?.customFlashcards?.length || 0;
                    const completedCount = u.progress?.completedLessons?.length || 0;
                    const xp = u.progress?.xp || 0;
                    return (
                      <tr key={u.id} className="hover:bg-stone-900/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-stone-200">{u.username || u.email || 'Học viên'}</div>
                          <div className="text-xs text-stone-500 font-mono">{u.email || u.id}</div>
                        </td>
                        <td className="p-4">
                          {u.isPro ? (
                            <span className="px-2.5 py-1 bg-amber-900/30 text-amber-400 rounded-md text-xs font-bold border border-amber-900/50">
                              PRO
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-stone-800 text-stone-400 rounded-md text-xs font-medium border border-stone-700">
                              FREE
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-stone-300 font-bold">{xp} XP</div>
                          <div className="text-xs text-stone-500">{completedCount} bài học hoàn thành</div>
                        </td>
                        <td className="p-4">
                          <div className="text-stone-300 font-medium">{customCount} thẻ</div>
                        </td>
                        <td className="p-4 text-xs text-stone-400">
                          {u.proExpiresAt ? new Date(u.proExpiresAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleTogglePro(u.id, !!u.isPro)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              u.isPro
                                ? 'bg-red-950 text-red-400 hover:bg-red-900 border border-red-800/50'
                                : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                            }`}
                          >
                            {u.isPro ? 'Hạ xuống Free' : 'Kích hoạt Pro (+1 tháng)'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-500">
                      {firebaseUser?.email !== adminEmail
                        ? "Vui lòng đăng nhập với tài khoản Google Admin (10a10caonguyenthanhan@gmail.com) để xem danh sách học viên."
                        : "Chưa có dữ liệu người dùng nào."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
