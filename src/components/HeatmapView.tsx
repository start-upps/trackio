// src/components/HeatmapView.tsx
"use client";

import { motion } from "framer-motion";
import { type Habit } from "@/types/habit";
import { format, eachDayOfInterval, subMonths } from "date-fns";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface HeatmapViewProps {
  habit: Habit;
}

export function HeatmapView({ habit }: HeatmapViewProps) {
  const endDate = new Date();
  const startDate = subMonths(endDate, 3);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weeks = days.reduce<Date[][]>((acc, date) => {
    const weekIndex = Math.floor(
      (date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
  
    if (!acc[weekIndex]) {
      acc[weekIndex] = [];
    }
    acc[weekIndex].push(date);
    return acc;
  }, []);

  return (
    <div className="mt-4">
      <div className="text-sm text-gray-400 mb-2">Last 3 Months</div>
      <div className="flex gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const entry = habit.entries.find(
                (e) => format(new Date(e.date), "yyyy-MM-dd") === dateStr,
              );
              const intensity = entry?.completed ? 1 : 0;

              return (
                <TooltipProvider key={dateStr}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.2 }}
                        className="w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: habit.color,
                          opacity: intensity ? 0.2 + intensity * 0.8 : 0.1,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(day, "MMMM d, yyyy")}
                      <br />
                      {entry?.completed ? "Completed" : "Not completed"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}