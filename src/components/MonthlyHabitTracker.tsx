// src/components/MonthlyHabitTracker.tsx
"use client";

import { useState, useMemo, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import type { Habit } from "@/types/habit";

interface MonthlyViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => Promise<void>;
  className?: string;
}

interface DayButtonProps {
  day: Date;
  habit: Habit;
  isCompleted: boolean;
  isFuture: boolean;
  onToggle: () => void;
}

function DayButton({ day, habit, isCompleted, isFuture, onToggle }: DayButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className={cn(
              "w-full h-12 flex items-center justify-center",
              "transition-all duration-200",
              !isFuture && "hover:bg-gray-800",
              isFuture && "opacity-50 cursor-not-allowed"
            )}
            style={{ color: habit.color }}
            disabled={isFuture}
            aria-label={`${habit.name} for ${format(day, 'MMMM d, yyyy')}`}
          >
            {isCompleted ? (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: habit.color }}
              >
                ✓
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-current opacity-25" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{format(day, 'MMMM d, yyyy')}</p>
          <p className={cn(
            isCompleted ? 'text-green-400' : 'text-gray-400',
            isFuture && 'text-gray-500'
          )}>
            {isFuture ? 'Future date' : isCompleted ? 'Completed' : 'Not completed'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function MonthlyView({ habits, onToggleHabit, className }: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handleDateChange = useCallback((increment: number) => {
    setCurrentDate(date => {
      const newDate = new Date(date);
      newDate.setMonth(date.getMonth() + increment);
      return newDate;
    });
  }, []);

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex items-center justify-between mb-4 sticky left-0 z-10">
        <h2 className="text-xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDateChange(-1)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="h-8 px-2 text-sm"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDateChange(1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th 
                className="p-3 text-left border-b border-r border-gray-800 min-w-[200px] sticky left-0 bg-gray-900 z-20"
                scope="col"
              >
                Habit
              </th>
              {daysInMonth.map((day) => (
                <th 
                  key={day.getTime()} 
                  className={cn(
                    "p-3 text-center border-b border-r border-gray-800 w-12",
                    isToday(day) && "bg-gray-800"
                  )}
                  scope="col"
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="border-b border-gray-800">
                <td className="p-3 border-r border-gray-800 sticky left-0 bg-gray-900 z-10">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: habit.color }}
                    >
                      {habit.icon}
                    </span>
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-gray-500">{habit.description}</div>
                    </div>
                  </div>
                </td>
                {daysInMonth.map((day) => {
                  const isCompleted = habit.entries.some(
                    entry => isSameDay(new Date(entry.date), day) && entry.completed
                  );
                  const isFuture = day > new Date();
                  
                  return (
                    <td 
                      key={day.getTime()} 
                      className={cn(
                        "border-r border-gray-800",
                        isToday(day) && "bg-gray-800/50"
                      )}
                    >
                      <DayButton
                        day={day}
                        habit={habit}
                        isCompleted={isCompleted}
                        isFuture={isFuture}
                        onToggle={() => !isFuture && onToggleHabit(habit.id, day.toISOString())}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}