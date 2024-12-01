// src/components/GitHubStyleHabitCard.tsx
import React, { useState } from "react";
import { format, eachDayOfInterval, startOfYear, endOfYear, subYears, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habit";

interface GitHubStyleHabitCardProps {
  habit: Habit;
  onToggle?: (date: string) => void;
}

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const INTENSITIES = [0, 1, 2, 3, 4];

export default function GitHubStyleHabitCard({ habit, onToggle }: GitHubStyleHabitCardProps) {
  const [yearOffset, setYearOffset] = useState(0);
  const currentYear = subYears(new Date(), yearOffset);
  const startDate = startOfYear(currentYear);
  const endDate = endOfYear(currentYear);
  
  // Generate all dates for the year
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Group dates by week
  const weeks = allDates.reduce((acc, date) => {
    const weekIndex = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (!acc[weekIndex]) {
      acc[weekIndex] = Array(7).fill(null);
    }
    acc[weekIndex][date.getDay()] = date;
    return acc;
  }, {} as Record<number, (Date | null)[]>);

  // Get contribution intensity for a date (0-4)
  const getIntensity = (date: Date) => {
    if (!date) return 0;
    const entry = habit.entries.find(e => 
      isSameDay(new Date(e.date), date)
    );
    if (!entry?.completed) return 0;
    
    const dayCompletions = habit.entries.filter(e => 
      isSameDay(new Date(e.date), date) && e.completed
    ).length;
    
    if (dayCompletions >= 4) return 4;
    return dayCompletions;
  };

  return (
    <div className="pt-4">
      {/* Year Navigation */}
      <div className="flex items-center justify-end gap-2 mb-6 text-sm text-gray-400">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setYearOffset(prev => prev + 1)}
          className="h-6 w-6"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        {format(currentYear, 'yyyy')}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setYearOffset(prev => Math.max(0, prev - 1))}
          disabled={yearOffset === 0}
          className="h-6 w-6"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex flex-col">
        {/* Months */}
        <div className="flex ml-[22px] text-xs text-gray-500">
          {Array.from({ length: 12 }).map((_, month) => (
            <div 
              key={month}
              style={{ 
                width: '33px',
                marginRight: month === 11 ? '0' : '4px'
              }}
            >
              {format(new Date(currentYear.getFullYear(), month), 'MMM')}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-2 relative flex">
          {/* Day labels */}
          <div className="flex flex-col gap-[2px] mr-2 text-xs text-gray-500">
            {DAYS.map((day, i) => (
              <div key={i} className="h-[10px] leading-[10px]">{day}</div>
            ))}
          </div>

          {/* Contribution squares */}
          <div className="flex gap-[2px]">
            {Object.values(weeks).map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {week.map((date, dayIndex) => {
                  if (!date) return <div key={dayIndex} className="w-[10px] h-[10px]" />;
                  
                  const intensity = getIntensity(date);
                  
                  return (
                    <TooltipProvider key={dayIndex}>
                      <Tooltip delayDuration={50}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onToggle?.(date.toISOString())}
                            className={cn(
                              "w-[10px] h-[10px] rounded-sm",
                              "transition-all duration-200",
                              "hover:ring-2 hover:ring-gray-400"
                            )}
                            style={{
                              backgroundColor: habit.color,
                              opacity: 0.1 + (intensity * 0.2)
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {intensity ? `${intensity} contribution${intensity > 1 ? 's' : ''}` : 'No contributions'} on {format(date, 'MMMM d, yyyy')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <span>Less</span>
          {INTENSITIES.map(level => (
            <div
              key={level}
              className="w-[10px] h-[10px] rounded-sm"
              style={{
                backgroundColor: habit.color,
                opacity: 0.1 + (level * 0.2)
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}