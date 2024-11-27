// src/components/EditHabitDialog.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Habit } from "@/types/habit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditHabitDialogProps {
  habit: Habit;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: Partial<Habit>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const COLORS = [
  "#E040FB", // Purple
  "#FFB300", // Amber
  "#00BCD4", // Cyan
  "#4CAF50", // Green
  "#F44336", // Red
  "#FF9800", // Orange
  "#9C27B0", // Deep Purple
  "#3F51B5", // Indigo
];

const ICONS = [
  "📝",
  "💪",
  "🎯",
  "📚",
  "🏃‍♂️",
  "🧘‍♂️",
  "💻",
  "🎨",
  "🎵",
  "✍️",
  "🏋️‍♂️",
  "🎮",
];

const INPUT_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 100;

export function EditHabitDialog({
  habit,
  open = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: EditHabitDialogProps) {
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description);
  const [color, setColor] = useState(habit.color);
  const [icon, setIcon] = useState(habit.icon);
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
      setName(habit.name);
      setDescription(habit.description);
      setColor(habit.color);
      setIcon(habit.icon);
      setShowDeleteConfirm(false);
    }
  }, [open, habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
      });
      toast.success("Habit updated successfully");
      onOpenChange?.(false);
    } catch (error) {
      toast.error("Failed to update habit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    try {
      await onDelete(habit.id);
      toast.success("Habit deleted successfully");
      onOpenChange?.(false);
    } catch (error) {
      toast.error("Failed to delete habit");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span style={{ color: color }}>{icon}</span>
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
                ({name.length}/{INPUT_MAX_LENGTH})
              </span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value.slice(0, INPUT_MAX_LENGTH))
              }
              className={cn(
                "w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-colors",
              )}
              required
              maxLength={INPUT_MAX_LENGTH}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
              <span className="text-gray-400 text-xs ml-2">
                ({description.length}/{DESCRIPTION_MAX_LENGTH})
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))
              }
              className={cn(
                "w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-colors resize-none h-20",
              )}
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all duration-200",
                    color === c && "ring-2 ring-white shadow-lg",
                  )}
                  style={{ backgroundColor: c }}
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
                  onClick={() => setIcon(i)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gray-700",
                    "transition-all duration-200",
                    icon === i && "ring-2 ring-white shadow-lg bg-gray-600",
                  )}
                >
                  {i}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4 border-t border-gray-700">
            {onDelete && (
              <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
                  <motion.div
                    key="confirm"
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
                  <motion.div
                    key="delete"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <div className="flex items-center gap-2 ml-auto">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}