// src/components/EditHabitDialog.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, Archive, ArchiveRestore } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import type { Habit, HabitUpdateInput } from "@/types/habit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditHabitDialogProps {
  habit: Habit;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: Partial<HabitUpdateInput>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onArchive?: (id: string) => Promise<void>;
}

const COLORS = [
  "#E040FB", "#FFB300", "#00BCD4", "#4CAF50", 
  "#F44336", "#FF9800", "#9C27B0", "#3F51B5",
];

const ICONS = [
  "📝", "💪", "🎯", "📚", "🏃‍♂️", "🧘‍♂️", 
  "💻", "🎨", "🎵", "✍️", "🏋️‍♂️", "🎮",
];

const INPUT_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 100;

export function EditHabitDialog({
  habit,
  open = false,
  onOpenChange,
  onSubmit,
  onDelete,
  onArchive,
}: EditHabitDialogProps) {
  const [formState, setFormState] = useState({
    name: habit.name,
    description: habit.description,
    color: habit.color,
    icon: habit.icon,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setFormState({
        name: habit.name,
        description: habit.description,
        color: habit.color,
        icon: habit.icon,
      });
      setShowDeleteConfirm(false);
    }
  }, [open, habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, color, icon } = formState;

    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const toastId = toast.loading("Updating habit...");
    setIsLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
      });
      toast.success("Habit updated successfully", { id: toastId });
      onOpenChange?.(false);
    } catch (error) {
      toast.error("Failed to update habit", { id: toastId });
      console.error("Error updating habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    const toastId = toast.loading("Deleting habit...");
    setIsLoading(true);

    try {
      await onDelete(habit.id);
      toast.success("Habit deleted successfully", { id: toastId });
      onOpenChange?.(false);
    } catch (error) {
      toast.error("Failed to delete habit", { id: toastId });
      console.error("Error deleting habit:", error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleArchive = async () => {
    if (!onArchive) return;

    const action = habit.isDeleted ? "restoring" : "archiving";
    const toastId = toast.loading(`${action} habit...`);
    setIsLoading(true);

    try {
      await onArchive(habit.id);
      toast.success(`Habit ${habit.isDeleted ? "restored" : "archived"} successfully`, { id: toastId });
      onOpenChange?.(false);
    } catch (error) {
      toast.error(`Failed to ${action} habit`, { id: toastId });
      console.error(`Error ${action} habit:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((
    field: keyof typeof formState,
    value: string
  ) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span style={{ color: formState.color }}>{formState.icon}</span>
            Edit Habit
          </DialogTitle>
          <DialogDescription>
            Make changes to your habit here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
              <span className="text-gray-400 text-xs ml-2">
                ({formState.name.length}/{INPUT_MAX_LENGTH})
              </span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={formState.name}
              onChange={(e) => handleInputChange(
                'name',
                e.target.value.slice(0, INPUT_MAX_LENGTH)
              )}
              className={cn(
                "w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-colors",
              )}
              required
              maxLength={INPUT_MAX_LENGTH}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
              <span className="text-gray-400 text-xs ml-2">
                ({formState.description.length}/{DESCRIPTION_MAX_LENGTH})
              </span>
            </label>
            <textarea
              value={formState.description}
              onChange={(e) => handleInputChange(
                'description',
                e.target.value.slice(0, DESCRIPTION_MAX_LENGTH)
              )}
              className={cn(
                "w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-colors resize-none h-20",
              )}
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
              disabled={isLoading}
            />
          </div>

          {/* Color and Icon Sections */}
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInputChange('color', c)}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all duration-200",
                    formState.color === c && "ring-2 ring-white shadow-lg",
                  )}
                  style={{ backgroundColor: c }}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <motion.button
                  key={i}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInputChange('icon', i)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gray-700",
                    "transition-all duration-200",
                    formState.icon === i && "ring-2 ring-white shadow-lg bg-gray-600",
                  )}
                  disabled={isLoading}
                >
                  {i}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-2 pt-4 border-t border-gray-700">
            <div className="flex gap-2">
              {onArchive && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleArchive}
                  className="text-gray-400 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {habit.isDeleted ? (
                    <>
                      <ArchiveRestore className="w-4 h-4 mr-2" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </>
                  )}
                </Button>
              )}
              {onDelete && !showDeleteConfirm && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>

            {showDeleteConfirm ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Confirm Delete
                </Button>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}