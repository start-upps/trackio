// src/components/DeleteHabitDialog.tsx 
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habit";

type DeleteHabitDialogProps = {
  habit: Habit;
  onDelete: (id: string) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  className?: string;
};

export function DeleteHabitDialog({
  habit,
  onDelete,
  open,
  onOpenChange,
  trigger,
  className
}: DeleteHabitDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const toastId = toast.loading("Deleting habit...");
      await onDelete(habit.id);
      
      toast.success("Habit deleted successfully", { id: toastId });
      onOpenChange?.(false);
    } catch (err) {
      console.error("Error deleting habit:", err);
      setError("Failed to delete habit. Please try again.");
      toast.error("Failed to delete habit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setError(null);
      onOpenChange?.(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-red-400 hover:text-red-300 hover:bg-red-400/10",
              className
            )}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Habit
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent 
        className="sm:max-w-[425px]"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Delete Habit
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{habit.name}"? This action cannot
            be undone, and all tracking history will be permanently lost.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}

        <motion.div 
          className="mt-2 rounded-lg border border-red-400/20 bg-red-400/10 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <span
              className="h-8 w-8 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: habit.color }}
            >
              {habit.icon}
            </span>
            <div>
              <h4 className="font-medium text-red-400">{habit.name}</h4>
              <p className="text-sm text-gray-400">{habit.description}</p>
            </div>
          </div>
        </motion.div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => setError(null)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Habit
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
