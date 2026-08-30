/** 阅读统计深化：日历热力图聚合与每日目标连续达标计算 */

/** 热度等级：结构性序数（0 无阅读 → 4 远超目标），非业务阈值 */
const LEVEL_NONE = 0;
const LEVEL_LIGHT = 1;
const LEVEL_MODERATE = 2;
const LEVEL_STRONG = 3;
const LEVEL_INTENSE = 4;
const DAYS_PER_WEEK = 7;
/** goalMinutes 未设置（≤0）时的兜底目标 */
const FALLBACK_GOAL_MINUTES = 30;

export interface HeatmapCell {
  /** 本地日期 YYYY-MM-DD */
  date: string;
  minutes: number;
  // eslint-disable-next-line no-magic-numbers -- 等级为结构性序数枚举，见上方 LEVEL_* 常量
  level: 0 | 1 | 2 | 3 | 4;
}

/** 本地日期字符串（避免 toISOString 的 UTC 换算错日问题） */
export function toLocalDateStr(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function levelFor(minutes: number, goalMinutes: number): HeatmapCell['level'] {
  if (minutes <= 0) return LEVEL_NONE;
  const goal = goalMinutes > 0 ? goalMinutes : FALLBACK_GOAL_MINUTES;
  if (minutes < goal / 2) return LEVEL_LIGHT;
  if (minutes < goal) return LEVEL_MODERATE;
  if (minutes < goal * 2) return LEVEL_STRONG;
  return LEVEL_INTENSE;
}

export interface DayMinutes {
  date: string;
  minutes: number;
}

/**
 * 构建日历热力图：以今天所在周（周日起始）为最后一列，向前共 `weeks` 列。
 * 无阅读的天也生成单元格（level 0）。
 */
export function buildReadingHeatmap(
  sessions: DayMinutes[],
  goalMinutes: number,
  weeks: number,
  today: Date = new Date()
): HeatmapCell[] {
  const minutesByDate = new Map<string, number>();
  for (const s of sessions) {
    minutesByDate.set(s.date, (minutesByDate.get(s.date) ?? 0) + s.minutes);
  }

  const totalDays = weeks * DAYS_PER_WEEK;
  // 以「本周周日」为最后一列起点，向前共 weeks 列（每列周日到周六）
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const start = new Date(weekStart);
  start.setDate(weekStart.getDate() - (weeks - 1) * DAYS_PER_WEEK);

  const cells: HeatmapCell[] = [];
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const date = toLocalDateStr(day);
    const minutes = minutesByDate.get(date) ?? 0;
    cells.push({ date, minutes, level: levelFor(minutes, goalMinutes) });
  }
  return cells;
}

/** 今日阅读分钟数 */
export function getTodayMinutes(sessions: DayMinutes[], today: Date = new Date()): number {
  const todayStr = toLocalDateStr(today);
  return sessions.filter((s) => s.date === todayStr).reduce((sum, s) => sum + s.minutes, 0);
}

/**
 * 每日目标连续达标天数：从今天向前数；今天尚未达标不算中断，
 * 但只有今天达标时才把今天计入；昨天及之前中断即停止。
 */
export function getGoalStreak(sessions: DayMinutes[], goalMinutes: number, today: Date = new Date()): number {
  if (goalMinutes <= 0) return 0;
  const minutesByDate = new Map<string, number>();
  for (const s of sessions) {
    minutesByDate.set(s.date, (minutesByDate.get(s.date) ?? 0) + s.minutes);
  }

  const met = (date: Date) => {
    const key = toLocalDateStr(date);
    return (minutesByDate.get(key) ?? 0) >= goalMinutes;
  };

  let streak = 0;
  const cursor = new Date(today);
  if (!met(cursor)) {
    cursor.setDate(cursor.getDate() - 1); // 今天未达标：从昨天起算（今天还有机会）
  }
  while (met(cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
