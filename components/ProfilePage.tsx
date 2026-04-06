import React from 'react';
import { User, AppConfig } from '../types';
import { 
  User as UserIcon, 
  BookOpen, 
  Star, 
  Shield, 
  Info, 
  Key, 
  LogOut, 
  Check, 
  X, 
  Library,
  Sprout,
  Trophy,
  Zap,
  Layers
} from 'lucide-react';

interface ProfilePageProps {
  user: User;
  appConfig: AppConfig;
  onLogout: () => void;
  onShowApiKeyModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, appConfig, onLogout, onShowApiKeyModal }) => {
  // Estimate vocabulary size (e.g., 5 words per root learned + garden trees)
  const estimatedVocabSize = (user.progress.completedLessons.length * 5) + user.progress.garden.trees;

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-stone-200 p-4 rounded-full text-stone-600">
            <UserIcon size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Account & Guide</h1>
            <p className="text-stone-500">Manage your profile and learn how to use Morphology Master.</p>
          </div>
        </div>

        {/* Account Overview & Stats */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold font-serif text-stone-900 mb-6 flex items-center gap-2">
              <UserIcon className="text-stone-400" size={20} />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-stone-500 font-bold uppercase tracking-wider">Username</p>
                <p className="text-lg font-medium text-stone-900">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 font-bold uppercase tracking-wider">Account Status</p>
                {user.isPro ? (
                  <div className="flex items-center gap-2 text-amber-600 font-bold mt-1">
                    <Shield size={18} />
                    <span>PRO Member</span>
                    {user.proExpiresAt && (
                      <span className="text-sm font-normal text-stone-500 ml-2">
                        (Expires: {new Date(user.proExpiresAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-stone-600 font-medium mt-1">
                    <span>Base Account</span>
                  </div>
                )}
              </div>
              <div className="pt-4 flex flex-wrap gap-3 border-t border-stone-100">
                <button 
                  onClick={onShowApiKeyModal}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Key size={16} /> Manage API Key
                </button>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold font-serif text-stone-900 mb-6 flex items-center gap-2">
              <Library className="text-emerald-500" size={20} />
              Your Vocabulary Inventory
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-3xl font-bold text-emerald-700 mb-1">{estimatedVocabSize}</p>
                <p className="text-sm text-emerald-600 font-medium">Estimated Words</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-3xl font-bold text-blue-700 mb-1">{user.progress.completedLessons.length}</p>
                <p className="text-sm text-blue-600 font-medium">Roots Mastered</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-3xl font-bold text-green-700 mb-1">{user.progress.garden.trees}</p>
                <p className="text-sm text-green-600 font-medium">Trees Planted</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-3xl font-bold text-amber-700 mb-1">{user.progress.xp}</p>
                <p className="text-sm text-amber-600 font-medium">Total XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {user.progress.achievements && user.progress.achievements.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold font-serif text-stone-900 mb-6 flex items-center gap-2">
              <Trophy className="text-amber-500" size={20} />
              Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.progress.achievements.map((achievement) => (
                <div key={achievement.id} className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h3 className="font-bold text-amber-900">{achievement.title}</h3>
                    <p className="text-sm text-amber-700">{achievement.description}</p>
                    <p className="text-xs text-amber-500 mt-2">Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Guide */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
          <h2 className="text-2xl font-bold font-serif text-stone-900 mb-6 flex items-center gap-2">
            <BookOpen className="text-blue-500" size={24} />
            User Guide & Features
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-stone-100 p-3 rounded-xl h-fit text-stone-600"><BookOpen size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Curriculum (Dashboard)</h3>
                <p className="text-stone-600">Follow the structured learning path. Complete lessons to master morphological roots, unlock new tiers by passing assessments, and follow the Adaptive Learning Path recommendations.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-green-100 p-3 rounded-xl h-fit text-green-600"><Sprout size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Word Garden</h3>
                <p className="text-stone-600">Review your learned roots. Plant seeds, water them through spaced repetition reviews, and grow your vocabulary forest.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-100 p-3 rounded-xl h-fit text-blue-600"><Layers size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Daily Flashcards</h3>
                <p className="text-stone-600">Review the roots you've learned each day using flashcards. Test your memory, flip to see the meaning, and earn XP for remembering correctly.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-purple-100 p-3 rounded-xl h-fit text-purple-600"><Zap size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Analyzer (X-Ray Vision)</h3>
                <p className="text-stone-600">Type any complex English word to instantly dissect it into prefixes, roots, and suffixes. See the "math formula" of how the word's meaning is constructed.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl h-fit text-emerald-600"><Library size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Word Tree & Matrix</h3>
                <p className="text-stone-600">Explore word families visually. Use the Matrix Builder to combine prefixes and suffixes with a root to discover new words. Includes Bilingual Cognate Mapping to Sino-Vietnamese roots.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-amber-100 p-3 rounded-xl h-fit text-amber-600"><Trophy size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Logic Puzzles</h3>
                <p className="text-stone-600">Test your skills as a language detective. Solve morphology chains and decoding puzzles to earn extra XP and solidify your understanding.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pro vs Base Comparison */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
          <h2 className="text-2xl font-bold font-serif text-stone-900 mb-6 flex items-center gap-2">
            <Star className="text-amber-500" size={24} />
            Account Tiers: Base vs Pro
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="py-4 font-bold text-stone-900">Feature</th>
                  <th className="py-4 font-bold text-stone-500 text-center">Base Account</th>
                  <th className="py-4 font-bold text-amber-600 text-center">Pro Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-4 text-stone-800">Core Curriculum & Garden</td>
                  <td className="py-4 text-stone-500 text-center"><Check className="mx-auto" size={20} /></td>
                  <td className="py-4 text-amber-600 text-center"><Check className="mx-auto" size={20} /></td>
                </tr>
                <tr>
                  <td className="py-4 text-stone-800">Tier Assessments</td>
                  <td className="py-4 text-stone-500 text-center">Shared Pool (Limited)</td>
                  <td className="py-4 text-amber-600 font-bold text-center">AI Generated (Unlimited)</td>
                </tr>
                <tr>
                  <td className="py-4 text-stone-800">Morphology Analyzer (X-Ray)</td>
                  <td className="py-4 text-stone-500 text-center"><X className="mx-auto text-stone-300" size={20} /></td>
                  <td className="py-4 text-amber-600 text-center"><Check className="mx-auto" size={20} /></td>
                </tr>
                <tr>
                  <td className="py-4 text-stone-800">Word Tree & Matrix Builder</td>
                  <td className="py-4 text-stone-500 text-center"><X className="mx-auto text-stone-300" size={20} /></td>
                  <td className="py-4 text-amber-600 text-center"><Check className="mx-auto" size={20} /></td>
                </tr>
                <tr>
                  <td className="py-4 text-stone-800">Logic Puzzles</td>
                  <td className="py-4 text-stone-500 text-center"><X className="mx-auto text-stone-300" size={20} /></td>
                  <td className="py-4 text-amber-600 text-center"><Check className="mx-auto" size={20} /></td>
                </tr>
                <tr>
                  <td className="py-4 text-stone-800">Bilingual Cognate Mapping</td>
                  <td className="py-4 text-stone-500 text-center"><X className="mx-auto text-stone-300" size={20} /></td>
                  <td className="py-4 text-amber-600 text-center"><Check className="mx-auto" size={20} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
