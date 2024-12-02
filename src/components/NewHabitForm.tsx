// src/components/NewHabitForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateHabitRequest } from "@/types/habit";

const COLORS = [
  "#E040FB", // Purple
  "#FFB300", // Amber
  "#00BCD4", // Cyan
  "#4CAF50", // Green
  "#F44336", // Red
  "#FF9800", // Orange
] as const;

const ICONS = ["📝", "💪", "🎯", "📚", "🏃‍♂️", "🧘‍♂️", "💻", "🎨", "🎵", "✍️"] as const;

const INPUT_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 100;

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
}

interface ColorButtonProps {
  color: typeof COLORS[number];
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function ColorButton({ color, isSelected, isDisabled, onClick }: ColorButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
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

interface IconButtonProps {
  icon: typeof ICONS[number];
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function IconButton({ icon, isSelected, isDisabled, onClick }: IconButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
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

export function NewHabitForm({ onClose }: NewHabitFormProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length > INPUT_MAX_LENGTH) {
      newErrors.name = `Name must be less than ${INPUT_MAX_LENGTH} characters`;
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.trim().length > DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Description must be less than ${DESCRIPTION_MAX_LENGTH} characters`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setLoading(false);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const toastId = toast.loading("Creating habit...");
    setLoading(true);

    try {
      const createHabitData: CreateHabitRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: formData.icon
      };

      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createHabitData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create habit");
      }

      onClose?.();
      resetForm();
      
      toast.success("Habit created successfully!", {
        id: toastId,
        duration: 2000
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/';
      
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create habit",
        { id: toastId }
      );
      setLoading(false);
    }
  }

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Preview Card */}
      <div 
        className="p-4 rounded-xl border border-gray-800 bg-gray-900/50"
        style={{ backgroundColor: `${formData.color}10` }}
        role="region"
        aria-label="Habit preview"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: formData.color }}
          >
            {formData.icon}
          </div>
          <div>
            <h3 className="font-medium text-white">
              {formData.name || "Habit Name"}
            </h3>
            <p className="text-sm text-gray-400">
              {formData.description || "Habit Description"}
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="habit-name"
            className="block text-sm font-medium mb-1.5 text-gray-300"
          >
            Name
            <span className="text-gray-400 text-xs ml-2">
              ({formData.name.length}/{INPUT_MAX_LENGTH})
            </span>
          </label>
          <input
            id="habit-name"
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
            maxLength={INPUT_MAX_LENGTH}
            disabled={loading}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(
              "w-full px-3 py-2 bg-gray-800/50 rounded-xl",
              "border border-gray-700/50",
              "focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
              "transition-colors duration-200",
              loading && "opacity-50 cursor-not-allowed",
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
              ({formData.description.length}/{DESCRIPTION_MAX_LENGTH})
            </span>
          </label>
          <input
            id="habit-description"
            type="text"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            required
            maxLength={DESCRIPTION_MAX_LENGTH}
            disabled={loading}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
            className={cn(
              "w-full px-3 py-2 bg-gray-800/50 rounded-xl",
              "border border-gray-700/50",
              "focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
              "transition-colors duration-200",
              loading && "opacity-50 cursor-not-allowed",
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
                isDisabled={loading}
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
                isDisabled={loading}
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
          onClick={() => {
            resetForm();
            onClose?.();
          }}
          disabled={loading}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className={cn(
            "rounded-xl",
            "bg-gradient-to-r from-blue-500 to-purple-500",
            "hover:from-blue-600 hover:to-purple-600"
          )}
        >
          {loading ? (
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
