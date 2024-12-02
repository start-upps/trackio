// src/components/HabitRow.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil, Archive, ArchiveRestore, Trash2, MoreVertical, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HabitRowProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  onDelete?: (id: string) => Promise<void>;
  onArchive?: (id: string) => Promise<void>;
  onToggle?: (id: string, date: string) => Promise<void>;
  isLoading?: boolean;
}

export function HabitRow({
  habit,
  onEdit,
  onDelete,
  onArchive,
  onToggle,
  isLoading
}: HabitRowProps) {
  const [isActioning, setIsActioning] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || isActioning) return;

    try {
      setIsActioning(true);
      const toastId = toast.loading("Deleting habit...");
      await onDelete(habit.id);
      toast.success("Habit deleted successfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete habit");
      console.error("Error deleting habit:", error);
    } finally {
      setIsActioning(false);
    }
  };

  const handleArchive = async () => {
    if (!onArchive || isActioning) return;

    const action = habit.isDeleted ? "Restoring" : "Archiving";
    try {
      setIsActioning(true);
      const toastId = toast.loading(`${action} habit...`);
      await onArchive(habit.id);
      toast.success(`Habit ${habit.isDeleted ? "restored" : "archived"} successfully`, { id: toastId });
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()} habit`);
      console.error(`Error ${action.toLowerCase()} habit:`, error);
    } finally {
      setIsActioning(false);
    }
  };

  const handleToggle = async () => {
    if (!onToggle || isLoading) return;
    await onToggle(habit.id, new Date().toISOString());
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex items-center justify-between p-4",
        "bg-gray-900/95 rounded-xl border border-gray-800/50",
        "hover:border-gray-700/50 transition-all",
        isLoading && "opacity-75"
      )}
    >
      {/* Habit Info */}
      <div className="flex items-center gap-3 flex-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 p-0 rounded-xl"
                style={{ backgroundColor: habit.color }}
                onClick={handleToggle}
                disabled={isLoading}
              >
                <span className="text-lg">{habit.icon}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Click to mark today's habit</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div>
          <h3 className="font-medium text-white">{habit.name}</h3>
          <p className="text-sm text-gray-400">{habit.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={isActioning}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onArchive && (
              <DropdownMenuItem onClick={handleArchive} disabled={isActioning}>
                {habit.isDeleted ? (
                  <>
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restore
                  </>
                ) : (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isActioning}
                  className="text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Complete Today Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleToggle}
              variant="ghost"
              size="icon"
              disabled={isLoading}
              className="ml-2 h-8 w-8"
            >
              <Check className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mark today's habit</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}