import React from "react";
import { AppView, User } from "../types";
import {
  Book,
  Leaf,
  Search,
  LogOut,
  Key,
  Shield,
  Star,
  Menu,
  X,
  Network,
  Puzzle,
  User as UserIcon,
  Layers,
} from "lucide-react";

interface LayoutProps {
  user: User;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  onShowApiKeyModal: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  user,
  currentView,
  onNavigate,
  onLogout,
  onShowApiKeyModal,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: AppView.DASHBOARD, label: "Curriculum", icon: Book },
    { id: AppView.GARDEN, label: "Word Garden", icon: Leaf },
    { id: AppView.FLASHCARDS, label: "Daily Flashcards", icon: Layers },
    { id: AppView.ANALYZER, label: "Analyzer", icon: Search },
    { id: AppView.WORD_TREE, label: "Word Tree", icon: Network },
    { id: AppView.PUZZLES, label: "Logic Puzzles", icon: Puzzle },
    { id: AppView.PROFILE, label: "Account & Guide", icon: UserIcon },
  ];

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 shrink-0 shadow-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-stone-800">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl shadow-lg">
            <Book size={24} className="text-stone-900" />
          </div>
          <span className="font-serif font-bold text-xl text-stone-50 tracking-tight">
            MorphoMaster
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-500 font-bold shadow-sm"
                    : "hover:bg-stone-800 hover:text-stone-100"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800 space-y-2">
          {!user.isPro && (
            <button
              onClick={() => handleNav(AppView.UPGRADE)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-900 px-4 py-3 rounded-xl font-bold transition-all shadow-lg mb-4"
            >
              <Star size={18} /> Upgrade to Pro
            </button>
          )}
          <button
            onClick={onShowApiKeyModal}
            className="w-full flex items-center gap-3 px-4 py-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors text-sm"
          >
            <Key
              size={16}
              className={user.customApiKey ? "text-amber-500" : ""}
            />{" "}
            API Key
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-stone-50">
        {/* Global Header */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-stone-600 hover:text-stone-900 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <h2 className="font-serif font-bold text-xl text-stone-800">
                {navItems.find((item) => item.id === currentView)?.label ||
                  "Dashboard"}
              </h2>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-md">
                <Book size={18} className="text-stone-900" />
              </div>
              <span className="font-serif font-bold text-lg text-stone-900">
                MorphoMaster
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.isPro && (
              <span className="hidden sm:flex items-center gap-1 text-amber-700 text-xs font-bold px-2.5 py-1 bg-amber-100 border border-amber-200 rounded-full">
                <Shield size={12} /> PRO
              </span>
            )}
            <div
              className="flex items-center gap-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors px-3 py-1.5 rounded-full cursor-pointer"
              onClick={() => onNavigate(AppView.PROFILE)}
            >
              <div className="w-6 h-6 rounded-full bg-stone-300 flex items-center justify-center text-stone-600 font-bold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{user.username}</span>
            </div>
          </div>
        </header>

        {/* Detail / Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-stone-50/50 relative">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[80%] bg-stone-900 text-stone-300 flex flex-col h-full shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-md">
                  <Book size={18} className="text-stone-900" />
                </div>
                <span className="font-serif font-bold text-lg">
                  MorphoMaster
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-amber-500/10 text-amber-500 font-bold shadow-sm"
                        : "hover:bg-stone-800 hover:text-stone-100"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-stone-800 space-y-2">
              {!user.isPro && (
                <button
                  onClick={() => handleNav(AppView.UPGRADE)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-900 px-4 py-3 rounded-xl font-bold transition-all shadow-lg mb-4"
                >
                  <Star size={18} /> Upgrade to Pro
                </button>
              )}
              <button
                onClick={() => {
                  onShowApiKeyModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors text-sm"
              >
                <Key
                  size={16}
                  className={user.customApiKey ? "text-amber-500" : ""}
                />{" "}
                API Key
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors text-sm"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
