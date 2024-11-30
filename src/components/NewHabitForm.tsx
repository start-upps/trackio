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

export function NewHabitForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#E040FB",
    icon: "📝"
  });
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const { name, description, color, icon } = formData;

    // Validate data
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, description, color, icon })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success("Habit created successfully!");
      router.refresh();
      onClose?.();
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create habit");
    } finally {
      setLoading(false);
    }
  }

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
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            maxLength={50}
            className={cn(
              "w-full px-3 py-2 bg-gray-800/50 rounded-xl",
              "border border-gray-700/50",
              "focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
              "transition-colors duration-200"
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
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            maxLength={100}
            className={cn(
              "w-full px-3 py-2 bg-gray-800/50 rounded-xl",
              "border border-gray-700/50",
              "focus:border-gray-600 focus:ring-1 focus:ring-gray-600",
              "transition-colors duration-200"
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                className={cn(
                  "w-8 h-8 rounded-lg transition-all duration-200",
                  formData.color === color && "ring-2 ring-white shadow-lg"
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData(prev => ({ ...prev, icon }))}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-gray-800 transition-all duration-200",
                  formData.icon === icon && "ring-2 ring-white shadow-lg bg-gray-700"
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
          onClick={() => onClose?.()}
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