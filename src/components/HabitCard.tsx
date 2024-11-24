// src/components/HabitCard.tsx
import { format } from 'date-fns'
import { Button } from './ui/button'

interface HabitEntry {
  id: string
  date: string
  completed: boolean
}

interface HabitCardProps {
  habit: {
    id: string
    name: string
    description: string
    color: string
    icon: string
    entries: HabitEntry[]
  }
  onToggle: (habitId: string, date: Date) => void
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const today = new Date()
  const dates = Array.from({ length: 28 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    return date
  }).reverse()

  return (
    <div className="bg-zinc-900 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: habit.color }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="text-white font-medium">{habit.name}</h3>
            <p className="text-zinc-400 text-sm">{habit.description}</p>
          </div>
        </div>
        <Button
          onClick={() => onToggle(habit.id, today)}
          className="rounded-lg"
          variant="ghost"
        >
          ✓
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date) => {
          const entry = habit.entries.find(
            (e) => format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )
          return (
            <button
              key={date.toISOString()}
              onClick={() => onToggle(habit.id, date)}
              className="w-full pt-[100%] relative rounded-sm transition-opacity"
              style={{ 
                backgroundColor: habit.color,
                opacity: entry?.completed ? 1 : 0.3
              }}
            />
          )
        })}
      </div>
    </div>
  )
}