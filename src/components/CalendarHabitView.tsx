// src/components/CalendarHabitView.tsx
import React, { useState } from 'react';
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Habit } from '@/types/habit';

interface CalendarHabitViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => Promise<void>;
}

export default function CalendarHabitView({ habits, onToggleHabit }: CalendarHabitViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full rounded-xl overflow-hidden bg-gray-900/50">
      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}
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
            onClick={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800/50">
              <th className="p-3 text-left font-medium border-b border-r border-gray-800 min-w-[200px]">
                Habit
              </th>
              {days.map((day, index) => (
                <th
                  key={day.toISOString()}
                  className={cn(
                    "p-2 text-center border-b border-r border-gray-800 min-w-[40px]",
                    isToday(day) && "bg-gray-800"
                  )}
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  <div className="text-xs text-gray-500">{weekDays[day.getDay()]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => (
              <tr key={habit.id} className="border-b border-gray-800">
                <td className="p-3 border-r border-gray-800 bg-gray-900/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: habit.color }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-gray-400">{habit.description}</div>
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
                      className={cn(
                        "border-r border-gray-800",
                        isToday(day) && "bg-gray-800/50"
                      )}
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => onToggleHabit(habit.id, day.toISOString())}
                        className="w-full h-12 flex items-center justify-center"
                      >
                        {isCompleted ? (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: habit.color }}
                          >
                            ✓
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full border-2 opacity-25 transition-opacity hover:opacity-50"
                            style={{ borderColor: habit.color }}
                          />
                        )}
                      </motion.button>
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