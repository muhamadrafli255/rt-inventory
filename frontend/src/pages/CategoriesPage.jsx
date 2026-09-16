import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../api/categoryApi";

import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";

const initialForm = {
  name: "",
  description: "",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [notification, setNotification] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState(initialForm);

  const notificationTimerRef = useRef(null);

  const showNotification = useCallback((type, message) => {
    setNotification({
      type,
      message,
    });

    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const fetchCategories = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getCategories();

        setCategories(response.data || []);

        if (isRefresh) {
          showNotification(
            "success",
            "Data kategori berhasil diperbarui."
          );
        }
      } catch (err) {
        console.error("Category fetch error:", err);

        const message =
          err.response?.data?.message ||
          "Gagal mengambil data kategori.";

        setError(message);
        showNotification("error", message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showNotification]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((category) => {
    const keyword = search.toLowerCase().trim();

    return (
      category.name?.toLowerCase().includes(keyword) ||
      category.description?.toLowerCase().includes(keyword)
    );
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(initialForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
    });

    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      const message = "Nama kategori wajib diisi.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);

        showNotification(
          "success",
          "Kategori berhasil diperbarui."
        );
      } else {
        await createCategory(payload);

        showNotification(
          "success",
          "Kategori berhasil ditambahkan."
        );
      }

      setModalOpen(false);
      setEditingCategory(null);
      setForm(initialForm);
      setFormError("");

      await fetchCategories();
    } catch (err) {
      console.error("Category save error:", err);

      const message =
        err.response?.data?.message ||
        "Gagal menyimpan kategori.";

      setFormError(message);
      showNotification("error", message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setSelectedCategory(null);
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setDeleting(true);

      await deleteCategory(selectedCategory.id);

      const deletedCategoryName = selectedCategory.name;

      setSelectedCategory(null);
      setDeleteModalOpen(false);

      showNotification(
        "success",
        `Kategori "${deletedCategoryName}" berhasil dihapus.`
      );

      await fetchCategories();
    } catch (err) {
      console.error("Category delete error:", err);

      const message =
        err.response?.data?.message ||
        "Kategori tidak dapat dihapus.";

      setError(message);
      showNotification("error", message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative space-y-8">
      {notification && (
        <div
          className={`fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm transition-all ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2
              size={22}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
          ) : (
            <AlertCircle
              size={22}
              className="mt-0.5 shrink-0 text-rose-600"
            />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {notification.type === "success"
                ? "Berhasil"
                : "Gagal"}
            </p>

            <p className="mt-0.5 text-sm leading-5 opacity-80">
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotification(null)}
            className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
            aria-label="Tutup notifikasi"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-600">
            Manajemen Inventaris
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Kategori Barang
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola kategori untuk mengelompokkan barang inventaris RT.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto rounded-lg p-1 hover:bg-rose-100"
            aria-label="Tutup pesan error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kategori..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchCategories(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title={
              search
                ? "Kategori tidak ditemukan"
                : "Kategori belum tersedia"
            }
            description={
              search
                ? "Coba gunakan kata kunci pencarian yang berbeda."
                : "Tambahkan kategori baru untuk mulai mengelola inventaris."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Kategori
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Deskripsi
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Jumlah Barang
                  </th>

                  <th className="px-6 py-4 text-right font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                          <FolderKanban size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {category.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {category.description || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {category._count?.items ??
                          category.items?.length ??
                          0}{" "}
                        barang
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(category)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit kategori"
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(category)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Hapus kategori"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCategory
                    ? "Edit Kategori"
                    : "Tambah Kategori"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Isi informasi kategori barang.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Kategori
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Elektronik"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Deskripsi
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Deskripsi singkat kategori..."
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Menyimpan..."
                    : editingCategory
                      ? "Simpan Perubahan"
                      : "Tambah Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        title="Hapus kategori?"
        message={`Kategori "${selectedCategory?.name || ""}" akan dihapus. Pastikan kategori ini tidak masih digunakan oleh barang.`}
        loading={deleting}
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
}