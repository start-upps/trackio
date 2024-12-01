// src/components/HabitCard.tsx
"use client";

import { useState } from "react";
import { format, isToday } from "date-fns";
import { Button } from "./ui/button";
import { type Habit, type HabitCardProps, type DayData, type ViewMode } from "@/types/habit";
import { useOptimisticHabits } from "./providers/OptimisticProvider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Pencil,
  Archive,
  Trash2,
  MoreVertical,
  Check,
  Calendar,
  LayoutGrid
} from "lucide-react";
import { EditHabitDialog } from "./EditHabitDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import MonthlyHabitTracker from "./MonthlyHabitTracker";

export function HabitCard({
  habit,
  onUpdate,
  onDelete,
  onArchive,
}: HabitCardProps) {
  const router = useRouter();
  const { toggleHabit, isPending } = useOptimisticHabits();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");

  // Generate weekly grid data (7 days)
  const weeklyData: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      date,
      dateStr,
      isCompleted: habit.entries.some(
        entry => format(new Date(entry.date), "yyyy-MM-dd") === dateStr && entry.completed
      ),
      isToday: isToday(date),
      isFuture: date > new Date()
    };
  });

  const todayCompleted = weeklyData[weeklyData.length - 1].isCompleted;

  const handleComplete = async () => {
    const today = new Date().toISOString();
    try {
      await toggleHabit(habit.id, today);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  const handleUpdate = async (data: Partial<Habit>) => {
    if (!onUpdate) return;
    
    try {
      setIsEditing(true);
      await onUpdate(habit.id, data);
      toast.success("Habit updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update habit");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(habit.id);
      toast.success("Habit deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete habit");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!onArchive) return;

    try {
      setIsArchiving(true);
      await onArchive(habit.id);
      toast.success(`Habit ${habit.archived ? 'unarchived' : 'archived'} successfully`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to archive habit");
    } finally {
      setIsArchiving(false);
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
        (isPending || isDeleting || isArchiving) && "opacity-75"
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
                  onClick={() => setViewMode(viewMode === "weekly" ? "monthly" : "weekly")}
                  className="rounded-xl w-10 h-10"
                >
                  {viewMode === "weekly" ? (
                    <Calendar className="w-5 h-5" />
                  ) : (
                    <LayoutGrid className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Switch to {viewMode === "weekly" ? "monthly" : "weekly"} view
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                    todayCompleted && "bg-opacity-20 text-white"
                  )}
                  style={{
                    backgroundColor: todayCompleted ? habit.color : "transparent"
                  }}
                >
                  <Check 
                    className={cn(
                      "w-5 h-5 transition-all",
                      todayCompleted && "text-white"
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark today&apos;s habit</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl"
                disabled={isDeleting || isArchiving}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setIsEditing(true)}
                disabled={isDeleting || isArchiving}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleArchive}
                disabled={isDeleting || isArchiving}
              >
                <Archive className="mr-2 h-4 w-4" />
                {habit.archived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-400" 
                onClick={handleDelete}
                disabled={isDeleting || isArchiving}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Content */}
      {viewMode === "weekly" ? (
        <div className="grid grid-cols-7 gap-[2px]">
          {weeklyData.map((day) => (
            <TooltipProvider key={day.dateStr}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    onClick={() => toggleHabit(habit.id, day.date.toISOString())}
                    disabled={day.isFuture}
                    className={cn(
                      "aspect-square rounded-[2px] cursor-pointer",
                      "transition-all duration-200",
                      day.isToday && "ring-2 ring-white ring-offset-2 ring-offset-gray-900",
                      day.isFuture && "opacity-50 cursor-not-allowed"
                    )}
                    style={{
                      backgroundColor: habit.color,
                      opacity: day.isCompleted ? 1 : 0.15
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p>{format(day.date, "MMMM d, yyyy")}</p>
                    <p className={cn(
                      day.isCompleted ? "text-green-400" : "text-gray-400",
                      day.isFuture && "text-gray-500"
                    )}>
                      {day.isFuture ? 'Future date' : day.isCompleted ? "Completed" : "Not completed"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      ) : (
        <MonthlyHabitTracker
          habits={[habit]}
          onToggleHabit={toggleHabit}
        />
      )}

      {/* Edit Dialog */}
      <EditHabitDialog
        habit={habit}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSubmit={handleUpdate}
      />
    </motion.div>
  );
}