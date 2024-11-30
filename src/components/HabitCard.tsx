// src/components/HabitCard.tsx
"use client";

import { useState } from "react";
import { format, isToday } from "date-fns";
import { Button } from "./ui/button";
import { type Habit } from "@/types/habit";
import { useOptimisticHabits } from "./providers/OptimisticProvider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Pencil,
  Archive,
  Trash2,
  MoreVertical,
  Check,
} from "lucide-react";
import { EditHabitDialog } from "./EditHabitDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HabitCardProps {
  habit: Habit;
  onUpdate?: (id: string, data: Partial<Habit>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onArchive?: (id: string) => Promise<void>;
}

export function HabitCard({
  habit,
  onUpdate,
  onDelete,
  onArchive,
}: HabitCardProps) {
  const { toggleHabit, isPending } = useOptimisticHabits();
  const [isEditing, setIsEditing] = useState(false);

  // Generate grid data for the 8x7 layout
  const gridData = Array.from({ length: 56 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (55 - i));
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

  const handleComplete = () => {
    const today = new Date().toISOString();
    toggleHabit(habit.id, today);
  };

  const handleUpdate = async (data: Partial<Habit>) => {
    if (onUpdate) {
      await onUpdate(habit.id, data);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(habit.id);
    }
  };

  const handleArchive = async () => {
    if (onArchive) {
      await onArchive(habit.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gray-900/95 rounded-xl p-4 shadow-lg",
        "border border-gray-800/50",
        "transition-all duration-200",
        isPending && "opacity-75"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "text-lg shadow-inner"
            )}
            style={{ 
              backgroundColor: `${habit.color}20`,
              color: habit.color
            }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="font-medium text-white">{habit.name}</h3>
            <p className="text-sm text-gray-400 truncate max-w-[200px]">
              {habit.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleComplete}
                  className={cn(
                    "rounded-xl w-10 h-10",
                    "transition-all duration-200",
                    gridData[gridData.length - 1].isCompleted &&
                      "bg-opacity-20 text-white"
                  )}
                  style={{
                    backgroundColor: gridData[gridData.length - 1].isCompleted 
                      ? habit.color 
                      : "transparent"
                  }}
                >
                  <Check 
                    className={cn(
                      "w-5 h-5 transition-all",
                      gridData[gridData.length - 1].isCompleted && "text-white"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark today&apos;s habit</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArchive()}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-400" 
                onClick={() => handleDelete()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-[2px]">
        {gridData.map((day) => (
          <motion.div
            key={day.dateStr}
            whileHover={{ scale: 1.2 }}
            onClick={() => toggleHabit(habit.id, day.date.toISOString())}
            className={cn(
              "aspect-square rounded-[2px] cursor-pointer",
              "transition-all duration-200"
            )}
            style={{
              backgroundColor: habit.color,
              opacity: day.isCompleted ? 1 : 0.15
            }}
          />
        ))}
      </div>

      {/* Stats Dialog */}
      <EditHabitDialog
        habit={habit}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSubmit={handleUpdate}
      />
    </motion.div>
  );
}