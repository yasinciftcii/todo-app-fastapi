"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import { auth } from "../lib/firebase";
import { getTodos, updateTodo, deleteTodo, getCategories } from "../lib/api";
import { Todo, Category } from "../types";

import TodoForm from "./components/TodoForm";
import CategoryManager from "./components/CategoryManager";
import ConfirmModal from "./components/ConfirmModal";
import EditTodoModal from "./components/EditTodoModal";
import SortableTodoCard from "./components/SortableTodoCard";
import { useToast } from "./components/ToastProvider";

// Sticky note colors
const STICKY_COLORS = [
  "bg-yellow-100 border-yellow-200",
  "bg-red-100 border-red-200",
  "bg-blue-100 border-blue-200",
  "bg-green-100 border-green-200",
  "bg-purple-100 border-purple-200",
  "bg-orange-100 border-orange-200",
];

const getStickyColor = (id: number) => STICKY_COLORS[id % STICKY_COLORS.length];

const getDaysLeft = (dateString?: string | null) => {
  if (!dateString) return null;

  const due = new Date(dateString);
  const today = new Date();

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs font-bold">
        Overdue {Math.abs(diffDays)}d
      </span>
    );
  }

  if (diffDays === 0) {
    return (
      <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-xs font-bold">
        Today
      </span>
    );
  }

  return (
    <span className="bg-white/50 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">
      {diffDays} days left
    </span>
  );
};

export default function Home() {
  const router = useRouter();
  const toast = useToast();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTodoId, setDeleteTodoId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit modal
  const [editTodo, setEditTodo] = useState<Todo | null>(null);

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const fetchTodos = async () => {
    const data = await getTodos();
    setTodos(data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const [todosData, categoriesData] = await Promise.all([
          getTodos(),
          getCategories(),
        ]);

        setTodos(todosData);
        setCategories(categoriesData);
      } catch (err) {
        console.error(err);
        toast.error("Load failed", "Could not fetch your data.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleToggle = async (id: number, completed: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !completed } : t))
    );

    try {
      await updateTodo(id, { is_completed: !completed });
    } catch (e) {
      console.error(e);
      toast.error("Update failed", "Could not update todo.");
      await fetchTodos();
    }
  };

  // Drag & Drop reorder (UI only, NOT persisted)
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    setTodos((items) => {
      const oldIndex = items.findIndex((t) => t.id === active.id);
      const newIndex = items.findIndex((t) => t.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });

    toast.info("Reordered", "Order changed (not saved).");
  };

  const askDeleteTodo = (id: number) => {
    setDeleteTodoId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteTodo = () => {
    if (deleteLoading) return;
    setDeleteModalOpen(false);
    setDeleteTodoId(null);
  };

  const confirmDeleteTodo = async () => {
    if (!deleteTodoId) return;

    setDeleteLoading(true);
    try {
      setTodos((prev) => prev.filter((t) => t.id !== deleteTodoId));
      await deleteTodo(deleteTodoId);

      toast.success("Deleted", "Sticky note removed.");
      closeDeleteTodo();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed", "Please try again.");
      await fetchTodos();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTodoAdded = (todo: Todo) => {
    setTodos((prev) => [todo, ...prev]); // newest-first UX
    toast.success("Added", "New sticky note created.");
  };

  const handleTodoUpdated = (updated: Todo) => {
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    toast.success("Saved", "Todo updated successfully.");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              📌 Sticky Wall
            </h1>
            <p className="text-gray-500 mt-1">Manage your tasks colorfully.</p>
          </div>

          <div className="flex gap-4 items-center">
            <CategoryManager
              categories={categories}
              refreshCategories={fetchCategories}
              onCategoryAdded={fetchCategories}
            />

            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6 sticky top-6">
            <TodoForm categories={categories} onTodoAdded={handleTodoAdded} />
          </div>

          <div className="lg:col-span-3">
            {todos.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg">Wall is empty! Add a new sticky note.</p>
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={todos.map((t) => t.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {todos.map((todo) => (
                      <SortableTodoCard
                        key={todo.id}
                        todo={todo}
                        categories={categories}
                        getDaysLeft={getDaysLeft}
                        getStickyColor={getStickyColor}
                        onToggle={handleToggle}
                        onEdit={(t) => setEditTodo(t)}
                        onDelete={(id) => askDeleteTodo(id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <ConfirmModal
          open={deleteModalOpen}
          title="Delete this sticky note?"
          description="This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          danger
          loading={deleteLoading}
          onConfirm={confirmDeleteTodo}
          onClose={closeDeleteTodo}
        />

        <EditTodoModal
          open={!!editTodo}
          todo={editTodo}
          categories={categories}
          onClose={() => setEditTodo(null)}
          onSaved={handleTodoUpdated}
        />
      </div>
    </div>
  );
}
