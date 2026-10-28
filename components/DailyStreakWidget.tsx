import React from 'react';
import { Flame, Check, Sparkles, Award, Calendar, Zap, ArrowRight, ShieldAlert } from 'lucide-react';
import { UserProgress } from '../types';
import { getStreakStatus, getRecent7Days } from '../utils/streak';

interface DailyStreakWidgetProps {
  progress: UserProgress;
  onStartLesson?: () => void;
  className?: string;
}

export const DailyStreakWidget: React.FC<DailyStreakWidgetProps> = ({
  progress,
  onStartLesson,
  className = '',
}) => {
  const status = getStreakStatus(progress);
  const recentDays = getRecent7Days(progress);

  // Milestones: 3, 7, 14, 30, 50, 100 days
  const milestones = [3, 7, 14, 30, 50, 100];
  const nextMilestone = milestones.find((m) => m > status.currentStreak) || 100;
  const prevMilestone = [...milestones].reverse().find((m) => m <= status.currentStreak) || 0;
  const milestoneProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((status.currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
      )
    )
  );

  return (
    <div
      className={`bg-gradient-to-br from-white via-amber-50/40 to-orange-50/60 rounded-3xl p-6 md:p-7 border border-amber-200/80 shadow-md relative overflow-hidden ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-yellow-400/15 to-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Flame Icon + Streak Count */}
        <div className="flex items-center gap-5">
          <div className="relative group shrink-0">
            {status.isCompletedToday ? (
              // ACTIVE BURNING FLAME
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-0.5 shadow-lg shadow-orange-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  {/* Subtle animated sheen */}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 via-transparent to-yellow-200/30 animate-pulse" />
                  <Flame
                    size={42}
                    className="text-yellow-100 fill-amber-200 drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)] animate-bounce"
                    style={{ animationDuration: '2s' }}
                  />
                  {/* Glowing core badge */}
                  <div className="absolute bottom-1.5 right-1.5 bg-white text-orange-600 rounded-full p-0.5 shadow-md">
                    <Check size={12} strokeWidth={3.5} />
                  </div>
                </div>
              </div>
            ) : status.isPendingToday ? (
              // PENDING TODAY (streak alive from yesterday, needs today's action)
              <div className="relative w-20 h-20 rounded-2xl bg-amber-100 border-2 border-dashed border-amber-400 flex items-center justify-center shadow-inner">
                <Flame
                  size={40}
                  className="text-amber-500 fill-amber-400/40 transition-transform group-hover:scale-110"
                />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
                </span>
              </div>
            ) : (
              // COLD / INACTIVE FLAME
              <div className="relative w-20 h-20 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center shadow-inner text-stone-400">
                <Flame size={38} className="text-stone-300" />
                <Sparkles size={16} className="absolute top-2 right-2 text-amber-500" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                <Flame size={12} className={status.isCompletedToday ? 'text-orange-600 fill-orange-600' : 'text-amber-600'} />
                Chuỗi ngày học tập (Daily Streak)
              </span>
              {status.longestStreak > 0 && (
                <span className="text-xs text-stone-500 font-medium">
                  Kỷ lục: <strong className="text-stone-700">{status.longestStreak}</strong> ngày
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl md:text-5xl font-black font-serif text-stone-900 tracking-tight">
                {status.currentStreak}
              </span>
              <span className="text-lg font-bold text-stone-600">
                {status.currentStreak === 1 ? 'ngày' : 'ngày liên tục'}
              </span>
            </div>

            <p className="text-sm font-medium text-stone-600 mt-1 flex items-center gap-1.5">
              {status.isCompletedToday ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-800 font-semibold">{status.statusHeadline}</span>
                </>
              ) : status.isPendingToday ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-amber-900 font-semibold">{status.statusHeadline}</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-stone-400"></span>
                  <span className="text-stone-600">{status.statusHeadline}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right: 7-Day Visual Tracker + Action */}
        <div className="flex flex-col md:items-end gap-3 shrink-0">
          {/* 7 Days bubbles */}
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/70 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center justify-between text-xs text-stone-500 font-medium mb-2 px-1">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-amber-600" />
                7 ngày gần nhất
              </span>
              <span className="text-[11px] text-amber-700 font-semibold">
                Mục tiêu: {nextMilestone} ngày
              </span>
            </div>

            <div className="flex items-center gap-2">
              {recentDays.map((day) => {
                return (
                  <div key={day.dateStr} className="flex flex-col items-center gap-1">
                    <span
                      className={`text-[10px] font-bold ${
                        day.isToday ? 'text-amber-700' : 'text-stone-400'
                      }`}
                    >
                      {day.dayShort}
                    </span>
                    <div
                      title={`${day.dayLabel} (${day.dateStr}): ${
                        day.isCompleted
                          ? 'Đã hoàn thành'
                          : day.isToday
                          ? 'Chưa hoàn thành hôm nay'
                          : 'Chưa học'
                      }`}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        day.isCompleted
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm ring-2 ring-amber-200'
                          : day.isToday
                          ? 'bg-white border-2 border-dashed border-amber-400 text-amber-600 ring-2 ring-amber-100'
                          : 'bg-stone-100 text-stone-300 border border-stone-200'
                      }`}
                    >
                      {day.isCompleted ? (
                        <Flame size={15} className="fill-current" />
                      ) : day.isToday ? (
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick CTA or Status Pill */}
          {!status.isCompletedToday && onStartLesson && (
            <button
              onClick={onStartLesson}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:shadow-lg transition-all group w-full md:w-auto"
            >
              <span>Học ngay để thắp sáng</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {status.isCompletedToday && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
              <Check size={14} className="text-emerald-600" />
              <span>Mục tiêu hôm nay đã xong! Hẹn gặp bạn ngày mai.</span>
            </div>
          )}
        </div>
      </div>

      {/* Milestone Progress Bar Footer */}
      <div className="mt-5 pt-4 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-600">
          <Award size={15} className="text-amber-600" />
          <span>
            Cột mốc tiếp theo: <strong>{nextMilestone} ngày</strong>{' '}
            <span className="text-stone-400">
              (còn {Math.max(0, nextMilestone - status.currentStreak)} ngày nữa)
            </span>
          </span>
        </div>

        <div className="w-full sm:w-48 bg-stone-200/80 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${milestoneProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Streak Badge for Layout Header
 */
export const StreakBadge: React.FC<{
  progress: UserProgress;
  onClick?: () => void;
}> = ({ progress, onClick }) => {
  const status = getStreakStatus(progress);

  return (
    <button
      onClick={onClick}
      title={
        status.isCompletedToday
          ? `Chuỗi ${status.currentStreak} ngày: Hôm nay đã hoàn thành!`
          : status.isPendingToday
          ? `Chuỗi ${status.currentStreak} ngày: Chưa học hôm nay`
          : 'Bắt đầu chuỗi học tập mới!'
      }
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
        status.isCompletedToday
          ? 'bg-amber-100/90 text-orange-950 border-amber-300 shadow-xs hover:bg-amber-200'
          : status.isPendingToday
          ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
      }`}
    >
      <Flame
        size={16}
        className={`${
          status.isCompletedToday
            ? 'text-orange-500 fill-orange-500 animate-pulse'
            : status.isPendingToday
            ? 'text-amber-500'
            : 'text-stone-400'
        }`}
      />
      <span>{status.currentStreak}</span>
      <span className="hidden sm:inline font-medium text-[11px] text-stone-500">
        {status.isCompletedToday ? '🔥' : 'ngày'}
      </span>
    </button>
  );
};
