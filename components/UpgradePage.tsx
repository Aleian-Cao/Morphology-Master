import React, { useState, useEffect } from 'react';
import { ArrowLeft, Key, CreditCard, Mail, CheckCircle, Shield, Copy, Check, X } from 'lucide-react';
import { User } from '../types';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface UpgradePageProps {
  user: User;
  onBack: () => void;
  onUpgradeSuccess: () => void;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({ user, onBack, onUpgradeSuccess }) => {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferCode, setTransferCode] = useState('');

  useEffect(() => {
    // Generate a unique transfer code for this user session
    const code = `PAY-${user.uid?.substring(0, 6).toUpperCase() || Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setTransferCode(code);
  }, [user.uid]);

  const handleClaimKey = async () => {
    if (!keyInput.trim()) {
      setError('Please enter a valid key.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const keyRef = doc(db, 'pro_keys', keyInput.trim());
      const keySnap = await getDoc(keyRef);

      if (keySnap.exists() && !keySnap.data().used) {
        // Mark key as used
        await updateDoc(keyRef, {
          used: true,
          usedBy: user.uid,
          usedAt: new Date().toISOString()
        });

        // Calculate expiration date (1 month from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        // Update user
        if (user.uid) {
          await updateDoc(doc(db, 'users', user.uid), {
            isPro: true,
            proExpiresAt: expiresAt.toISOString()
          });
        }

        setSuccess('Upgrade successful! Welcome to Pro.');
        setTimeout(() => {
          onUpgradeSuccess();
          onBack();
        }, 2000);
      } else {
        setError('Invalid or already used key.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while verifying the key.');
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-3">
            <Shield className="text-amber-500" size={36} />
            Upgrade to Pro
          </h1>
          <p className="text-stone-600 text-lg">
            Unlock AI-generated assessments and unlimited learning potential.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 mb-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6">Pro vs Base Features</h2>
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
                  <td className="py-4 text-stone-800">Tier Assessments</td>
                  <td className="py-4 text-stone-500 text-center">Shared Pool (Limited)</td>
                  <td className="py-4 text-amber-600 font-bold text-center">AI Generated (Unlimited)</td>
                </tr>
                <tr>
                  <td className="py-4 text-stone-800">Morphology Analyzer</td>
                  <td className="py-4 text-stone-500 text-center">
                    <X className="mx-auto text-stone-300" size={20} />
                  </td>
                  <td className="py-4 text-amber-600 text-center">
                    <Check className="mx-auto" size={20} />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-stone-800">Text-to-Speech</td>
                  <td className="py-4 text-stone-500 text-center">
                    <X className="mx-auto text-stone-300" size={20} />
                  </td>
                  <td className="py-4 text-amber-600 text-center">
                    <Check className="mx-auto" size={20} />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-stone-800">AI Lesson Generation</td>
                  <td className="py-4 text-stone-500 text-center">
                    <X className="mx-auto text-stone-300" size={20} />
                  </td>
                  <td className="py-4 text-amber-600 text-center">
                    <Check className="mx-auto" size={20} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <CreditCard className="text-stone-400" />
              1. Make Payment
            </h2>
            
            <div className="mb-8 flex justify-center">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block">
                <img 
                  src={`https://img.vietqr.io/image/BIDV-7101939360-compact2.png?amount=25000&addInfo=${transferCode}&accountName=Cao%20Nguyen%20Thanh%20An`} 
                  alt="VietQR Payment" 
                  className="w-48 h-48 object-contain"
                />
                <p className="text-center text-sm text-stone-500 mt-2 font-mono">Scan to Pay 25,000 VND</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-stone-500 mb-1">Account Number (BIDV)</p>
                  <p className="font-bold text-stone-800 text-lg">7101939360</p>
                </div>
                <button onClick={() => copyToClipboard('7101939360')} className="p-2 hover:bg-stone-200 rounded-lg text-stone-500">
                  <Copy size={20} />
                </button>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-sm text-stone-500 mb-1">Account Name</p>
                <p className="font-bold text-stone-800 text-lg">Cao Nguyễn Thành An</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                <div>
                  <p className="text-sm text-amber-700 mb-1 font-bold">Transfer Message (Required)</p>
                  <p className="font-mono font-bold text-amber-900 text-xl">{transferCode}</p>
                </div>
                <button onClick={() => copyToClipboard(transferCode)} className="p-2 hover:bg-amber-200 rounded-lg text-amber-700">
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Mail className="text-stone-400" />
              2. Send Confirmation
            </h2>
            <p className="text-stone-600 mb-6">
              After transferring, click the button below to send an email with your transfer code. We will reply with your Pro Key.
            </p>
            <a 
              href={`mailto:10a10caonguyenthanhan@gmail.com?subject=Upgrade Pro - ${transferCode}&body=Hello,%0D%0A%0D%0AI have transferred the payment. My transfer code is ${transferCode}.%0D%0A%0D%0AMy account email is: ${user.email || ''}%0D%0A%0D%0APlease send me my Pro Key.%0D%0A%0D%0AThank you!`}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Send Email Confirmation
            </a>
          </div>

          {/* Key Redemption */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 h-fit">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Key className="text-stone-400" />
              3. Enter Pro Key
            </h2>
            <p className="text-stone-600 mb-6">
              Once you receive your Pro Key via email, enter it below to activate your Pro account.
            </p>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border border-green-100 flex items-center gap-2">
                <CheckCircle size={20} />
                {success}
              </div>
            )}

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="PRO-XXXXXXXX"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button 
                onClick={handleClaimKey}
                disabled={loading || !keyInput}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Activate Pro'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
