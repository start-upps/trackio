// src/components/NewHabitForm.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'

const COLORS = [
  '#E040FB', // Purple
  '#FFB300', // Amber
  '#00BCD4', // Cyan
  '#4CAF50', // Green
  '#F44336', // Red
]

const ICONS = ['🎯', '💪', '📚', '🏃‍♂️', '🧘‍♂️', '🎨', '💻', '🎵', '🏋️‍♂️', '✍️']

interface NewHabitFormProps {
  onHabitCreated: () => void
}

export function NewHabitForm({ onHabitCreated }: NewHabitFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          color: selectedColor,
          icon: selectedIcon,
        }),
      })

      if (response.ok) {
        setOpen(false)
        setName('')
        setDescription('')
        setSelectedColor(COLORS[0])
        setSelectedIcon(ICONS[0])
        onHabitCreated()
      }
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 border border-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 border border-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full ${
                    selectedColor === color ? 'ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedIcon === icon
                      ? 'bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Habit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}