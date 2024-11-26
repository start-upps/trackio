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
} from "recharts";
import { format, startOfWeek, eachDayOfInterval, subWeeks } from "date-fns";
import type { Habit } from "@/types/habit";

function prepareWeeklyData(habit: Habit) {
  const endDate = new Date();
  const startDate = subWeeks(endDate, 4);

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
      week: format(startOfWeek(day), "MMM dd"),
    };
  });
}

function prepareCompletionRateData(habit: Habit) {
  const weeks = [];
  const endDate = new Date();
  const startDate = subWeeks(endDate, 4);

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const weekStart = startOfWeek(currentDate);
    const weekStr = format(weekStart, "MMM dd");

    const weekEntries = habit.entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate >= weekStart &&
        entryDate < startOfWeek(currentDate, { weekStartsOn: 1 })
      );
    });

    const completionRate =
      weekEntries.length > 0
        ? (weekEntries.filter((e) => e.completed).length / weekEntries.length) *
          100
        : 0;

    weeks.push({
      week: weekStr,
      rate: Math.round(completionRate),
    });

    currentDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  }

  return weeks;
}

interface HabitChartsProps {
  habit: Habit;
}

export function HabitCharts({ habit }: HabitChartsProps) {
  const weeklyData = prepareWeeklyData(habit);
  const completionData = prepareCompletionRateData(habit);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 mt-4"
    >
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">Daily Completion</h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="date" stroke="#666" fontSize={12} interval={6} />
              <YAxis stroke="#666" fontSize={12} ticks={[0, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.375rem",
                }}
              />
              <Bar
                dataKey="completed"
                fill={habit.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">
          Weekly Completion Rate
        </h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={completionData}>
              <XAxis dataKey="week" stroke="#666" fontSize={12} />
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
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={habit.color}
                strokeWidth={2}
                dot={{ fill: habit.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
