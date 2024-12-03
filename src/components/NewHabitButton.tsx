// src/components/NewHabitButton.tsx
"use client";

import { Plus, Sparkles, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "./ui/dialog";
import { useState, useCallback, useEffect } from "react";
import { NewHabitForm } from "./NewHabitForm";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewHabitButtonProps {
  className?: string;
  onHabitCreated?: () => void;
}

export default function NewHabitButton({ className, onHabitCreated }: NewHabitButtonProps) {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setOpen(false);
    }
  }, [isLoading]);

  const handleSuccess = useCallback(() => {
    setIsLoading(true);
    toast.success("Habit created successfully!");
    
    // Allow the success message to be seen
    setTimeout(() => {
      setOpen(false);
      setIsLoading(false);
      onHabitCreated?.();
      router.refresh();
    }, 1000);
  }, [onHabitCreated, router]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleClose}
    >
      <AnimatePresence>
        <motion.div
          initial={false}
          animate={isHovered ? "hover" : "rest"}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            id="new-habit-trigger"
            aria-label="Create new habit"
            className={cn(
              "relative h-10 px-4 rounded-xl",
              "bg-gray-800 border-gray-700",
              "hover:bg-gray-700 hover:border-gray-600",
              "transition-all duration-200",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
              className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isLoading}
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
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
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
      </AnimatePresence>

      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Create New Habit
          </DialogTitle>
          <DialogDescription>
            Start building a new habit by filling out the form below.
          </DialogDescription>
        </DialogHeader>

        <NewHabitForm 
          onClose={handleClose} 
          onSuccess={handleSuccess}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </DialogContent>
    </Dialog>
  );
}