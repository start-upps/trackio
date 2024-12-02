// src/components/HabitCharts.tsx
"use client";

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
} from "recharts";
import { 
  format, 
  startOfMonth,
  eachDayOfInterval, 
  subMonths,
  getDaysInMonth,
  isSameMonth,
  isToday
} from "date-fns";
import type { Habit } from "@/types/habit";

interface MonthlyDataPoint {
  date: string;
  completed: number;
  month: string;
  isToday: boolean;
}

interface CompletionDataPoint {
  month: string;
  completionRate: number;
  streak: number;
  totalDays: number;
  completedDays: number;
}

function prepareMonthlyData(habit: Habit): MonthlyDataPoint[] {
  const endDate = new Date();
  const startDate = subMonths(endDate, 2); // Show last 3 months

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
      completed: completed ? 1 : 0,
      month: format(day, "MMM"),
      isToday: isToday(day),
    };
  });
}

function prepareCompletionRateData(habit: Habit): CompletionDataPoint[] {
  const months: CompletionDataPoint[] = [];
  const endDate = new Date();
  const startDate = subMonths(endDate, 5); // Show last 6 months

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const monthStart = startOfMonth(currentDate);
    const monthStr = format(monthStart, "MMM yyyy");

    const monthEntries = habit.entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return isSameMonth(entryDate, currentDate);
    });

    const daysInMonth = getDaysInMonth(currentDate);
    const completedEntries = monthEntries.filter(e => e.completed);
    const completionRate = monthEntries.length > 0
      ? (completedEntries.length / daysInMonth) * 100
      : 0;

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
    });

    currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
  }

  return months;
}

function formatTooltipValue(value: number, key: string): [string, string] {
  if (key === "completionRate") {
    return [`${value}%`, "Completion Rate"];
  }
  return [`${value} days`, "Longest Streak"];
}

interface HabitChartsProps {
  habit: Habit;
}

export function HabitCharts({ habit }: HabitChartsProps) {
  const monthlyData = prepareMonthlyData(habit);
  const completionData = prepareCompletionRateData(habit);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 mt-4"
    >
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">Daily Completion (Last 3 Months)</h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={12} 
                interval={6}
                tickFormatter={(value) => format(new Date(value), "MMM d")}
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
                formatter={(value: number, _key: string) => [
                  value === 1 ? "Completed" : "Not completed",
                  "Status"
                ]}
                labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
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
            <LineChart data={completionData}>
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
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.375rem",
                }}
                formatter={formatTooltipValue}
              />
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}