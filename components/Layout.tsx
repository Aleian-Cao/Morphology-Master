import React from 'react';
import { AppView, User } from '../types';
import { Book, Leaf, Search, LogOut, Key, Shield, Star, Menu, X, Network, Puzzle } from 'lucide-react';

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
  children 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Curriculum', icon: Book },
    { id: AppView.GARDEN, label: 'Word Garden', icon: Leaf },
    { id: AppView.ANALYZER, label: 'Analyzer', icon: Search },
    { id: AppView.WORD_TREE, label: 'Word Tree', icon: Network },
    { id: AppView.PUZZLES, label: 'Logic Puzzles', icon: Puzzle },
  ];

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-stone-900 text-stone-50 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-1.5 rounded-lg">
            <Book size={20} className="text-stone-900" />
          </div>
          <span className="font-serif font-bold text-lg">Morphology Master</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-stone-900 text-stone-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-stone-800">
          <div className="bg-amber-500 p-2 rounded-xl">
            <Book size={24} className="text-stone-900" />
          </div>
          <span className="font-serif font-bold text-xl text-stone-50">Morphology</span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 font-bold border border-stone-700">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-100">{user.username}</p>
              <p className="text-xs text-stone-500">{user.progress.xp} XP</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-500 font-bold' 
                      : 'hover:bg-stone-800 hover:text-stone-100'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-stone-800 space-y-2">
          <button 
            onClick={onShowApiKeyModal}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-colors text-left"
          >
            <Key size={20} className={user.customApiKey ? "text-amber-500" : ""} />
            <span>API Key</span>
          </button>
          <button 
            onClick={() => handleNav(AppView.UPGRADE)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-colors text-left"
          >
            <Star size={20} className={user.isPro ? "text-amber-500" : ""} />
            <span>{user.isPro ? 'Pro Active' : 'Upgrade to Pro'}</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-800 transition-colors text-left text-red-400 hover:text-red-300"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
        {children}
      </div>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
