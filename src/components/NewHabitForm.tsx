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

type FormState = {
  name: string;
  description: string;
  color: typeof COLORS[number];
  icon: typeof ICONS[number];
};

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setLoading(false);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const { name, description, color, icon } = formData;
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating habit...");

    try {
      const createHabitData: CreateHabitRequest = {
        name: trimmedName,
        description: trimmedDescription,
        color,
        icon
      };

      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createHabitData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create habit");
      }

      onClose?.();
      resetForm();
      
      toast.success("Habit created successfully!", {
        id: loadingToast,
        duration: 2000
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/';
      
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create habit",
        { id: loadingToast }
      );
      setLoading(false);
    }
  }

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Preview Card */}
      <div 
        className="p-4 rounded-xl border border-gray-800 bg-gray-900/50"
        style={{ backgroundColor: `${formData.color}10` }}
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
          <label className="block text-sm font-medium mb-1.5 text-gray-300">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            required
            maxLength={50}
            disabled={loading}
            className={cn(
              "w-full px-3 py-2 bg-gray-800/50 rounded-xl",
              "border border-gray-700/50",
              "focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
              "transition-colors duration-200",
              loading && "opacity-50 cursor-not-allowed"
            )}
            placeholder="e.g., Morning Meditation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-300">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            required
            maxLength={100}
            disabled={loading}
            className={cn(
              "w-full px-3 py-2 bg-gray-800/50 rounded-xl",
              "border border-gray-700/50",
              "focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
              "transition-colors duration-200",
              loading && "opacity-50 cursor-not-allowed"
            )}
            placeholder="e.g., Meditate for 10 minutes every morning"
          />
        </div>

        <div>
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

        <div>
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