// src/components/NewHabitForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#E040FB", // Purple
  "#FFB300", // Amber
  "#00BCD4", // Cyan
  "#4CAF50", // Green
  "#F44336", // Red
  "#FF9800", // Orange
];

const ICONS = ["📝", "💪", "🎯", "📚", "🏃‍♂️", "🧘‍♂️", "💻", "🎨", "🎵", "✍️"];

const initialFormState = {
  name: "",
  description: "",
  color: "#E040FB",
  icon: "📝"
};

export function NewHabitForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setLoading(false);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const { name, description, color, icon } = formData;
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    // Validate data
    if (!trimmedName || !trimmedDescription) {
      toast.error("Please fill in all fields");
      return;
    }

    // Start loading state immediately
    setLoading(true);

    // Show optimistic feedback
    const loadingToast = toast.loading("Creating habit...");

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          name: trimmedName, 
          description: trimmedDescription, 
          color, 
          icon 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create habit");
      }

      // Close the form first
      onClose?.();
      
      // Reset form state
      resetForm();
      
      // Update success toast
      toast.success("Habit created successfully!", {
        id: loadingToast,
        duration: 2000 // Show success for 2 seconds before refresh
      });

      // Add a small delay to ensure the toast is seen
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force a full page refresh to ensure new data is fetched
      window.location.href = '/';
      
    } catch (error) {
      console.error("Error creating habit:", error);
      
      // Update error toast
      toast.error(
        error instanceof Error ? error.message : "Failed to create habit",
        { id: loadingToast }
      );
      
      // Keep the form open on error
      setLoading(false);
    }
  }

  const handleInputChange = (field: keyof typeof initialFormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    resetForm();
    onClose?.();
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
              <motion.button
                key={color}
                type="button"
                disabled={loading}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleInputChange('color', color)}
                className={cn(
                  "w-8 h-8 rounded-lg transition-all duration-200",
                  formData.color === color && "ring-2 ring-white shadow-lg",
                  loading && "opacity-50 cursor-not-allowed"
                )}
                style={{ backgroundColor: color }}
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
              <motion.button
                key={icon}
                type="button"
                disabled={loading}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleInputChange('icon', icon)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-gray-800 transition-all duration-200",
                  formData.icon === icon && "ring-2 ring-white shadow-lg bg-gray-700",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {icon}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
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