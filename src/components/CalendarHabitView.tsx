// src/components/CalendarHabitView.tsx
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Habit, HabitUpdateInput } from '@/types/habit';

interface CalendarViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => Promise<void>;
}
interface CalendarHabitViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => Promise<void>;
  onDelete?: (habitId: string) => Promise<void>;
  onUpdate?: (habitId: string, data: Partial<HabitUpdateInput>) => Promise<void>;
}

export default function CalendarView({ habits, onToggleHabit }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  return (
    <div className="w-full space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative overflow-x-auto border border-gray-800 rounded-lg">
        <table className="w-full border-collapse bg-gray-900/50">
          <thead>
            <tr>
              <th className="p-4 border-b border-r border-gray-800 text-left w-[200px]">
                Habit
              </th>
              {days.map(day => (
                <th 
                  key={day.toISOString()}
                  className="p-2 border-b border-r border-gray-800 text-center min-w-[40px]"
                >
                  <div className="text-sm font-medium">
                    {format(day, 'd')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(day, 'EEE')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => (
              <tr key={habit.id} className="border-b border-gray-800">
                <td className="p-4 border-r border-gray-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: habit.color }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-gray-400">
                        {habit.description}
                      </div>
                    </div>
                  </div>
                </td>
                {days.map(day => {
                  const isCompleted = habit.entries.some(
                    entry => format(new Date(entry.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                  );
                  
                  return (
                    <td 
                      key={day.toISOString()}
                      className="border-r border-gray-800"
                    >
                      <button
                        onClick={() => onToggleHabit(habit.id, day.toISOString())}
                        className={cn(
                          "w-full h-10 flex items-center justify-center",
                          "transition-all duration-200"
                        )}
                      >
                        {isCompleted ? (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: habit.color }}
                          >
                            ✓
                          </div>
                        ) : (
                          <div
                            className="w-6 h-6 rounded-full border-2 opacity-25 hover:opacity-50"
                            style={{ borderColor: habit.color }}
                          />
                        )}
                      </button>
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