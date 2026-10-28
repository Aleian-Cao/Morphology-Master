import React, { useState } from 'react';
import {
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  Settings,
  ChevronRight,
  Plus,
  Flame,
  Award,
  X,
  Zap,
  TrendingUp,
  Check
} from 'lucide-react';
import { UserProgress, DailyGoalType } from '../types';
import {
  getDailyGoalStatus,
  updateDailyGoalSettings,
  recordDailyGoalProgress
} from '../utils/dailyGoal';
import { soundFX } from '../utils/soundEffects';

interface DailyGoalWidgetProps {
  progress: UserProgress;
  onUpdateProgress?: (updated: UserProgress) => void;
  onStartLesson?: () => void;
  className?: string;
}

const LESSON_PRESETS = [
  { value: 1, label: '1 bài / ngày', desc: 'Khởi động nhẹ nhàng (5–10 phút)' },
  { value: 2, label: '2 bài / ngày', desc: 'Cân bằng lý tưởng (Khuyến nghị ⭐)', recommended: true },
  { value: 3, label: '3 bài / ngày', desc: 'Tăng tốc bứt phá (15–20 phút)' },
  { value: 5, label: '5 bài / ngày', desc: 'Chinh phục chuyên sâu (30+ phút)' }
];

const MINUTE_PRESETS = [
  { value: 10, label: '10 phút / ngày', desc: 'Duy trì phản xạ từ vựng' },
  { value: 15, label: '15 phút / ngày', desc: 'Nhẹ nhàng & đều đặn (Khuyến nghị ⭐)', recommended: true },
  { value: 20, label: '20 phút / ngày', desc: 'Tiến bộ nhanh chóng' },
  { value: 30, label: '30 phút / ngày', desc: 'Chuyên sâu & toàn diện' }
];

