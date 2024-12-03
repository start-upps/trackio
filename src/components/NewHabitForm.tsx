// src/components/NewHabitForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateHabitRequest, CreateHabitResponse, ApiResponse } from "@/types/habit";

const COLORS = [
  "#E040FB", "#FFB300", "#00BCD4", "#4CAF50", "#F44336", "#FF9800"
] as const;

const ICONS = [
  "📝", "💪", "🎯", "📚", "🏃‍♂️", "🧘‍♂️", "💻", "🎨", "🎵", "✍️"
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

interface FormErrors {
  name?: string;
  description?: string;
}

const initialFormState: FormState = {
  name: "",
  description: "",
  color: COLORS[0],
  icon: ICONS[0]
};

interface NewHabitFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

interface ColorButtonProps {
  color: typeof COLORS[number];
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

interface IconButtonProps extends Omit<ColorButtonProps, 'color'> {
  icon: typeof ICONS[number];
}

function ColorButton({ color, isSelected, isDisabled, onClick }: ColorButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      aria-label={`Select color ${color}`}
      aria-pressed={isSelected}
      className={cn(
        "w-8 h-8 rounded-lg transition-all duration-200",
        isSelected && "ring-2 ring-white shadow-lg",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
      style={{ backgroundColor: color }}
    />
  );
}

function IconButton({ icon, isSelected, isDisabled, onClick }: IconButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      aria-label={`Select icon ${icon}`}
      aria-pressed={isSelected}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        "bg-gray-800 transition-all duration-200",
        isSelected && "ring-2 ring-white shadow-lg bg-gray-700",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {icon}
    </motion.button>
  );
}

export function NewHabitForm({ 
  onClose, 
  onSuccess,
  isLoading = false,
  setIsLoading 
}: NewHabitFormProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isLoading) {
      setFormData(initialFormState);
      setErrors({});
      setIsDirty(false);
    }
  }, [isLoading]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length > LIMITS.name) {
      newErrors.name = `Name must be less than ${LIMITS.name} characters`;
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.trim().length > LIMITS.description) {
      newErrors.description = `Description must be less than ${LIMITS.description} characters`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm() || !setIsLoading) return;
    setIsLoading(true);

    try {
      const data: CreateHabitRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon
      };

      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = (await response.json()) as ApiResponse & CreateHabitResponse;

      if (!response.ok || !result.success) {
        throw new Error(typeof result.error === 'string' ? result.error : result.error?.message || "Failed to create habit");
      }

      onSuccess?.();
      
    } catch (error) {
      console.error("Error creating habit:", error);
      setIsLoading(false);
      toast.error(error instanceof Error ? error.message : "Failed to create habit");
    }
  };

  const handleInputChange = (field: keyof FormState, value: string | typeof COLORS[number] | typeof ICONS[number]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setIsDirty(true);

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preview Card */}
      <motion.div 
        className="p-4 rounded-xl border border-gray-800 bg-gray-900/50"
        style={{ backgroundColor: `${formData.color}10` }}
        role="region"
        aria-label="Habit preview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: formData.color }}
            whileHover={{ scale: 1.05 }}
          >
            {formData.icon}
          </motion.div>
          <div>
            <h3 className="font-medium text-white">
              {formData.name || "Habit Name"}
            </h3>
            <p className="text-sm text-gray-400">
              {formData.description || "Habit Description"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="habit-name"
            className="block text-sm font-medium mb-1.5 text-gray-300"
          >
            Name
            <span className="text-gray-400 text-xs ml-2">
              ({formData.name.length}/{LIMITS.name})
            </span>
          </label>
          <input
            id="habit-name"
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
            maxLength={LIMITS.name}
            disabled={isLoading}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(
              "w-full px-3 py-2 bg-gray-800/50 rounded-xl",
              "border border-gray-700/50",
              "focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
              "transition-colors duration-200",
              isLoading && "opacity-50 cursor-not-allowed",
              errors.name && "border-red-500"
            )}
            placeholder="e.g., Morning Meditation"
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-500">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="habit-description"
            className="block text-sm font-medium mb-1.5 text-gray-300"
          >
            Description
            <span className="text-gray-400 text-xs ml-2">
              ({formData.description.length}/{LIMITS.description})
            </span>
          </label>
          <input
            id="habit-description"
            type="text"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            required
            maxLength={LIMITS.description}
            disabled={isLoading}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
            className={cn(
              "w-full px-3 py-2 bg-gray-800/50 rounded-xl",
              "border border-gray-700/50",
              "focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
              "transition-colors duration-200",
              isLoading && "opacity-50 cursor-not-allowed",
              errors.description && "border-red-500"
            )}
            placeholder="e.g., Meditate for 10 minutes every morning"
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-500">
              {errors.description}
            </p>
          )}
        </div>

        <div role="group" aria-label="Color selection">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <ColorButton
                key={color}
                color={color}
                isSelected={formData.color === color}
                isDisabled={isLoading}
                onClick={() => handleInputChange('color', color)}
              />
            ))}
          </div>
        </div>

        <div role="group" aria-label="Icon selection">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <IconButton
                key={icon}
                icon={icon}
                isSelected={formData.icon === icon}
                isDisabled={isLoading}
                onClick={() => handleInputChange('icon', icon)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !isDirty}
          className={cn(
            "rounded-xl",
            "bg-gradient-to-r from-blue-500 to-purple-500",
            "hover:from-blue-600 hover:to-purple-600"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create Habit
            </>
          )}
        </Button>
      </div>
    </form>
  );
}