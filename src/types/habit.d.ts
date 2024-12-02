// src/types/habit.d.ts
// Base types for database entities
export type HabitEntry = {
  id: string;
  date: string; // ISO string format
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  habitId: string;
};

export type Habit = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  entries: HabitEntry[];
};

// API Schema types
export interface HabitCreateInput {
  name: string;
  description: string;
  color?: string;
  icon?: string;
}

export interface HabitUpdateInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

// API request types
export interface CreateHabitRequest extends HabitCreateInput {}
export interface UpdateHabitRequest extends HabitUpdateInput {}
export interface ToggleHabitRequest {
  date: string;
}

// Common error type
export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

// Base API response
export interface ApiResponse {
  success: boolean;
  error?: string | ApiError;
  message?: string;
}

// API response types with pagination
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HabitsPaginatedResponse extends PaginatedResponse<Habit> {
  activeHabits: number;
  deletedHabits: number;
}

export interface ToggleHabitResponse extends ApiResponse {
  entry: HabitEntry | null;
}

export interface FetchHabitResponse extends ApiResponse {
  habit: Habit;
  stats: HabitStats;
  monthlyStats: MonthlyStats[];
}

export interface CreateHabitResponse extends ApiResponse {
  habit: Habit;
}

export interface UpdateHabitResponse extends ApiResponse {
  habit: Habit;
}

export interface DeleteHabitResponse extends ApiResponse {}

// Filter and query params
export interface HabitQueryParams {
  page?: number;
  limit?: number;
  showDeleted?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Component Props types
export interface HabitCardProps {
  habit: Habit;
  onUpdate?: (id: string, data: Partial<HabitUpdateInput>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export interface MonthlyViewProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => Promise<void>;
  className?: string;
}

export interface HabitGridViewProps {
  habits: Habit[];
}

export interface HabitListProps {
  habits: Habit[];
  initialStats?: Record<string, HabitStats>;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

// View types
export type ViewMode = "list" | "grid" | "weekly" | "monthly";

export interface DayData {
  date: Date;
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
  isFuture?: boolean;
}

export interface MonthData {
  date: Date;
  entries: HabitEntry[];
  stats: MonthlyStats;
}

// Statistics types
export interface MonthlyStats {
  month: string;
  completions: number;
  possibleDays: number;
  completionRate: number;
  longestStreak: number;
  totalDays: number;
  dayStats: DayStats[];
}

export interface DayStats {
  date: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  daysTracked: number;
  monthlyStats: MonthlyStats[];
  bestMonth: MonthlyStats | null;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  completed: number;
  month: string;
  isToday: boolean;
}

export interface MonthlyPerformanceData {
  month: string;
  completionRate: number;
  streak: number;
  totalDays: number;
  completedDays: number;
}

// State management types
export interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    showDeleted: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

export interface OptimisticUpdateParams {
  habitId: string;
  date: string;
  completed: boolean;
}

// Utility types
export type DateString = string;
export type HabitId = string;
export type UserId = string;