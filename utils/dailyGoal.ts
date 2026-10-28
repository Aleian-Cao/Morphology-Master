import { UserProgress, DailyGoalConfig, DailyGoalType } from '../types';
import { getLocalDateString } from './streak';

export interface DailyGoalStatus {
  type: DailyGoalType;
  target: number;
  current: number;
  percentage: number;
  isCompleted: boolean;
  isNewlyCompleted?: boolean;
  remaining: number;
  unitLabel: string;
  motivationalHeadline: string;
  motivationalSubtext: string;
  currentLessonsToday: number;
  currentMinutesToday: number;
}

const DEFAULT_GOAL: DailyGoalConfig = {
  type: 'lessons',
  target: 2,
  currentLessonsToday: 0,
  currentMinutesToday: 0,
  goalCompletedDates: []
};

/**
 * Normalizes goal state and ensures today's date rollover is cleanly handled.
 */
export const getNormalizedGoalConfig = (progress: UserProgress): DailyGoalConfig => {
  const today = getLocalDateString();
  const rawGoal = progress.dailyGoal || DEFAULT_GOAL;

  // If new day, rollover counters to 0 while keeping goal preferences and history
  if (rawGoal.lastGoalDate && rawGoal.lastGoalDate !== today) {
    return {
      type: rawGoal.type || 'lessons',
      target: rawGoal.target || (rawGoal.type === 'minutes' ? 15 : 2),
      currentLessonsToday: 0,
      currentMinutesToday: 0,
      lastGoalDate: today,
      goalCompletedDates: rawGoal.goalCompletedDates || []
    };
  }

  return {
    type: rawGoal.type || 'lessons',
    target: rawGoal.target || (rawGoal.type === 'minutes' ? 15 : 2),
    currentLessonsToday: rawGoal.currentLessonsToday || 0,
    currentMinutesToday: rawGoal.currentMinutesToday || 0,
    lastGoalDate: rawGoal.lastGoalDate || today,
    goalCompletedDates: rawGoal.goalCompletedDates || []
  };
};

/**
 * Returns complete UI-ready status of the user's daily learning goal.
 */
export const getDailyGoalStatus = (progress: UserProgress): DailyGoalStatus => {
  const goal = getNormalizedGoalConfig(progress);
  const isLessons = goal.type === 'lessons';
  const current = isLessons ? goal.currentLessonsToday : goal.currentMinutesToday;
  const target = Math.max(1, goal.target);
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const isCompleted = current >= target;
  const remaining = Math.max(0, target - current);
  const unitLabel = isLessons ? 'bài học' : 'phút';

  let motivationalHeadline = '';
  let motivationalSubtext = '';

  if (isCompleted) {
    motivationalHeadline = `🎉 Xuất sắc! Đã hoàn thành 100% mục tiêu ngày!`;
    motivationalSubtext = `Bạn đã đạt ${current}/${target} ${unitLabel} hôm nay. Duy trì thói quen học tập xuất sắc này nhé!`;
  } else if (percentage >= 50) {
    motivationalHeadline = `⚡ Đang bứt phá: Đã hoàn thành ${percentage}% mục tiêu!`;
    motivationalSubtext = `Chỉ còn ${remaining} ${unitLabel} nữa là cán mốc hôm nay. Cố lên nhé!`;
  } else if (current > 0) {
    motivationalHeadline = `🌱 Khởi động thuận lợi (${current}/${target} ${unitLabel})`;
    motivationalSubtext = `Mỗi bước nhỏ đều đưa bạn đến gần hơn với mục tiêu làm chủ từ vựng!`;
  } else {
    motivationalHeadline = `🎯 Mục tiêu hôm nay: ${target} ${unitLabel}`;
    motivationalSubtext = `Bắt đầu một bài học hoặc dành vài phút luyện tập để khởi động ngày mới!`;
  }

  return {
    type: goal.type,
    target,
    current,
    percentage,
    isCompleted,
    remaining,
    unitLabel,
    motivationalHeadline,
    motivationalSubtext,
    currentLessonsToday: goal.currentLessonsToday,
    currentMinutesToday: goal.currentMinutesToday
  };
};

/**
 * Records progress towards the daily learning goal (completing a lesson or learning minutes).
 * Automatically awards +50 XP bonus on first daily goal completion of the day.
 */
export const recordDailyGoalProgress = (
  progress: UserProgress,
  delta: { lessons?: number; minutes?: number }
): { updatedProgress: UserProgress; isNewlyCompleted: boolean; bonusXp: number } => {
  const today = getLocalDateString();
  const currentGoal = getNormalizedGoalConfig(progress);
  const wasCompletedBefore = (currentGoal.type === 'lessons'
    ? currentGoal.currentLessonsToday
    : currentGoal.currentMinutesToday) >= currentGoal.target;

  const newLessons = currentGoal.currentLessonsToday + (delta.lessons || 0);
  const newMinutes = currentGoal.currentMinutesToday + (delta.minutes || 0);

  const currentVal = currentGoal.type === 'lessons' ? newLessons : newMinutes;
  const isNowCompleted = currentVal >= currentGoal.target;
  const isNewlyCompleted = !wasCompletedBefore && isNowCompleted;

  let bonusXp = 0;
  const completedDates = [...(currentGoal.goalCompletedDates || [])];

  if (isNewlyCompleted && !completedDates.includes(today)) {
    completedDates.push(today);
    bonusXp = 50; // Award 50 bonus XP for hitting daily goal!
  }

  const updatedGoal: DailyGoalConfig = {
    ...currentGoal,
    currentLessonsToday: newLessons,
    currentMinutesToday: newMinutes,
    lastGoalDate: today,
    goalCompletedDates: completedDates
  };

  const updatedProgress: UserProgress = {
    ...progress,
    xp: progress.xp + bonusXp,
    dailyGoal: updatedGoal
  };

  return { updatedProgress, isNewlyCompleted, bonusXp };
};

/**
 * Updates the user's daily goal configuration (type & target count).
 */
export const updateDailyGoalSettings = (
  progress: UserProgress,
  settings: { type: DailyGoalType; target: number }
): UserProgress => {
  const today = getLocalDateString();
  const current = getNormalizedGoalConfig(progress);

  const updatedGoal: DailyGoalConfig = {
    ...current,
    type: settings.type,
    target: Math.max(1, settings.target),
    lastGoalDate: today
  };

  return {
    ...progress,
    dailyGoal: updatedGoal
  };
};
