import { UserProgress } from '../types';

/**
 * Returns YYYY-MM-DD string in user's local timezone.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates day difference (calendar days) between two YYYY-MM-DD strings.
 */
export const getDayDifference = (fromDateStr: string, toDateStr: string): number => {
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  
  const diffTime = date2.getTime() - date1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  isPendingToday: boolean; // Had streak yesterday, but hasn't completed today yet
  isBroken: boolean;       // Missed more than 1 day
  todayDate: string;
  lastActiveDate?: string;
  statusHeadline: string;
  statusSubtext: string;
}

/**
 * Evaluates current streak status based on user progress and today's date.
 */
export const getStreakStatus = (progress: UserProgress): StreakStatus => {
  const today = getLocalDateString();
  const lastActive = progress.lastActiveDate;
  const recordedStreak = progress.streak || 0;
  const longest = Math.max(progress.longestStreak || 0, recordedStreak);

  if (!lastActive) {
    return {
      currentStreak: 0,
      longestStreak: longest,
      isCompletedToday: false,
      isPendingToday: false,
      isBroken: false,
      todayDate: today,
      lastActiveDate: undefined,
      statusHeadline: 'Chưa thắp sáng ngọn lửa',
      statusSubtext: 'Hoàn thành 1 bài học hôm nay để bắt đầu chuỗi ngày học tập!',
    };
  }

  const diff = getDayDifference(lastActive, today);

  if (diff === 0) {
    // Completed today
    return {
      currentStreak: recordedStreak > 0 ? recordedStreak : 1,
      longestStreak: Math.max(longest, recordedStreak > 0 ? recordedStreak : 1),
      isCompletedToday: true,
      isPendingToday: false,
      isBroken: false,
      todayDate: today,
      lastActiveDate: lastActive,
      statusHeadline: `Ngọn lửa bùng cháy: ${recordedStreak > 0 ? recordedStreak : 1} ngày liên tiếp!`,
      statusSubtext: 'Tuyệt vời! Bạn đã hoàn thành mục tiêu học tập ngày hôm nay.',
    };
  }

  if (diff === 1) {
    // Completed yesterday, not yet today -> streak is pending
    return {
      currentStreak: recordedStreak,
      longestStreak: longest,
      isCompletedToday: false,
      isPendingToday: true,
      isBroken: false,
      todayDate: today,
      lastActiveDate: lastActive,
      statusHeadline: `Duy trì chuỗi ${recordedStreak} ngày!`,
      statusSubtext: 'Hoàn thành 1 bài học hôm nay trước 23:59 để giữ ngọn lửa không bị dập tắt.',
    };
  }

  // diff > 1: missed at least one full day -> streak reset
  return {
    currentStreak: 0,
    longestStreak: longest,
    isCompletedToday: false,
    isPendingToday: false,
    isBroken: true,
    todayDate: today,
    lastActiveDate: lastActive,
    statusHeadline: 'Ngọn lửa đã tắt',
    statusSubtext: 'Hãy học ngay 1 bài để tái thắp sáng ngọn lửa và lập kỷ lục mới!',
  };
};

/**
 * Updates streak when an activity/lesson is completed.
 */
export const recordStreakActivity = (progress: UserProgress): {
  updatedProgress: UserProgress;
  isFirstCompletionToday: boolean;
  newStreak: number;
} => {
  const today = getLocalDateString();
  const lastActive = progress.lastActiveDate;
  const currentStreak = progress.streak || 0;
  const currentLongest = progress.longestStreak || currentStreak;

  let newStreak = currentStreak;
  let isFirstCompletionToday = false;

  if (!lastActive) {
    // First time ever
    newStreak = 1;
    isFirstCompletionToday = true;
  } else {
    const diff = getDayDifference(lastActive, today);
    if (diff === 0) {
      // Already completed today, keep current streak (ensure at least 1)
      newStreak = Math.max(currentStreak, 1);
      isFirstCompletionToday = false;
    } else if (diff === 1) {
      // Completed yesterday, advance streak
      newStreak = currentStreak + 1;
      isFirstCompletionToday = true;
    } else {
      // Missed one or more days, restart streak at 1
      newStreak = 1;
      isFirstCompletionToday = true;
    }
  }

  const updatedHistory = Array.from(new Set([...(progress.streakHistory || []), today]));
  const updatedLongest = Math.max(currentLongest, newStreak);

  const updatedProgress: UserProgress = {
    ...progress,
    streak: newStreak,
    longestStreak: updatedLongest,
    lastActiveDate: today,
    streakHistory: updatedHistory,
  };

  return {
    updatedProgress,
    isFirstCompletionToday,
    newStreak,
  };
};

export interface RecentDayItem {
  dayLabel: string;
  dayShort: string;
  dateStr: string;
  isToday: boolean;
  isCompleted: boolean;
  isPast: boolean;
}

/**
 * Generates status for the past 7 days (including today) for visual streak visualization.
 */
export const getRecent7Days = (progress: UserProgress): RecentDayItem[] => {
  const today = new Date();
  const historySet = new Set(progress.streakHistory || []);
  if (progress.lastActiveDate) {
    historySet.add(progress.lastActiveDate);
  }

  const vietnameseDayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const fullVietnameseNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  const days: RecentDayItem[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayOfWeek = d.getDay();
    const isToday = i === 0;

    days.push({
      dayLabel: fullVietnameseNames[dayOfWeek],
      dayShort: vietnameseDayNames[dayOfWeek],
      dateStr,
      isToday,
      isPast: i > 0,
      isCompleted: historySet.has(dateStr),
    });
  }

  return days;
};
