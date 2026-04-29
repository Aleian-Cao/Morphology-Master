import React, { useState, useEffect } from 'react';
import { User, UserProgress, SRSRecord, PartType } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Check, X, BrainCircuit, RefreshCw, Send, Loader2 } from 'lucide-react';

interface ReviewPageProps {
  user: User;
  onBack: () => void;
  onUpdateProgress: (progress: UserProgress) => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ user, onBack, onUpdateProgress }) => {
  const [dueItems, setDueItems] = useState<SRSRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  useEffect(() => {
    const now = new Date();
    const srs = user.progress.srs || {};
    const due = Object.values(srs).filter((record) => new Date(record.nextReviewDate) <= now);
    
    // Also include some almost due items if none are strictly due, just to make testing easier
    // or we can sort by date
    setDueItems(due.sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime()));
  }, [user.progress.srs]);

  const handleAnswer = async (quality: number) => {
    const currentItem = dueItems[currentIndex];
    
    let easinessFactor = currentItem.easinessFactor ?? 2.5;
    let interval = currentItem.interval ?? 0;
    let repetitions = currentItem.repetitions ?? 0;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easinessFactor);
      }
      repetitions++;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easinessFactor < 1.3) easinessFactor = 1.3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    const updatedRecord: SRSRecord = {
      ...currentItem,
      easinessFactor,
      interval,
      repetitions,
      nextReviewDate: nextDate.toISOString()
    };

    const newProgress = { ...user.progress };
    if (!newProgress.srs) newProgress.srs = {};
    newProgress.srs[currentItem.morpheme] = updatedRecord;

    if (quality >= 4 && newProgress.weaknesses && newProgress.weaknesses[currentItem.morpheme]) {
      newProgress.weaknesses[currentItem.morpheme].mistakeCount = Math.max(0, newProgress.weaknesses[currentItem.morpheme].mistakeCount - 1);
    }

    onUpdateProgress(newProgress);

    try {
      if (user.uid) {
        await updateDoc(doc(db, "users", user.uid), { progress: newProgress });
      }
    } catch (e) {
      console.error("Failed to save SRS progress", e);
    }

    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSendReminder = async () => {
    if (!user.email) {
       setEmailStatus("Please add an email to your account first.");
       return;
    }
    setIsSendingEmail(true);
    setEmailStatus("");
    try {
      await fetch(`https://formsubmit.co/ajax/${user.email}`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `[Morphology Master] Ôn tập Spaced Repetition`,
          message: `Chào bạn,\n\nĐây là email tự động từ hệ thống Morphology Master. Bạn hiện có ${dueItems.length} hình vị cần được ôn tập lại để củng cố trí nhớ.\n\nHãy dành vài phút quay lại ứng dụng và vào mục "Ôn Tập" nhé!`,
          UserEmail: user.email,
          _template: "table"
        })
      });
      setEmailStatus("Đã gửi email nhắc nhở!");
    } catch (e) {
      console.error(e);
      setEmailStatus("Có lỗi khi gửi email.");
    }
    setIsSendingEmail(false);
  };

  if (dueItems.length === 0 || currentIndex >= dueItems.length) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col pt-16">
        <div className="flex justify-between items-center bg-white border-b border-stone-200 p-4 fixed top-0 w-full z-10 shadow-sm">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-bold">
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <BrainCircuit size={64} className="text-green-500 mb-6" />
            <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">You're all caught up!</h2>
            <p className="text-stone-500 max-w-md mb-8">No terms to review right now. Come back tomorrow or keep learning new roots.</p>
            <button onClick={onBack} className="bg-stone-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-stone-800 transition-colors">
                Trở về Dashboard
            </button>
        </div>
      </div>
    );
  }

  const currentItem = dueItems[currentIndex];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col pt-16">
      <div className="flex justify-between items-center bg-white border-b border-stone-200 p-4 fixed top-0 w-full z-10 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-bold">
          <ArrowLeft size={20} /> Pause Review
        </button>
        <div className="flex items-center gap-3">
            <div className="font-mono text-sm text-stone-500 font-bold bg-stone-100 px-3 py-1 rounded-full">
            {currentIndex + 1} / {dueItems.length}
            </div>
            
            <button 
              onClick={handleSendReminder}
              disabled={isSendingEmail}
              title="Nhắc nhở qua email"
              className="text-stone-500 hover:text-orange-500 transition-colors"
            >
              {isSendingEmail ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
        </div>
      </div>

      {emailStatus && (
         <div className="mt-4 mx-auto w-full max-w-xl bg-orange-100 text-orange-800 p-3 rounded-lg text-center font-bold text-sm">
           {emailStatus}
         </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-xl mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-stone-200 w-full flex flex-col items-center text-center">
          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
            {currentItem.type}
          </span>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-8 font-mono">
            {currentItem.morpheme}
          </h2>

          {!showAnswer ? (
            <button 
              onClick={() => setShowAnswer(true)}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-4 rounded-xl border border-stone-300 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Hiển thị nghĩa
            </button>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="mb-10 text-xl md:text-2xl text-stone-700">
                  {currentItem.meaning_vi || "Không có nghĩa tiếng Việt"}
               </div>
               
               <p className="text-sm text-stone-400 mb-4 font-medium uppercase tracking-widest">Bạn có nhớ không?</p>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={() => handleAnswer(1)} className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
                     <span className="text-xl">Quên</span>
                     <span className="text-xs text-red-500 font-medium">1 ngày</span>
                  </button>
                  <button onClick={() => handleAnswer(3)} className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
                     <span className="text-xl">Khó</span>
                     <span className="text-xs text-orange-500 font-medium">&lt; {Math.max(1, Math.round(currentItem.interval * 1.5))} ngày</span>
                  </button>
                  <button onClick={() => handleAnswer(4)} className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
                     <span className="text-xl">Tốt</span>
                     <span className="text-xs text-green-500 font-medium">{Math.max(6, Math.round(currentItem.interval * 2.5))} ngày</span>
                  </button>
                  <button onClick={() => handleAnswer(5)} className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-3 rounded-xl flex flex-col items-center gap-1 transition-colors">
                     <span className="text-xl">Dễ</span>
                     <span className="text-xs text-blue-500 font-medium">{Math.max(8, Math.round(currentItem.interval * 3.5))} ngày</span>
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
