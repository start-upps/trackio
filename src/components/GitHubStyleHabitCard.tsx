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
  // Generate grid data for the full year view
  const gridData = Array.from({ length: 371 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (370 - i));
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      date,
      dateStr,
      isCompleted: habit.entries.some(
        entry => format(new Date(entry.date), "yyyy-MM-dd") === dateStr && entry.completed
      ),
      isToday: isToday(date)
    };
  });

  // Get unique months for labels
  const months = Array.from(new Set(gridData.map(d => format(d.date, "MMM"))));

  return (
    <div className="space-y-4">
      {/* Month labels */}
      <div className="grid grid-cols-53 gap-[1px] text-xs text-gray-500 pl-12">
        {months.map(month => (
          <div key={month} className="col-span-4">{month}</div>
        ))}
      </div>

      {/* Main grid with day labels */}
      <div className="flex">
        <div className="flex flex-col gap-[1px] pr-2 text-xs text-gray-500">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        <div className="grid grid-cols-53 gap-[1px]">
          {gridData.map(day => (
            <TooltipProvider key={day.dateStr}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => onToggle?.(day.date.toISOString())}
                    className={cn(
                      "w-4 h-4 rounded-[1px] cursor-pointer transition-all",
                      "hover:ring-1 hover:ring-white/50"
                    )}
                    style={{
                      backgroundColor: habit.color,
                      opacity: day.isCompleted ? 1 : 0.1
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>{format(day.date, "MMMM d, yyyy")}</p>
                  <p className={day.isCompleted ? "text-green-400" : "text-gray-400"}>
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