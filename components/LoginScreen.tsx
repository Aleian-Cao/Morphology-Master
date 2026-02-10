import React, { useState } from 'react';
import { User } from '../types';
import { loginUser } from '../services/authService';
import { BookOpen, UserCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    const user = loginUser(username.trim());
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-stone-200">
        <div className="flex flex-col items-center mb-8">
            <div className="bg-orange-100 p-4 rounded-full mb-4">
                <BookOpen size={48} className="text-orange-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 text-center">Morphology Master</h1>
            <p className="text-stone-500 text-center mt-2">Unlock the building blocks of English.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-stone-700 font-bold mb-2">Who is learning today?</label>
                <div className="relative">
                    <UserCircle2 className="absolute left-3 top-3 text-stone-400" size={20} />
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        required
                    />
                </div>
                <p className="text-xs text-stone-400 mt-2">Enter any name. We'll save your progress locally.</p>
            </div>

            <button 
                type="submit"
                className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition-transform active:scale-95 shadow-lg"
            >
                Start Learning
            </button>
        </form>
      </div>
    </div>
  );
};