// src/components/NewHabitButton.tsx
"use client"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent } from "./ui/dialog"
import { useState } from "react"
import { NewHabitForm } from "./NewHabitForm"

export default function NewHabitButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="icon"
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">New habit</span>
      </Button>
      <DialogContent>
        <NewHabitForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
