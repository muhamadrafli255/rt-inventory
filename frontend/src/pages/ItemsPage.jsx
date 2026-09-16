import { useCallback, useEffect, useRef, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { createItem, deleteItem, getItems, updateItem } from "../api/itemApi";

import { getCategories } from "../api/categoryApi";
import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";

const initialForm = {
  categoryId: "",
  name: "",
  code: "",
  description: "",
  quantity: 0,
  available: 0,
  condition: "BAIK",
  imageUrl: "",
};

const conditionOptions = [
  {
    value: "BAIK",
    label: "Baik",
  },
  {
    value: "RUSAK_RINGAN",
    label: "Rusak Ringan",
  },
  {
    value: "RUSAK_BERAT",
    label: "Rusak Berat",
  },
];

function extractArray(response) {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.categories)) {
    return data.categories;
  }

  if (Array.isArray(response?.data?.data?.items)) {
    return response.data.data.items;
  }

  return [];
}

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [itemsResponse, categoriesResponse] = await Promise.all([
          getItems(),
          getCategories(),
        ]);

        const nextItems = extractArray(itemsResponse);
        const nextCategories = extractArray(categoriesResponse);

        setItems(nextItems);
        setCategories(nextCategories);

        if (isRefresh) {
          showNotification("success", "Data barang berhasil diperbarui.");
        }
      } catch (err) {
        console.error("Items fetch error:", err);

        const message =
          err.response?.data?.message || "Gagal mengambil data barang.";

        setError(message);
        showNotification("error", message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showNotification],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = items.filter((item) => {
    const keyword = search.toLowerCase().trim();

    const matchesSearch =
      item.name?.toLowerCase().includes(keyword) ||
      item.code?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword);

    const matchesCategory =
      !categoryFilter || String(item.categoryId) === String(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingItem(null);

    setForm({
      ...initialForm,
      categoryId: categories[0]?.id ? Number(categories[0].id) : "",
    });

    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);

    setForm({
      categoryId: item.categoryId ? Number(item.categoryId) : "",
      name: item.name || "",
      code: item.code || "",
      description: item.description || "",
      quantity: Number(item.quantity ?? 0),
      available: Number(item.available ?? 0),
      condition: item.condition || "BAIK",
      imageUrl: item.imageUrl || "",
    });

    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingItem(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "categoryId" || name === "quantity" || name === "available"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      form.categoryId === "" ||
      form.categoryId === null ||
      form.categoryId === undefined ||
      Number(form.categoryId) <= 0
    ) {
      const message = "Kategori barang wajib dipilih.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (!form.name.trim()) {
      const message = "Nama barang wajib diisi.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (!form.code.trim()) {
      const message = "Kode barang wajib diisi.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (Number(form.quantity) < 0) {
      const message = "Jumlah barang tidak boleh negatif.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (Number(form.available) < 0) {
      const message = "Jumlah tersedia tidak boleh negatif.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (Number(form.available) > Number(form.quantity)) {
      const message =
        "Jumlah tersedia tidak boleh lebih besar dari total jumlah.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    try {
      setSaving(true);
      setFormError("");

const payload = {
  categoryId: Number(form.categoryId),
  name: form.name.trim(),
  code: form.code.trim(),
  description: form.description.trim() || null,
  quantity: Number(form.quantity),
  available: Number(form.available),
  condition: form.condition,
  imageUrl: form.imageUrl.trim() || null,
};

      if (editingItem) {
        await updateItem(editingItem.id, payload);

        showNotification("success", "Barang berhasil diperbarui.");
      } else {
        await createItem(payload);

        showNotification("success", "Barang berhasil ditambahkan.");
      }

      setModalOpen(false);
      setEditingItem(null);
      setForm(initialForm);
      setFormError("");

      await fetchData();
    } catch (err) {
      console.error("Item save error:", err);

      const message = err.response?.data?.message || "Gagal menyimpan barang.";

      setFormError(message);
      showNotification("error", message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setSelectedItem(null);
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setDeleting(true);

      await deleteItem(selectedItem.id);

      const deletedItemName = selectedItem.name;

      setSelectedItem(null);
      setDeleteModalOpen(false);

      showNotification(
        "success",
        `Barang "${deletedItemName}" berhasil dihapus.`,
      );

      await fetchData();
    } catch (err) {
      console.error("Item delete error:", err);

      const message =
        err.response?.data?.message || "Barang tidak dapat dihapus.";

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
          className={`fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm ${
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
            <AlertCircle size={22} className="mt-0.5 shrink-0 text-rose-600" />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {notification.type === "success" ? "Berhasil" : "Gagal"}
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
            Data Barang
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola barang, stok, kondisi, dan kategori inventaris RT.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Tambah Barang
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
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau kode barang..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Semua Kategori</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => fetchData(true)}
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
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title={
              search || categoryFilter
                ? "Barang tidak ditemukan"
                : "Barang belum tersedia"
            }
            description={
              search || categoryFilter
                ? "Coba ubah kata kunci atau filter kategori."
                : "Tambahkan barang baru untuk mulai mengelola inventaris."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Barang</th>

                  <th className="px-6 py-4 font-semibold">Kategori</th>

                  <th className="px-6 py-4 font-semibold">Total</th>

                  <th className="px-6 py-4 font-semibold">Tersedia</th>

                  <th className="px-6 py-4 font-semibold">Kondisi</th>

                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-emerald-600">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.name}
                          </p>

                          <p className="text-xs text-slate-400">{item.code}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.category?.name || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {item.quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {item.available}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <ConditionBadge condition={item.condition} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                          title="Edit barang"
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Hapus barang"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingItem ? "Edit Barang" : "Tambah Barang"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Isi informasi barang inventaris.
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

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />

                  <span>{formError}</span>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kategori
                  </label>

                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">Pilih kategori</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kode Barang
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Contoh: BRG-001"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Barang
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Kursi Plastik"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                  rows={3}
                  placeholder="Deskripsi barang..."
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Total Jumlah
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Jumlah Tersedia
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="available"
                    value={form.available}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kondisi
                  </label>

                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  URL Gambar
                </label>

                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                  {saving && <RefreshCw size={16} className="animate-spin" />}

                  {saving
                    ? "Menyimpan..."
                    : editingItem
                      ? "Simpan Perubahan"
                      : "Tambah Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteModalOpen}
        title="Hapus barang?"
        message={`Barang "${selectedItem?.name || ""}" akan dihapus dari inventaris.`}
        loading={deleting}
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ConditionBadge({ condition }) {
  const config = {
    BAIK: {
      label: "Baik",
      className: "bg-emerald-100 text-emerald-700",
    },
    RUSAK_RINGAN: {
      label: "Rusak Ringan",
      className: "bg-amber-100 text-amber-700",
    },
    RUSAK_BERAT: {
      label: "Rusak Berat",
      className: "bg-rose-100 text-rose-700",
    },
  };

  const current = config[condition] || {
    label: condition || "-",
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}
