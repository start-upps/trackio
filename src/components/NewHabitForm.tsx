// src/components/NewHabitForm.tsx
"use client";

import { useState } from "react";
import { DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface NewHabitFormProps {
  onClose?: () => void;
}

export function NewHabitForm({ onClose }: NewHabitFormProps) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);

    const promise = fetch("/api/habits", {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to create habit");
      onClose?.();
    });

    toast.promise(promise, {
      loading: "Creating new habit...",
      success: "Habit created successfully!",
      error: "Failed to create habit. Please try again.",
    });

    setLoading(false);
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      action={onSubmit}
    >
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2"
            required
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2"
            required
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end gap-3"
        >
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={loading}>
            Create Habit
          </Button>
        </motion.div>
      </div>
    </motion.form>
  );
}