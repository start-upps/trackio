// src/components/NewHabitForm.tsx
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function NewHabitForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name")?.toString().trim(),
      description: formData.get("description")?.toString().trim(),
      color: "#E040FB", // default color
      icon: "📝" // default icon
    }

    // Validate data
    if (!data.name || !data.description) {
      toast.error("Please fill in all fields")
      setLoading(false)
      return
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
        const errorData = await response.text()
        throw new Error(errorData || "Failed to create habit")
      }

      toast.success("Habit created successfully!")
      router.refresh() // Refresh the page data
      onClose?.()
    } catch (error) {
      console.error("Error creating habit:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create habit")
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
          maxLength={50}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          placeholder="Enter habit name"
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
          maxLength={100}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          placeholder="Enter habit description"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onClose?.()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="animate-spin mr-2">⚡</span>
              Creating...
            </>
          ) : (
            "Create Habit"
          )}
        </Button>
      </div>
    </form>
  )
}