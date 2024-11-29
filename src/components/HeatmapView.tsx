// src/components/HeatmapView.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { type Habit } from "@/types/habit";
import {
  format,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  getMonth,
  subYears,
  getDay,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface HeatmapViewProps {
  habit: Habit;
}

export function HeatmapView({ habit }: HeatmapViewProps) {
  const [yearOffset, setYearOffset] = useState(0);
  
  const year = useMemo(() => subYears(new Date(), yearOffset), [yearOffset]);
  const startDate = startOfYear(year);
  const endDate = endOfYear(year);

  const days = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate]
  );

  const getIntensity = useCallback(
    (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const entry = habit.entries.find(
        (e) => format(new Date(e.date), "yyyy-MM-dd") === dateStr
      );
      return entry?.completed ? 1 : 0;
    },
    [habit.entries]
  );

  // Get unique months for the header
  const months = Array.from(
    new Set(days.map((day) => getMonth(day)))
  );

  // Calculate weeks for the grid
  const weeks = days.reduce<Date[][]>((acc, date) => {
    const weekIndex = Math.floor(
      (date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    if (!acc[weekIndex]) {
      acc[weekIndex] = [];
    }
    acc[weekIndex].push(date);
    return acc;
  }, []);

  return (
    <div className="mt-6 space-y-4">
      {/* Year Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Contribution History ({year.getFullYear()})
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setYearOffset(yearOffset + 1)}
            disabled={yearOffset >= 5}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setYearOffset(yearOffset - 1)}
            disabled={yearOffset <= 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex pl-8">
        {months.map((month) => (
          <div
            key={month}
            className="flex-1 text-xs text-gray-400"
            style={{ marginLeft: month === 0 ? '0' : '-8px' }}
          >
            {format(new Date(year.getFullYear(), month), "MMM")}
          </div>
        ))}
      </div>

      {/* Day Labels and Grid */}
      <div className="flex">
        {/* Day of Week Labels */}
        <div className="flex flex-col gap-2 pr-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div key={day} className="h-3 text-xs text-gray-400">
              {index % 2 === 0 ? day : ""}
            </div>
          ))}
        </div>

        {/* Contribution Grid */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = week.find((d) => getDay(d) === dayIndex);
                if (!day) return <div key={dayIndex} className="w-3 h-3" />;

                const intensity = getIntensity(day);
                
                return (
                  <TooltipProvider key={dayIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.2 }}
                          className={cn(
                            "w-3 h-3 rounded-sm transition-colors cursor-pointer",
                            intensity === 0 && "opacity-10"
                          )}
                          style={{
                            backgroundColor: habit.color,
                            opacity: intensity ? 0.2 + intensity * 0.8 : 0.1,
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p>{format(day, "MMMM d, yyyy")}</p>
                          <p
                            className={cn(
                              intensity ? "text-green-400" : "text-gray-400"
                            )}
                          >
                            {intensity ? "Completed" : "Not completed"}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}