// src/components/GitHubStyleHabitCard.tsx
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habit";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GitHubStyleHabitCardProps {
  habit: Habit;
  onToggle?: (date: string) => void;
}

export default function GitHubStyleHabitCard({ habit, onToggle }: GitHubStyleHabitCardProps) {
  const gridData = Array.from({ length: 371 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (370 - i));
    const dateStr = format(date, "yyyy-MM-dd");
    const isCompleted = habit.entries.some(
      entry => format(new Date(entry.date), "yyyy-MM-dd") === dateStr && entry.completed
    );
    
    return {
      date,
      dateStr,
      isCompleted,
      isToday: isToday(date)
    };
  });

  const months = Array.from(new Set(gridData.map(d => format(d.date, "MMM"))));

  return (
    <div 
      className="space-y-4" 
      role="region" 
      aria-label={`Activity graph of habit: ${habit.name}`}
    >
      {/* Month labels */}
      <div 
        className="grid grid-cols-53 gap-[1px] text-xs pl-12" 
        role="row"
        aria-label="Month labels"
      >
        {months.map(month => (
          <div 
            key={month} 
            className="col-span-4 text-gray-300"
            role="columnheader"
          >
            {month}
          </div>
        ))}
      </div>

      {/* Main grid with day labels */}
      <div className="flex" role="grid">
        {/* Day labels */}
        <div 
          className="flex flex-col gap-[1px] pr-2 text-xs text-gray-300"
          role="rowheader"
          aria-label="Days of week"
        >
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        {/* Contribution grid */}
        <div 
          className="grid grid-cols-53 gap-[1px]"
          role="grid"
          aria-label="Habit completion grid"
        >
          {gridData.map(day => (
            <TooltipProvider key={day.dateStr}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onToggle?.(day.date.toISOString())}
                    className={cn(
                      "w-4 h-4 rounded-[1px] transition-all",
                      "hover:ring-1 hover:ring-white focus:ring-2 focus:ring-white",
                      "focus:outline-none"
                    )}
                    style={{
                      backgroundColor: habit.color,
                      opacity: day.isCompleted ? 1 : 0.15
                    }}
                    aria-label={`${format(day.date, "MMMM d, yyyy")}: ${
                      day.isCompleted ? "Completed" : "Not completed"
                    }`}
                    aria-pressed={day.isCompleted}
                    role="gridcell"
                  />
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="text-xs bg-gray-800 text-gray-100 border border-gray-700"
                >
                  <p className="font-medium">
                    {format(day.date, "MMMM d, yyyy")}
                  </p>
                  <p className={day.isCompleted ? "text-green-400" : "text-gray-300"}>
                    {day.isCompleted ? "Completed" : "Not completed"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
}