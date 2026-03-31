import React, { useState } from 'react';
import { User } from '../types';
import { loginWithGoogle } from '../services/authService';
import { BookOpen, UserCircle2, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const user = await loginWithGoogle();
    if (user) {
      onLogin(user);
    }
    setLoading(false);
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

        <div className="space-y-6">
            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign in with Google'}
            </button>
            <p className="text-xs text-stone-400 mt-2 text-center">Your progress will be saved securely.</p>
        </div>
      </div>
    </div>
  );
};