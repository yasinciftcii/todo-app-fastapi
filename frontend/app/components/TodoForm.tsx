import { useState } from "react";
import { createTodo } from "../../lib/api";
import { Category, PriorityLevel, Todo } from "../../types";
import { useToast } from "./ToastProvider";

interface Props {
  categories: Category[];
  onTodoAdded: (todo: Todo) => void;
}

export default function TodoForm({ categories, onTodoAdded }: Props) {
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const newTodo = await createTodo({
        title: title.trim(),
        priority,
        category_id: categoryId === "" ? null : Number(categoryId),
        due_date: dueDate || null,
        is_completed: false,
      });

      onTodoAdded(newTodo);

      setTitle("");
      setPriority(PriorityLevel.MEDIUM);
      setCategoryId("");
      setDueDate("");

      toast.success("Added", "New sticky note created.");
    } catch (error) {
      console.error("Failed to create todo:", error);
      toast.error("Create failed", "Could not create task.");
    } finally {
      setLoading(false);
    }
  };

  const control =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-yellow-400";
  const label =
    "block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <h3 className="text-xl font-bold text-gray-900">✨ Create New Task</h3>
      <p className="text-sm text-gray-500 mt-1">What needs to be done today?</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <input
            type="text"
            placeholder="Type your task title..."
            className="w-full text-lg font-semibold text-gray-900 placeholder-gray-400 border-b-2 border-gray-200 focus:border-yellow-400 outline-none py-2 transition-colors bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={label}>PRIORITY</label>
            <div className="relative">
              <select
                className={control + " appearance-none pr-10"}
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                disabled={loading}
              >
                <option value={PriorityLevel.LOW}>🟢 Low</option>
                <option value={PriorityLevel.MEDIUM}>🟡 Medium</option>
                <option value={PriorityLevel.HIGH}>🔴 High</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </div>
          </div>

          <div>
            <label className={label}>CATEGORY</label>
            <div className="relative">
              <select
                className={control + " appearance-none pr-10"}
                value={categoryId}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategoryId(val === "" ? "" : Number(val));
                }}
                disabled={loading}
              >
                <option value="">📂 Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </div>
          </div>

          <div>
            <label className={label}>DUE DATE</label>
            <input
              type="date"
              className={control}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="mt-1 w-full rounded-xl bg-gray-900 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-black disabled:opacity-50 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? "Saving..." : "➕ Add Sticky Note"}
        </button>
      </form>
    </div>
  );
}
