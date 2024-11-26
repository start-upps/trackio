// src/components/NewHabitButton.tsx
"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { NewHabitForm } from "./NewHabitForm";
import { useState } from "react";

export function NewHabitButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
          <span className="sr-only">New habit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <NewHabitForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
