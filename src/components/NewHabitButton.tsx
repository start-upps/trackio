// src/components/NewHabitButton.tsx
"use client";

import { Plus, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import { NewHabitForm } from "./NewHabitForm";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function NewHabitButton() {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <motion.div
        initial={false}
        animate={isHovered ? "hover" : "rest"}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          id="new-habit-trigger"
          className={cn(
            "relative h-10 px-4 rounded-xl",
            "bg-gray-800 border-gray-700",
            "hover:bg-gray-700 hover:border-gray-600",
            "transition-all duration-200"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="flex items-center gap-2"
            variants={{
              rest: { width: "auto" },
              hover: { width: "auto" }
            }}
          >
            <motion.div
              className="relative"
              variants={{
                rest: { rotate: 0 },
                hover: { rotate: 180 }
              }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <Plus className="w-4 h-4" />
            </motion.div>
            
            <motion.span
              className="text-sm font-medium"
              variants={{
                rest: { opacity: 0, width: 0 },
                hover: { opacity: 1, width: "auto" }
              }}
            >
              New Habit
            </motion.span>

            <motion.div
              className="absolute top-0 right-0 bottom-0 left-0 pointer-events-none"
              variants={{
                rest: { 
                  opacity: 0,
                  scale: 0.9
                },
                hover: { 
                  opacity: [0, 1, 0],
                  scale: [0.9, 1.1, 1.2],
                  transition: {
                    opacity: { repeat: Infinity, duration: 2 },
                    scale: { repeat: Infinity, duration: 2 }
                  }
                }
              }}
            >
              <div className="w-full h-full rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
            </motion.div>
          </motion.div>
        </Button>
      </motion.div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Create New Habit
          </DialogTitle>
        </DialogHeader>
        <NewHabitForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}