export const DailyGoalWidget: React.FC<DailyGoalWidgetProps> = ({
  progress,
  onUpdateProgress,
  onStartLesson,
  className = ''
}) => {
  const status = getDailyGoalStatus(progress);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<DailyGoalType>(status.type);
  const [selectedTarget, setSelectedTarget] = useState<number>(status.target);
  const [customInput, setCustomInput] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Open modal with current progress config
  const handleOpenModal = () => {
    soundFX.playCardFlip();
    setSelectedType(status.type);
    setSelectedTarget(status.target);
    setCustomInput('');
    setShowModal(true);
  };

  // Save new goal settings
  const handleSaveGoal = () => {
    const finalTarget = customInput ? Math.max(1, parseInt(customInput, 10) || selectedTarget) : selectedTarget;
    const updated = updateDailyGoalSettings(progress, {
      type: selectedType,
      target: finalTarget
    });

    soundFX.playCardFlip();
    if (onUpdateProgress) {
      onUpdateProgress(updated);
    }
    setShowModal(false);
  };

  // Quick manual study time logger (e.g. user studied flashcards / phonics)
  const handleAddMinutes = (mins: number) => {
    soundFX.playXpGain();
    const { updatedProgress, isNewlyCompleted } = recordDailyGoalProgress(progress, {
      minutes: mins
    });

    if (isNewlyCompleted) {
      soundFX.playLessonComplete();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }

    if (onUpdateProgress) {
      onUpdateProgress(updatedProgress);
    }
  };

  // Quick manual lesson increment
  const handleAddLessonQuick = () => {
    soundFX.playXpGain();
    const { updatedProgress, isNewlyCompleted } = recordDailyGoalProgress(progress, {
      lessons: 1
    });

    if (isNewlyCompleted) {
      soundFX.playLessonComplete();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }

    if (onUpdateProgress) {
      onUpdateProgress(updatedProgress);
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl p-6 md:p-7 border border-stone-200/90 shadow-sm relative overflow-hidden transition-all hover:shadow-md ${className}`}
    >
      {/* Subtle background glow */}
      <div
        className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          status.isCompleted
            ? 'bg-emerald-400/20'
            : 'bg-amber-400/15'
        }`}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Section: Target Info & Progress Bar */}
        <div className="flex-1 space-y-3.5">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`p-2 rounded-xl flex items-center justify-center shadow-xs transition-colors ${
                  status.isCompleted
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {status.isCompleted ? (
                  <CheckCircle2 size={20} className="animate-bounce" />
                ) : (
                  <Target size={20} />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                    Mục Tiêu Học Tập Hôm Nay
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      status.isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {status.type === 'lessons' ? '📚 Theo bài học' : '⏱️ Theo thời gian'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  {status.motivationalHeadline}
                </p>
              </div>
            </div>

            {/* Percentage Badge & Settings Button */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide flex items-center gap-1 ${
                  status.isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status.isCompleted && <Sparkles size={12} />}
                {status.percentage}%
              </span>

              <button
                onClick={handleOpenModal}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200 shadow-2xs"
                title="Cài đặt mục tiêu ngày"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
              <span className="flex items-center gap-1.5">
                {status.type === 'lessons' ? (
                  <>
                    <BookOpen size={13} className="text-emerald-600" />
                    Đã hoàn thành: <strong className="text-stone-900">{status.current}</strong> / {status.target} bài
                  </>
                ) : (
                  <>
                    <Clock size={13} className="text-indigo-600" />
                    Đã học: <strong className="text-stone-900">{status.current}</strong> / {status.target} phút
                  </>
                )}
              </span>

              <span className="text-[11px] text-stone-500">
                {status.isCompleted ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> Đạt chỉ tiêu
                  </span>
                ) : (
                  <span>Còn thiếu <strong>{status.remaining} {status.unitLabel}</strong></span>
                )}
              </span>
            </div>

            {/* Glowing animated progress bar */}
            <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-stone-200/80 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${
                  status.isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm'
                    : 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500'
                }`}
                style={{ width: `${Math.max(4, status.percentage)}%` }}
              >
                {/* Visual shimmer shine */}
                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Subtext description & Bonus XP note */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-0.5">
            <span className="text-[11px] leading-relaxed">
              {status.motivationalSubtext}
            </span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
              <Zap size={11} className="text-amber-600" /> +50 XP thưởng khi đạt 100%
            </span>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex sm:flex-col items-center sm:items-stretch gap-2 shrink-0 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-6">
          {onStartLesson && (
            <button
              onClick={onStartLesson}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer group"
            >
              <span>{status.isCompleted ? 'Học thêm bài' : 'Học bài ngay'}</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Quick Study Logger Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAddMinutes(5)}
              className="flex-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-2xs"
              title="Ghi nhận 5 phút học tự do / flashcard"
            >
              <Clock size={12} className="text-indigo-600" />
              <span>+5p học</span>
            </button>

            <button
              onClick={handleAddLessonQuick}
              className="flex-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-2xs"
              title="Ghi nhận 1 bài học đã ôn luyện"
            >
              <BookOpen size={12} className="text-emerald-600" />
              <span>+1 bài</span>
            </button>
          </div>
        </div>
      </div>

      {/* Celebration Popup Toast */}
      {showCelebration && (
        <div className="absolute inset-x-4 bottom-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between text-xs animate-in zoom-in-95 duration-300 z-20">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
            <div>
              <span className="font-bold block">🎉 Chúc mừng bạn đã hoàn thành mục tiêu ngày!</span>
              <span className="text-[11px] text-emerald-100">Đã cộng +50 XP thưởng vào thành tích của bạn.</span>
            </div>
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="text-white/80 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Goal Customization Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Cài Đặt Mục Tiêu Ngày
                </h3>
                <p className="text-xs text-stone-500">
                  Chọn hình thức và cường độ học tập phù hợp nhất với quỹ thời gian của bạn.
                </p>
              </div>
            </div>

            {/* Target Type Switcher */}
            <div className="bg-stone-100 p-1 rounded-2xl flex items-center mb-6 text-xs font-bold border border-stone-200">
              <button
                onClick={() => {
                  soundFX.playCardFlip();
                  setSelectedType('lessons');
                  setSelectedTarget(2);
                  setCustomInput('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  selectedType === 'lessons'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <BookOpen size={15} className={selectedType === 'lessons' ? 'text-emerald-600' : ''} />
                <span>Theo số bài học</span>
              </button>
              <button
                onClick={() => {
                  soundFX.playCardFlip();
                  setSelectedType('minutes');
                  setSelectedTarget(15);
                  setCustomInput('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  selectedType === 'minutes'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Clock size={15} className={selectedType === 'minutes' ? 'text-indigo-600' : ''} />
                <span>Theo thời gian (phút)</span>
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-2.5 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block px-1">
                Gợi ý mức độ phù hợp:
              </span>

              {(selectedType === 'lessons' ? LESSON_PRESETS : MINUTE_PRESETS).map((preset) => {
                const isSelected = selectedTarget === preset.value && !customInput;
                return (
                  <button
                    key={preset.value}
                    onClick={() => {
                      soundFX.playCardFlip();
                      setSelectedTarget(preset.value);
                      setCustomInput('');
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300/60 shadow-xs'
                        : 'bg-stone-50 hover:bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-stone-900 block">
                          {preset.label}
                        </span>
                        <span className="text-xs text-stone-500">
                          {preset.desc}
                        </span>
                      </div>
                    </div>

                    {preset.recommended && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Khuyên dùng
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="mb-6 pt-3 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-600 block mb-1.5 px-1">
                Hoặc tự nhập con số mục tiêu mong muốn:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    if (e.target.value) {
                      setSelectedTarget(parseInt(e.target.value, 10) || 1);
                    }
                  }}
                  placeholder={`Ví dụ: ${selectedType === 'lessons' ? '4 bài' : '25 phút'}`}
                  className="w-full text-sm px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
                <span className="absolute right-3.5 top-3 text-xs text-stone-400 font-semibold pointer-events-none">
                  {selectedType === 'lessons' ? 'bài học / ngày' : 'phút / ngày'}
                </span>
              </div>
            </div>

            {/* Reward Note */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs flex items-center gap-2.5 mb-6">
              <Zap size={16} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Động lực mỗi ngày:</strong> Hoàn thành chỉ tiêu sẽ mang lại cho bạn <strong>+50 XP</strong> và thắp sáng chuỗi ngày kiên trì.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 font-bold text-xs sm:text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveGoal}
                className="flex-1 py-3 font-bold text-xs sm:text-sm bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check size={16} /> Lưu mục tiêu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
