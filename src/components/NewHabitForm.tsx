// src/components/NewHabitForm.tsx
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function NewHabitForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      color: "#E040FB", // default color
      icon: "📝" // default icon
    }

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error("Failed to create habit")
      }

      toast.success("Habit created successfully!")
      onClose?.()
    } catch (error) {
      toast.error("Failed to create habit")
      console.error("Error creating habit:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          required
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onClose?.()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Habit"}
        </Button>
      </div>
    </form>
  )
}