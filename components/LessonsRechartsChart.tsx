import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { UserProgress } from '../types';
import {
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Flame,
  Target,
  ChevronRight,
  Info
} from 'lucide-react';
import { deriveWeeklyData } from './ProgressChart';

interface LessonsRechartsChartProps {
  progress: UserProgress;
  onStartLesson?: () => void;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomRechartsTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const lessons = data.lessons || 0;
    const xp = data.xp || 0;

    // Visual motivational message based on performance
    let motivationBadge = '🌱 Khởi động vững chắc';
    let motivationMessage = 'Mỗi bài học là một bước tiến mới!';
    if (lessons >= 5) {
      motivationBadge = '👑 Phong Độ Đỉnh Cao!';
      motivationMessage = 'Bạn đang tiến bộ vượt bậc so với tuần trước!';
    } else if (lessons >= 3) {
      motivationBadge = '🔥 Đạt Chuẩn Xuất Sắc!';
      motivationMessage = 'Đạt và vượt mục tiêu bài học mỗi tuần!';
    } else if (lessons >= 1) {
      motivationBadge = '⚡ Duy Trì Nhịp Học';
      motivationMessage = 'Giữ vững đà tiến để tạo phản xạ tự nhiên!';
    }

    return (
      <div className="bg-stone-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-stone-700/80 text-xs min-w-[210px] animate-fadeIn">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2.5">
          <span className="font-bold text-amber-400 text-sm">{data.label}</span>
          <span className="text-[10px] text-stone-400 font-mono">{data.dateRange}</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-stone-300 flex items-center gap-1.5 font-medium">
              <BookOpen size={13} className="text-emerald-400" /> Số bài hoàn thành:
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {lessons} bài
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-300 flex items-center gap-1.5 font-medium">
              <Zap size={13} className="text-amber-400" /> XP tích lũy:
            </span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              +{xp} XP
            </span>
          </div>
        </div>

        <div className="bg-stone-800/90 rounded-xl p-2.5 border border-stone-700/60">
          <div className="font-bold text-[11px] text-amber-300 flex items-center gap-1">
            <span>{motivationBadge}</span>
          </div>
          <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">
            {motivationMessage}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const LessonsRechartsChart: React.FC<LessonsRechartsChartProps> = ({
  progress,
  onStartLesson,
  className = ''
}) => {
  // Option to view last 30 days (4 weeks) or 60 days (8 weeks)
  const [timeSpan, setTimeSpan] = useState<'30days' | '60days'>('30days');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  const weeksCount = timeSpan === '30days' ? 4 : 8;

  // Derive weekly data for the last 30 days (or 60 days)
  const data = useMemo(() => {
    return deriveWeeklyData(progress, weeksCount);
  }, [progress, weeksCount]);

  // Key stats for visual motivation
  const stats = useMemo(() => {
    const totalLessons = data.reduce((acc, d) => acc + (d.lessons || 0), 0);
    const totalXP = data.reduce((acc, d) => acc + (d.xp || 0), 0);
    const avgLessons = (totalLessons / data.length).toFixed(1);
    const peakWeek = [...data].sort((a, b) => (b.lessons || 0) - (a.lessons || 0))[0];
    const currentWeek = data.find(d => d.isCurrentWeek) || data[data.length - 1];
    const currentLessons = currentWeek?.lessons || 0;
    const weeklyGoal = 3; // 3 lessons per week recommendation
    const goalPercent = Math.min(100, Math.round((currentLessons / weeklyGoal) * 100));

    return {
      totalLessons,
      totalXP,
      avgLessons,
      peakWeek,
      currentLessons,
      weeklyGoal,
      goalPercent
    };
  }, [data]);

  // Max lessons for Y axis ceiling
  const maxLessons = Math.max(5, ...data.map(d => d.lessons || 0));

  return (
    <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp size={18} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Biểu đồ Recharts
            </span>
            <span className="text-xs font-semibold text-stone-500">
              30 Ngày Gần Nhất
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Số Bài Học Hoàn Thành Mỗi Tuần
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Biểu đồ đường trực quan theo dõi tần suất hoàn thành bài học trong 30 ngày qua để tạo động lực học tập bền bỉ.
          </p>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Style Toggle */}
          <div className="bg-stone-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartType === 'line'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Đường Line
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartType === 'area'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Vùng Area
            </button>
          </div>

          {/* Time Span Toggle */}
          <div className="bg-stone-100 p-1 rounded-xl flex items-center text-xs font-semibold text-stone-600">
            <button
              onClick={() => setTimeSpan('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeSpan === '30days'
                  ? 'bg-white font-bold text-stone-900 shadow-xs'
                  : 'hover:text-stone-900'
              }`}
            >
              30 ngày (4 tuần)
            </button>
            <button
              onClick={() => setTimeSpan('60days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeSpan === '60days'
                  ? 'bg-white font-bold text-stone-900 shadow-xs'
                  : 'hover:text-stone-900'
              }`}
            >
              60 ngày (8 tuần)
            </button>
          </div>
        </div>
      </div>

      {/* Motivational Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {/* Total Lessons */}
        <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng bài 30 ngày</span>
            <BookOpen size={16} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {stats.totalLessons}
            </span>
            <span className="text-xs text-stone-500 font-medium">bài học</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            +{stats.totalXP} XP tích lũy
          </p>
        </div>

        {/* Weekly Average */}
        <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Trung bình tuần</span>
            <TrendingUp size={16} className="text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {stats.avgLessons}
            </span>
            <span className="text-xs text-stone-500 font-medium">bài / tuần</span>
          </div>
          <p className="text-[11px] text-stone-500 font-medium mt-1">
            Nhịp độ khuyến nghị: 3 bài
          </p>
        </div>

        {/* Peak Week */}
        <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tuần cao điểm</span>
            <Award size={16} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {stats.peakWeek?.lessons || 0}
            </span>
            <span className="text-xs text-stone-500 font-medium">bài</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1 truncate">
            {stats.peakWeek?.label} ({stats.peakWeek?.dateRange})
          </p>
        </div>

        {/* Current Week Goal Progress */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 p-4 rounded-2xl transition-all hover:shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mục tiêu tuần này</span>
            <Target size={16} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900">
              {stats.currentLessons} / {stats.weeklyGoal}
            </span>
            <span className="text-xs text-emerald-700 font-medium">bài</span>
          </div>
          <div className="w-full bg-emerald-200/60 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.goalPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="w-full h-72 sm:h-80 pt-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: -10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="lessonsLineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                dy={8}
              />

              <YAxis
                allowDecimals={false}
                domain={[0, maxLessons + 1]}
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val} bài`}
              />

              <Tooltip content={<CustomRechartsTooltip />} />

              {/* Reference Line for weekly recommended goal */}
              <ReferenceLine
                y={3}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '🎯 Mục tiêu tuần (3 bài)',
                  position: 'insideTopRight',
                  fill: '#d97706',
                  fontSize: 11,
                  fontWeight: 600
                }}
              />

              {/* Recharts Line for Lessons */}
              <Line
                type="monotone"
                dataKey="lessons"
                name="Số bài học"
                stroke="#059669"
                strokeWidth={3.5}
                dot={{
                  r: 5,
                  fill: '#ffffff',
                  stroke: '#059669',
                  strokeWidth: 3
                }}
                activeDot={{
                  r: 8,
                  fill: '#059669',
                  stroke: '#ffffff',
                  strokeWidth: 3,
                  className: 'animate-pulse'
                }}
                animationDuration={1200}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: -10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="lessonsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                dy={8}
              />

              <YAxis
                allowDecimals={false}
                domain={[0, maxLessons + 1]}
                stroke="#94a3b8"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val} bài`}
              />

              <Tooltip content={<CustomRechartsTooltip />} />

              <ReferenceLine
                y={3}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '🎯 Mục tiêu tuần (3 bài)',
                  position: 'insideTopRight',
                  fill: '#d97706',
                  fontSize: 11,
                  fontWeight: 600
                }}
              />

              <Area
                type="monotone"
                dataKey="lessons"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#lessonsAreaGrad)"
                dot={{
                  r: 4,
                  fill: '#ffffff',
                  stroke: '#059669',
                  strokeWidth: 2.5
                }}
                activeDot={{
                  r: 7,
                  fill: '#059669',
                  stroke: '#ffffff',
                  strokeWidth: 3
                }}
                animationDuration={1200}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Motivational Bottom Callout Bar */}
      <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-600">
          <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
            <Flame size={15} className="text-orange-500 animate-pulse" />
          </span>
          <span>
            {stats.currentLessons >= stats.weeklyGoal ? (
              <strong className="text-emerald-700">
                Xuất sắc! Bạn đã hoàn thành {stats.currentLessons} bài học trong tuần này (đạt {stats.goalPercent}% mục tiêu).
              </strong>
            ) : (
              <span>
                Bạn đã hoàn thành <strong>{stats.currentLessons} bài học</strong> trong tuần này. Cần thêm <strong>{stats.weeklyGoal - stats.currentLessons} bài</strong> nữa để đạt mục tiêu tuần!
              </span>
            )}
          </span>
        </div>

        {onStartLesson && (
          <button
            onClick={onStartLesson}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Học tiếp ngay</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
