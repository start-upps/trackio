// src/components/GitHubStyleHabitCard.tsx
import { useState } from "react";
import { format, eachDayOfInterval, startOfYear, endOfYear, getMonth, subYears, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habit";

interface GitHubStyleHabitCardProps {
  habit: Habit;
  onToggle?: (date: string) => void;
}

export default function GitHubStyleHabitCard({ habit, onToggle }: GitHubStyleHabitCardProps) {
  const [yearOffset, setYearOffset] = useState(0);
  const currentYear = subYears(new Date(), yearOffset);
  
  const startDate = startOfYear(currentYear);
  const endDate = endOfYear(currentYear);
  
  // Generate all dates for the year
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Group dates by week, starting from Sunday
  const weeks = allDates.reduce((acc, date) => {
    const weekNum = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (!acc[weekNum]) acc[weekNum] = Array(7).fill(null); // Initialize with nulls
    acc[weekNum][date.getDay()] = date; // Sunday = 0, Saturday = 6
    return acc;
  }, {} as Record<number, (Date | null)[]>);

  // Get completion intensity for a date
  const getIntensity = (date: Date) => {
    const entry = habit.entries.find(e => 
      isSameDay(new Date(e.date), date)
    );
    return entry?.completed ? 0.8 : 0;
  };

  // Get month labels
  const months = Array.from(new Set(allDates.map(date => getMonth(date))));

  return (
    <div className="mt-4">
      {/* Year Navigation */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setYearOffset(prev => prev + 1)}
          className="h-6 w-6"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <span className="text-sm text-gray-400">
          {format(currentYear, 'yyyy')}
        </span>
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

      <div className="flex flex-col gap-1">
        {/* Month Labels */}
        <div className="flex text-xs text-gray-500 pl-4">
          {months.map(month => (
            <div
              key={month}
              style={{ width: `${100 / 12}%` }}
              className="text-center"
            >
              {format(new Date(currentYear.getFullYear(), month), 'MMM')}
            </div>
          ))}
        </div>
        
        {/* Contribution Graph */}
        <div className="relative flex gap-0.5">
          {/* Day Labels */}
          <div className="flex flex-col gap-2 text-[10px] text-gray-500 pr-2">
            <span>Sun</span>
            <span>Tue</span>
            <span>Thu</span>
            <span>Sat</span>
          </div>
          
          {/* Weeks */}
          {Object.values(weeks).map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((date, dayIndex) => {
                if (!date) return <div key={dayIndex} className="w-2.5 h-2.5" />;
                
                const intensity = getIntensity(date);
                
                return (
                  <TooltipProvider key={dayIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onToggle?.(date.toISOString())}
                          className={cn(
                            "w-2.5 h-2.5 rounded-sm transition-all duration-200",
                            "hover:ring-1 hover:ring-white hover:ring-opacity-50"
                          )}
                          style={{
                            backgroundColor: habit.color,
                            opacity: intensity ? 0.2 + intensity : 0.1
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="text-xs">
                          <p>{format(date, 'MMMM d, yyyy')}</p>
                          <p className={intensity ? 'text-green-400' : 'text-gray-400'}>
                            {intensity ? 'Completed' : 'Not completed'}
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