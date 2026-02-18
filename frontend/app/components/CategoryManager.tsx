import { useMemo, useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "../../lib/api";
import { Category } from "../../types";
import ConfirmModal from "./ConfirmModal";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { useToast } from "./ToastProvider";

interface Props {
  categories: Category[];
  refreshCategories: () => Promise<void>;
  onCategoryAdded?: (newCategory: Category) => void;
}

export default function CategoryManager({
  categories,
  refreshCategories,
  onCategoryAdded,
}: Props) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sortedCategories = useMemo(() => {
    const copy = [...categories];
    copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
  }, [categories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      const newCategory = await createCategory({ name: trimmed });
      onCategoryAdded?.(newCategory);
      setName("");
      await refreshCategories();
      toast.success("Category added", `"${trimmed}" created.`);
    } catch (error) {
      console.error("Failed to add category:", error);
      toast.error("Create failed", "Could not create category.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (!trimmed) return;

    try {
      await updateCategory(editingId, trimmed);
      cancelEdit();
      await refreshCategories();
      toast.success("Saved", "Category updated.");
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("Update failed", "Could not update category.");
    }
  };

  const askDelete = (id: number) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const closeDelete = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await deleteCategory(deleteId);
      closeDelete();
      await refreshCategories();
      toast.success("Deleted", "Category removed. Todos moved to Uncategorized.");
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      toast.error("Delete failed", "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Manage Categories</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Create, rename, or delete categories.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="New Category Name (e.g., Work)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={creating}
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
        >
          <Plus size={16} />
          {creating ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {sortedCategories.length === 0 ? (
          <div className="text-sm text-gray-500">No categories yet.</div>
        ) : (
          sortedCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2"
            >
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />

                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={!editName.trim()}
                    className="rounded-xl p-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    title="Save"
                  >
                    <Check size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-xl p-2 border border-gray-200 text-gray-700 hover:bg-gray-50"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-800">{cat.name}</div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="rounded-xl p-2 border border-gray-200 text-gray-700 hover:bg-gray-50"
                      title="Rename"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => askDelete(cat.id)}
                      className="rounded-xl p-2 border border-red-200 text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete category?"
        description="Todos in this category will be moved to Uncategorized."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={closeDelete}
      />
    </div>
  );
}
