import { useEffect, useState } from "react";
import { Category, PriorityLevel, Todo } from "../../types";
import { updateTodo } from "../../lib/api";
import { X, Save } from "lucide-react";

type Props = {
    open: boolean;
    todo: Todo | null;
    categories: Category[];
    onClose: () => void;
    onSaved: (updated: Todo) => void;
};

export default function EditTodoModal({
    open,
    todo,
    categories,
    onClose,
    onSaved,
}: Props) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
    const [dueDate, setDueDate] = useState<string>("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

useEffect(() => {
    if (!todo) return;
    setTitle(todo.title || "");
    setPriority(todo.priority || PriorityLevel.MEDIUM);
    setDueDate(todo.due_date ? String(todo.due_date).slice(0, 10) : "");
    setCategoryId(todo.category_id ?? null);
}, [todo]);

if (!open || !todo) return null;

const save = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const payload: any = {
        title: trimmed,
        priority,
        category_id: categoryId,
        due_date: dueDate ? dueDate : null,
      };

      const updated = await updateTodo(todo.id, payload);
      onSaved(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div>
            <div className="text-base font-semibold text-gray-900">Edit Todo</div>
            <div className="text-sm text-gray-500">Update details and save.</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-gray-50"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <div>
            <label className="text-xs font-bold tracking-wide text-gray-500">
              TITLE
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold tracking-wide text-gray-500">
                PRIORITY
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={PriorityLevel.LOW}>low</option>
                <option value={PriorityLevel.MEDIUM}>medium</option>
                <option value={PriorityLevel.HIGH}>high</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wide text-gray-500">
                CATEGORY
              </label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setCategoryId(v === "" ? null : Number(v));
                }}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wide text-gray-500">
                DUE DATE
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
