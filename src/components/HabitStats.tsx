// src/components/HabitStats.tsx
"use client";

import { motion } from "framer-motion";
import { 
  Flame, 
  Trophy,
  Calendar,
  TrendingUp 
} from "lucide-react";
import { calculateHabitStats } from "@/lib/stats";
import type { Habit } from "@/types/habit";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
  delay?: number;
}

function StatCard({ 
  label, 
  value, 
  icon, 
  color,
  subtext, 
  delay = 0 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn(
        "bg-gray-800/50 rounded-xl p-4",
        "border border-gray-800",
        "hover:border-gray-700/50 transition-all duration-200"
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <p className="text-sm text-gray-400 font-medium">{label}</p>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold" style={{ color }}>
            {value}
          </p>
          {subtext && (
            <p className="text-sm text-gray-500">{subtext}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function HabitStats({ habit }: { habit: Habit }) {
  const stats = calculateHabitStats(habit);

  const statCards = [
    {
      label: "Current Streak",
      value: stats.currentStreak,
      subtext: "days",
      icon: <Flame className="w-5 h-5" style={{ color: "#FF6B6B" }} />,
      color: "#FF6B6B",
      delay: 0.1
    },
    {
      label: "Longest Streak",
      value: stats.longestStreak,
      subtext: "days",
      icon: <Trophy className="w-5 h-5" style={{ color: "#FFB300" }} />,
      color: "#FFB300",
      delay: 0.2
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: <TrendingUp className="w-5 h-5" style={{ color: "#4CAF50" }} />,
      color: "#4CAF50",
      delay: 0.3
    },
    {
      label: "Days Tracked",
      value: stats.daysTracked,
      icon: <Calendar className="w-5 h-5" style={{ color: "#2196F3" }} />,
      color: "#2196F3",
      delay: 0.4
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {statCards.map((card, index) => (
        <StatCard
          key={index}
          label={card.label}
          value={card.value}
          subtext={card.subtext}
          icon={card.icon}
          color={card.color}
          delay={card.delay}
        />
      ))}
    </div>
  );
}