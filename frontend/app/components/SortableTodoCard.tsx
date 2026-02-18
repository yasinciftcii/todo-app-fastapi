"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Todo, Category, PriorityLevel } from "../../types";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  todo: Todo;
  categories: Category[];
  getDaysLeft: (dateString?: string | null) => React.ReactNode;
  getStickyColor: (id: number) => string;
  onToggle: (id: number, current: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
};

export default function SortableTodoCard({
  todo,
  categories,
  getDaysLeft,
  getStickyColor,
  onToggle,
  onEdit,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const categoryName =
    todo.category_id == null
      ? "Uncategorized"
      : categories.find((c) => c.id === todo.category_id)?.name?.trim() || "Uncategorized";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "relative p-5 rounded-2xl shadow-sm border transition-all group flex flex-col justify-between h-64",
        todo.is_completed ? "bg-gray-100 border-gray-200 opacity-60" : getStickyColor(todo.id),
        isDragging ? "ring-2 ring-black/20 shadow-lg scale-[1.02]" : "hover:shadow-md hover:-translate-y-1",
      ].join(" ")}
    >
      {/* Top */}
      <div>
        <div className="flex justify-between items-start mb-3">
          {/* Category chip */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-gray-800">
            <span className="text-[12px]">🏷️</span>
            {categoryName}
          </span>

          <div className="flex items-center gap-1">
            {/* Drag handle: only this area is draggable */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="rounded-xl px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-white/60 border border-black/10"
              title="Drag"
            >
              ⋮⋮
            </button>

            {/* Complete toggle */}
            <button
              onClick={() => onToggle(todo.id, todo.is_completed)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                todo.is_completed
                  ? "bg-gray-500 border-gray-500 text-white"
                  : "border-black/20 hover:border-black/50"
              }`}
              title="Complete"
            >
              {todo.is_completed && "✓"}
            </button>
          </div>
        </div>

        <h3 className={`text-xl font-bold text-gray-900 mb-2 leading-tight ${todo.is_completed ? "line-through" : ""}`}>
          {todo.title}
        </h3>
      </div>

      {/* Bottom */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`text-xs font-bold px-2 py-1 rounded border border-black/10 ${
              todo.priority === PriorityLevel.HIGH
                ? "bg-red-500/20 text-red-900"
                : todo.priority === PriorityLevel.MEDIUM
                ? "bg-yellow-500/20 text-yellow-900"
                : "bg-green-500/20 text-green-900"
            }`}
          >
            {todo.priority}
          </span>
          {getDaysLeft(todo.due_date)}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-black/5">
          <span className="text-xs text-gray-500 font-medium">#{todo.id}</span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(todo)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-full transition-colors"
              title="Edit"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={() => onDelete(todo.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-white/50 rounded-full transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
