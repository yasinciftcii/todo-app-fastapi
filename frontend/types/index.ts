// 1. Priority Levels (Matches Backend Enum)
export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// 2. Category Interfaces
export interface Category {
  /** Unique identifier for the category */
  id: number;
  /** Name of the category (e.g., "Work", "Personal") */
  name: string;
  /** Firebase UID of the owner */
  owner_uid: string;
}

export interface CategoryCreate {
  /** Payload required to create a new category */
  name: string;
}

// 3. Todo Interfaces
export interface Todo {
  /** Unique identifier for the todo item */
  id: number;
  /** The title of the task */
  title: string;
  /** Optional description or details */
  description?: string;
  /** Status of the task (True if completed) */
  is_completed: boolean;
  /** Firebase UID of the owner */
  owner_uid: string;
  /** Creation timestamp (ISO String from Backend) */
  created_at: string;
  
  // --- New Features ---
  
  /** Urgency level of the task */
  priority: PriorityLevel;
  /** Deadline for the task (ISO String or null) */
  due_date?: string | null;
  /** ID of the associated category (Foreign Key) */
  category_id?: number | null;
  /** Full category object (Joined data from Backend) */
  category?: Category;
}

export interface CreateTodoInput {
  /** Payload required to create a new todo */
  title: string;
  description?: string;
  is_completed?: boolean;
  priority?: PriorityLevel;
  due_date?: string | null;
  category_id?: number | null;
}