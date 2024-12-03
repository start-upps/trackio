// src/components/HabitCharts.tsx
"use client";

import { useMemo, FC } from "react";
import { motion } from "framer-motion";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  TooltipProps
} from "recharts";
import { 
  format, 
  startOfMonth,
  eachDayOfInterval, 
  subMonths,
  getDaysInMonth,
  isSameMonth,
  isToday,
  parse
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habit";

// Enhanced types for better type safety
interface ChartDataPoint {
  date: string;
  completed: number;
  month: string;
  isToday: boolean;
  tooltipDate: string;
}

interface PerformanceDataPoint {
  month: string;
  completionRate: number;
  streak: number;
  totalDays: number;
  completedDays: number;
  avgCompletion?: number;
  trendLine?: number;
}

interface HabitChartsProps {
  habit: Habit;
  showTrendline?: boolean;
  showAverages?: boolean;
  className?: string;
}

// Data preparation functions
function prepareMonthlyData(habit: Habit): ChartDataPoint[] {
  const endDate = new Date();
  const startDate = subMonths(endDate, 2);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const completed = habit.entries.some(
      (entry) =>
        format(new Date(entry.date), "yyyy-MM-dd") === dayStr &&
        entry.completed,
    );

    return {
      date: format(day, "MMM dd"),
      tooltipDate: format(day, "MMMM d, yyyy"),
      completed: completed ? 1 : 0,
      month: format(day, "MMM"),
      isToday: isToday(day),
    };
  });
}

const calculateTrendLine = (data: PerformanceDataPoint[]): PerformanceDataPoint[] => {
  const n = data.length;
  if (n < 2) return data;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  data.forEach((point, i) => {
    sumX += i;
    sumY += point.completionRate;
    sumXY += i * point.completionRate;
    sumX2 += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((point, i) => ({
    ...point,
    trendLine: slope * i + intercept
  }));
};

function preparePerformanceData(
  habit: Habit,
  options: { showTrendline?: boolean; showAverages?: boolean }
): PerformanceDataPoint[] {
  const endDate = new Date();
  const startDate = subMonths(endDate, 5);
  const months: PerformanceDataPoint[] = [];

  let currentDate = startDate;
  let totalCompletionRate = 0;

  while (currentDate <= endDate) {
    const monthStart = startOfMonth(currentDate);
    const monthStr = format(monthStart, "MMM yyyy");
    const daysInMonth = getDaysInMonth(currentDate);

    const monthEntries = habit.entries.filter((entry) => 
      isSameMonth(new Date(entry.date), currentDate)
    );

    const completedEntries = monthEntries.filter(e => e.completed);
    const completionRate = monthEntries.length > 0
      ? (completedEntries.length / daysInMonth) * 100
      : 0;

    totalCompletionRate += completionRate;

    const streak = monthEntries.reduce((acc, entry, index, arr) => {
      if (!entry.completed) return acc;
      if (index === 0) return 1;
      
      const prevDate = new Date(arr[index - 1].date);
      const currentDate = new Date(entry.date);
      const diffDays = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return diffDays === 1 ? acc + 1 : acc;
    }, 0);

    months.push({
      month: monthStr,
      completionRate: Math.round(completionRate),
      streak,
      totalDays: daysInMonth,
      completedDays: completedEntries.length,
      ...(options.showAverages && {
        avgCompletion: Math.round(totalCompletionRate / months.length)
      })
    });

    currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
  }

  return options.showTrendline ? calculateTrendLine(months) : months;
}

// Custom tooltip component
const CustomTooltip: FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as PerformanceDataPoint;
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="font-medium">{data.month}</p>
      <div className="space-y-1 mt-2">
        <p className="text-sm text-gray-300">
          Completion Rate: {data.completionRate}%
        </p>
        <p className="text-sm text-gray-300">
          Completed Days: {data.completedDays}/{data.totalDays}
        </p>
        {data.streak > 0 && (
          <p className="text-sm text-green-400">
            Best Streak: {data.streak} days
          </p>
        )}
      </div>
    </div>
  );
};

// Main component
export const HabitCharts: FC<HabitChartsProps> = ({ 
  habit, 
  showTrendline = false,
  showAverages = false,
  className 
}) => {
  const monthlyData = useMemo(
    () => prepareMonthlyData(habit), 
    [habit]
  );

  const performanceData = useMemo(
    () => preparePerformanceData(habit, { showTrendline, showAverages }), 
    [habit, showTrendline, showAverages]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("space-y-6 mt-4", className)}
    >
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">Daily Completion (Last 3 Months)</h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={monthlyData}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={12} 
                interval={6}
                tickFormatter={(value) => format(parse(value, "MMM dd", new Date()), "MMM d")}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12} 
                ticks={[0, 1]}
                tickFormatter={(value) => value === 1 ? "Complete" : "Incomplete"}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.375rem",
                }}
                formatter={(value: number) => [
                  value === 1 ? "Completed" : "Not completed",
                  "Status"
                ]}
                labelFormatter={(label) => format(parse(label as string, "MMM dd", new Date()), "MMMM d, yyyy")}
              />
              <Bar
                dataKey="completed"
                fill={habit.color}
                radius={[4, 4, 0, 0]}
                name="Completion Status"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">
          Monthly Performance (Last 6 Months)
        </h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={performanceData}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <XAxis 
                dataKey="month" 
                stroke="#666" 
                fontSize={12}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="completionRate"
                name="Completion Rate"
                stroke={habit.color}
                strokeWidth={2}
                dot={{ fill: habit.color }}
              />
              <Line
                type="monotone"
                dataKey="streak"
                name="Longest Streak"
                stroke={`${habit.color}80`}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: `${habit.color}80` }}
              />
              {showTrendline && (
                <Line
                  type="monotone"
                  dataKey="trendLine"
                  name="Trend"
                  stroke="#666"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                />
              )}
              {showAverages && (
                <Line
                  type="monotone"
                  dataKey="avgCompletion"
                  name="Average"
                  stroke="#666"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};