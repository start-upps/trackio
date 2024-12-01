// src/components/HabitGridView.tsx
"use client";

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOptimisticHabits } from './providers/OptimisticProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Habit, HabitEntry, DayData, HabitGridViewProps } from '@/types/habit';

export function HabitGridView({ habits }: HabitGridViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toggleHabit, isPending } = useOptimisticHabits();
  
  const days: DayData[] = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  }).map(date => ({
    date,
    dateStr: format(date, 'yyyy-MM-dd'),
    isCompleted: false,
    isToday: isToday(date),
    isFuture: isBefore(startOfDay(new Date()), startOfDay(date))
  }));

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleToggle = async (habitId: string, date: Date) => {
    if (isPending) return;
    await toggleHabit(habitId, date.toISOString());
  };

  return (
    <div className="w-full bg-gray-900/95 rounded-xl p-6 border border-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="h-8"
          >
            Today
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="relative overflow-x-auto">
        <div className="min-w-max">
          {/* Date headers */}
          <div className="grid grid-cols-[200px_repeat(31,40px)] gap-1 mb-4">
            <div className="text-sm font-medium text-gray-400">Habits</div>
            {days.map(day => (
              <div 
                key={day.dateStr}
                className={cn(
                  "text-center text-sm font-medium",
                  day.isToday && "text-blue-400"
                )}
              >
                {format(day.date, 'd')}
              </div>
            ))}
          </div>

          {/* Habits grid */}
          <div className="space-y-3">
            {habits.map((habit: Habit) => (
              <div 
                key={habit.id}
                className="grid grid-cols-[200px_repeat(31,40px)] gap-1 items-center"
              >
                {/* Habit name */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: habit.color }}
                  >
                    {habit.icon}
                  </div>
                  <div className="truncate">
                    <div className="font-medium">{habit.name}</div>
                    <div className="text-sm text-gray-400 truncate">
                      {habit.description}
                    </div>
                  </div>
                </div>

                {/* Day circles */}
                {days.map(day => {
                  const entry: HabitEntry | undefined = habit.entries.find(
                    (entry: HabitEntry) => format(new Date(entry.date), 'yyyy-MM-dd') === day.dateStr
                  );
                  
                  return (
                    <TooltipProvider key={day.dateStr}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => !day.isFuture && handleToggle(habit.id, day.date)}
                            disabled={isPending || day.isFuture}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              "transition-all duration-200",
                              day.isToday && "ring-2 ring-white ring-offset-2 ring-offset-gray-900",
                              day.isFuture && "opacity-50 cursor-not-allowed"
                            )}
                            style={{
                              backgroundColor: entry?.completed ? habit.color : 'transparent',
                              border: `2px solid ${habit.color}`,
                              opacity: entry?.completed ? 1 : 0.3
                            }}
                          >
                            {entry?.completed && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-white text-sm"
                              >
                                ✓
                              </motion.span>
                            )}
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p>{format(day.date, 'MMMM d, yyyy')}</p>
                            <p className={cn(
                              entry?.completed ? "text-green-400" : "text-gray-400",
                              day.isFuture && "text-gray-500"
                            )}>
                              {day.isFuture 
                                ? 'Future date' 
                                : entry?.completed 
                                ? "Completed" 
                                : "Not completed"}
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
    </div>
  );
}