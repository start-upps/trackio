// src/components/EditHabitDialog.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Habit, HabitUpdateInput } from "@/types/habit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type EditHabitDialogProps = {
  habit: Habit;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: Partial<HabitUpdateInput>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

const COLORS = [
  "#E040FB", "#FFB300", "#00BCD4", "#4CAF50", 
  "#F44336", "#FF9800", "#9C27B0", "#3F51B5",
] as const;

const ICONS = [
  "📝", "💪", "🎯", "📚", "🏃‍♂️", "🧘‍♂️", 
  "💻", "🎨", "🎵", "✍️", "🏋️‍♂️", "🎮",
] as const;

const LIMITS = {
  name: 50,
  description: 100
} as const;

type FormState = {
  name: string;
  description: string;
  color: typeof COLORS[number];
  icon: typeof ICONS[number];
};

type FormErrors = {
  name?: string;
  description?: string;
  global?: string;
};

export function EditHabitDialog({
  habit,
  open = false,
  onOpenChange,
  onSubmit,
  onDelete,
}: EditHabitDialogProps) {
  const [formState, setFormState] = useState<FormState>(() => ({
    name: habit.name,
    description: habit.description,
    color: habit.color as typeof COLORS[number],
    icon: habit.icon as typeof ICONS[number],
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
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
        color: habit.color as typeof COLORS[number],
        icon: habit.icon as typeof ICONS[number],
      });
      setShowDeleteConfirm(false);
      setErrors({});
      setIsDirty(false);
    }
  }, [open, habit]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formState.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formState.name.trim().length > LIMITS.name) {
      newErrors.name = `Name must be less than ${LIMITS.name} characters`;
      isValid = false;
    }

    if (!formState.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formState.description.trim().length > LIMITS.description) {
      newErrors.description = `Description must be less than ${LIMITS.description} characters`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formState]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!isDirty) {
      onOpenChange?.(false);
      return;
    }

    const toastId = toast.loading("Updating habit...");
    setIsLoading(true);

    try {
      await onSubmit({
        name: formState.name.trim(),
        description: formState.description.trim(),
        color: formState.color,
        icon: formState.icon,
      });
      toast.success("Habit updated successfully", { id: toastId });
      onOpenChange?.(false);
    } catch (error) {
      console.error("Error updating habit:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update habit", { id: toastId });
      setErrors(prev => ({
        ...prev,
        global: "Failed to update habit. Please try again."
      }));
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
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit", { id: toastId });
      setErrors(prev => ({
        ...prev,
        global: "Failed to delete habit. Please try again."
      }));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = useCallback(
    (field: keyof FormState, value: string | typeof COLORS[number] | typeof ICONS[number]) => {
      setFormState(prev => ({
        ...prev,
        [field]: value
      }));
      setIsDirty(true);

      if (errors[field as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }
    },
    [errors]
  );

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onOpenChange?.(false);
    }
  }, [isLoading, onOpenChange]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleClose}
    >
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

        {errors.global && (
          <div className="text-sm text-red-500 mb-4">
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="habit-name" className="block text-sm font-medium mb-1">
              Name
              <span className="text-gray-400 text-xs ml-2">
                ({formState.name.length}/{LIMITS.name})
              </span>
            </label>
            <input
              id="habit-name"
              ref={nameInputRef}
              type="text"
              value={formState.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={cn(
                "w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-colors",
                errors.name && "border-red-500",
              )}
              required
              maxLength={LIMITS.name}
              disabled={isLoading}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="habit-description" className="block text-sm font-medium mb-1">
              Description
              <span className="text-gray-400 text-xs ml-2">
                ({formState.description.length}/{LIMITS.description})
              </span>
            </label>
            <textarea
              id="habit-description"
              value={formState.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={cn(
                "w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-colors resize-none h-20",
                errors.description && "border-red-500",
              )}
              required
              maxLength={LIMITS.description}
              disabled={isLoading}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Habit color">
              {COLORS.map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInputChange('color', color)}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all duration-200",
                    formState.color === color && "ring-2 ring-white shadow-lg",
                  )}
                  style={{ backgroundColor: color }}
                  disabled={isLoading}
                  role="radio"
                  aria-checked={formState.color === color}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Habit icon">
              {ICONS.map((icon) => (
                <motion.button
                  key={icon}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInputChange('icon', icon)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center bg-gray-700",
                    "transition-all duration-200",
                    formState.icon === icon && "ring-2 ring-white shadow-lg bg-gray-600",
                  )}
                  disabled={isLoading}
                  role="radio"
                  aria-checked={formState.icon === icon}
                  aria-label={`Icon ${icon}`}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-4 border-t border-gray-700">
            <div>
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

            <AnimatePresence mode="wait">
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
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Confirm Delete"
                    )}
                  </Button>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" disabled={isLoading}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !isDirty}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}