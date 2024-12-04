// src/components/CalendarHabitView.tsx
import React, { useState } from 'react';
import { 
  format, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval, 
  isToday,
  addWeeks,
  subWeeks,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Habit } from '@/types/habit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => Promise<void>;
  onDelete?: (habitId: string) => Promise<void>;
  onEdit?: (habitId: string) => void;
}

export default function CalendarView({ habits, onToggleHabit, onDelete, onEdit }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const days = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  });

  const handleToggle = async (habitId: string, date: Date) => {
    if (isToday(date)) {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      await onToggleHabit(habitId, today.toISOString());
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {format(days[0], 'MMMM d')} - {format(days[days.length - 1], 'MMMM d, yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(prev => subWeeks(prev, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(prev => addWeeks(prev, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg border border-gray-800">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b border-r border-gray-800 text-left w-[200px]">Habit</th>
              {days.map(day => (
                <th 
                  key={day.toISOString()}
                  className={cn(
                    "p-2 border-b border-r border-gray-800 text-center min-w-[40px]",
                    isToday(day) && "bg-gray-800/50"
                  )}
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => (
              <tr key={habit.id} className="border-b border-gray-800">
                <td className="p-4 border-r border-gray-800">
                  <div className="flex items-center justify-between group">
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(habit.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(habit.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
                {days.map(day => {
                  const dayIsToday = isToday(day);
                  const isCompleted = habit.entries.some(entry => 
                    isSameDay(new Date(entry.date), day) && entry.completed
                  );

                  return (
                    <td
                      key={day.toISOString()}
                      className={cn(
                        "border-r border-gray-800",
                        dayIsToday && "bg-gray-800/50"
                      )}
                    >
                      <button
                        onClick={() => handleToggle(habit.id, day)}
                        disabled={!dayIsToday}
                        className={cn(
                          "w-full h-12 flex items-center justify-center",
                          "transition-all duration-200",
                          !dayIsToday && "opacity-50 cursor-not-allowed"
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
                            className={cn(
                              "w-6 h-6 rounded-full border-2",
                              dayIsToday ? "opacity-100 hover:opacity-75" : "opacity-25"
                            )}
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