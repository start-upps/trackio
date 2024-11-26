// src/components/HabitStats.tsx
"use client";

import { motion } from "framer-motion";
import { Flame, CheckCircle, Calendar, Percent } from "lucide-react";
import { calculateHabitStats } from "@/lib/stats";
import type { Habit } from "@/types/habit";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ label, value, icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-800 rounded-lg p-4 flex items-center gap-4"
    >
      <div className="p-2 bg-gray-700 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

export function HabitStats({ habit }: { habit: Habit }) {
  const stats = calculateHabitStats(habit);

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <StatCard
        label="Current Streak"
        value={`${stats.currentStreak} days`}
        icon={<Flame className="w-5 h-5 text-orange-500" />}
        delay={0.1}
      />
      <StatCard
        label="Longest Streak"
        value={`${stats.longestStreak} days`}
        icon={<Flame className="w-5 h-5 text-red-500" />}
        delay={0.2}
      />
      <StatCard
        label="Completion Rate"
        value={`${stats.completionRate}%`}
        icon={<Percent className="w-5 h-5 text-green-500" />}
        delay={0.3}
      />
      <StatCard
        label="Total Completions"
        value={stats.totalCompletions}
        icon={<CheckCircle className="w-5 h-5 text-blue-500" />}
        delay={0.4}
      />
    </div>
  );
}
