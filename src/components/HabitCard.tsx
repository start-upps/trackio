// src/components/HabitCard.tsx
"use client";

import { useState } from "react";
import { format, isToday, isAfter } from "date-fns";
import { Button } from "./ui/button";
import { type Habit } from "@/types/habit";
import { useOptimisticHabits } from "./providers/OptimisticProvider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  BarChart2,
  Grid,
  Trophy,
  Settings2,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import { HabitStats } from "./HabitStats";
import { HabitCharts } from "./HabitCharts";
import { HeatmapView } from "./HeatmapView";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { EditHabitDialog } from "./EditHabitDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useRouter } from "next/navigation";

type ViewType = "stats" | "charts" | "heatmap";

const viewIcons = {
  stats: { icon: <Calendar className="h-4 w-4" />, label: "Statistics" },
  charts: { icon: <BarChart2 className="h-4 w-4" />, label: "Analytics" },
  heatmap: { icon: <Grid className="h-4 w-4" />, label: "Activity" },
};

export function HabitCard({ habit }: { habit: Habit }) {
  const { toggleHabit, isPending } = useOptimisticHabits();
  const [showStats, setShowStats] = useState(false);
  const [view, setView] = useState<ViewType>("stats");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const currentStreak = habit.entries
    .filter((entry) => entry.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((streak, entry, index, arr) => {
      if (index === 0 && isAfter(new Date(entry.date), new Date())) return 0;
      if (index === 0) return 1;
      const prevDate = new Date(arr[index - 1].date);
      const currentDate = new Date(entry.date);
      const diffDays = Math.floor(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays === 1 ? streak + 1 : streak;
    }, 0);

  async function handleArchive() {
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !habit.archived }),
      });

      if (!response.ok) throw new Error();
      toast.success(habit.archived ? "Habit restored" : "Habit archived");
      router.refresh();
    } catch {
      toast.error("Failed to update habit");
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();
      toast.success("Habit deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete habit");
    }
  }

  async function handleUpdate(data: Partial<Habit>) {
    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();
      toast.success("Habit updated");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to update habit");
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gray-800 rounded-lg p-4 transition-all border border-gray-700/50",
        isPending && "opacity-75",
        habit.archived && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: habit.color }}
                >
                  {habit.icon}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p>Click to mark today&apos;s habit</p>
                  {currentStreak > 0 && (
                    <p className="text-green-400 flex items-center gap-1 mt-1">
                      <Trophy className="h-3 w-3" /> {currentStreak} day streak!
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div>
            <h3 className="font-medium text-white">{habit.name}</h3>
            <p className="text-sm text-gray-400">{habit.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showStats && (
            <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
              {(Object.keys(viewIcons) as ViewType[]).map((viewType) => (
                <TooltipProvider key={viewType}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8",
                          view === viewType && "bg-gray-600",
                        )}
                        onClick={() => setView(viewType)}
                      >
                        {viewIcons[viewType].icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{viewIcons[viewType].label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive}>
                {habit.archived ? (
                  <>
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restore
                  </>
                ) : (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-400"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            {showStats ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() =>
                      toggleHabit(habit.id, new Date().toISOString())
                    }
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                  >
                    ✓
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>Mark today&apos;s habit as complete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence>
          {Array.from({ length: 28 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (27 - i));
            const dateStr = date.toISOString();
            const entry = habit.entries.find(
              (entry) =>
                format(new Date(entry.date), "yyyy-MM-dd") ===
                format(date, "yyyy-MM-dd"),
            );
            const isCurrentDay = isToday(date);

            return (
              <TooltipProvider key={dateStr}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleHabit(habit.id, dateStr)}
                      disabled={isPending}
                      className={cn(
                        "aspect-square rounded-sm transition-all relative",
                        isPending && "cursor-not-allowed",
                        isCurrentDay &&
                          "ring-2 ring-white ring-offset-2 ring-offset-gray-800",
                      )}
                      style={{
                        backgroundColor: habit.color,
                        opacity: entry?.completed ? 1 : 0.2,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p>{format(date, "MMMM d, yyyy")}</p>
                      <p
                        className={cn(
                          "mt-1",
                          entry?.completed ? "text-green-400" : "text-gray-400",
                        )}
                      >
                        {entry?.completed ? "Completed" : "Not completed"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {showStats && (
          <motion.div
            key={view}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {view === "stats" ? (
              <HabitStats habit={habit} />
            ) : view === "charts" ? (
              <HabitCharts habit={habit} />
            ) : (
              <HeatmapView habit={habit} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <EditHabitDialog
        habit={habit}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSubmit={handleUpdate}
      />

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this habit? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}