import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../api/userApi";

import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  roleName: "WARGA",
  isActive: true,
};

function extractArray(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data?.users)) return data.data.users;
  return [];
}

function getErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;
  if (responseData?.message) return responseData.message;

  const fieldErrors = responseData?.errors?.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const messages = Object.entries(fieldErrors).flatMap(([field, errors]) => {
      if (!Array.isArray(errors)) return [];
      return errors.map((msg) => `${field}: ${msg}`);
    });
    if (messages.length > 0) return messages.join(" | ");
  }

  return fallbackMessage;
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState(initialForm);

  const notificationTimerRef = useRef(null);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
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

        const response = await getUsers({ limit: 100 });
        const nextUsers = extractArray(response);

        setUsers(nextUsers);

        if (isRefresh) {
          showNotification("success", "Data warga berhasil diperbarui.");
        }
      } catch (err) {
        console.error("Fetch users error:", err);
        const message = getErrorMessage(err, "Gagal mengambil data warga.");
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
    fetchData();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(keyword) ||
        u.email?.toLowerCase().includes(keyword) ||
        u.phone?.toLowerCase().includes(keyword);

      const matchesRole = !roleFilter || u.role?.name === roleFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && u.isActive) ||
        (statusFilter === "inactive" && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      warga: users.filter((u) => u.role?.name === "WARGA").length,
      active: users.filter((u) => u.isActive).length,
      admin: users.filter((u) => u.role?.name === "ADMIN").length,
    };
  }, [users]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(initialForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (userItem) => {
    setEditingUser(userItem);
    setForm({
      name: userItem.name || "",
      email: userItem.email || "",
      password: "",
      phone: userItem.phone || "",
      address: userItem.address || "",
      roleName: userItem.role?.name || "WARGA",
      isActive: userItem.isActive !== false,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      const msg = "Nama wajib diisi.";
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    if (!form.email.trim()) {
      const msg = "Email wajib diisi.";
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    if (!editingUser && (!form.password || form.password.length < 6)) {
      const msg = "Password minimal 6 karakter untuk pendaftaran akun baru.";
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        roleName: form.roleName,
        isActive: form.isActive,
      };

      if (form.password && form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        showNotification("success", `Data "${form.name}" berhasil diperbarui.`);
      } else {
        await createUser(payload);
        showNotification("success", `Warga "${form.name}" berhasil ditambahkan.`);
      }

      closeModal();
      await fetchData();
    } catch (err) {
      console.error("Save user error:", err);
      const msg = getErrorMessage(err, "Gagal menyimpan data warga.");
      setFormError(msg);
      showNotification("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (userItem) => {
    setSelectedUser(userItem);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setSelectedUser(null);
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);
      const res = await deleteUser(selectedUser.id);
      closeDeleteModal();
      showNotification("success", res.message || `Data warga berhasil dihapus.`);
      await fetchData();
    } catch (err) {
      console.error("Delete user error:", err);
      const msg = getErrorMessage(err, "Gagal menghapus data warga.");
      setError(msg);
      showNotification("error", msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative space-y-8">
      {/* Toast notification */}
      {notification && (
        <div
          className={`fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" />
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
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-600">
            Administrasi Sistem
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Kelola Data Warga
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola akun warga RT, perizinan role, serta status keaktifan pengguna.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Tambah Warga Baru
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Total Pengguna</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-emerald-600">Warga RT</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.warga}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-emerald-500">Akun Aktif</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-blue-600">Administrator</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.admin}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto rounded-lg p-1 hover:bg-rose-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter and Table */}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau telepon..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Semua Role</option>
              <option value="WARGA">WARGA</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
            </select>

            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title={
              search || roleFilter || statusFilter
                ? "Warga tidak ditemukan"
                : "Belum ada data warga"
            }
            description={
              search || roleFilter || statusFilter
                ? "Coba ubah kata kunci atau filter yang Anda gunakan."
                : "Klik tombol 'Tambah Warga Baru' untuk menambahkan akun."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pengguna</th>
                  <th className="px-6 py-4 font-semibold">Kontak</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Pinjaman</th>
                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((userItem) => {
                  const isWargaRole = userItem.role?.name === "WARGA";

                  return (
                    <tr key={userItem.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                            {userItem.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {userItem.name}
                            </p>
                            <p className="text-xs text-slate-400">{userItem.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center gap-1.5 text-slate-700">
                            <Phone size={13} className="text-slate-400" />
                            {userItem.phone || "-"}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <MapPin size={13} className="text-slate-400" />
                            {userItem.address || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isWargaRole
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <Shield size={12} />
                          {userItem.role?.name || "WARGA"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            userItem.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {userItem.isActive ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {userItem._count?.loans || 0} kali
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(userItem)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                            title="Edit data warga"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(userItem)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            title="Hapus / Non-aktifkan warga"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit Warga */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingUser ? "Edit Data Warga" : "Tambah Warga Baru"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Isi formulir data akun warga di bawah ini.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Contoh: Budi Santoso"
                  disabled={saving}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  placeholder="budi@example.com"
                  disabled={saving}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password{" "}
                  {editingUser ? (
                    <span className="text-slate-400 font-normal lowercase">
                      (Kosongkan jika tidak ingin diubah)
                    </span>
                  ) : (
                    <span className="text-rose-500">*</span>
                  )}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleFormChange}
                  required={!editingUser}
                  placeholder={editingUser ? "••••••••" : "Minimal 6 karakter"}
                  disabled={saving}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="08123456789"
                    disabled={saving}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Role Sistem
                  </label>
                  <select
                    name="roleName"
                    value={form.roleName}
                    onChange={handleFormChange}
                    disabled={saving}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  >
                    <option value="WARGA">WARGA</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Alamat Rumah
                </label>
                <textarea
                  name="address"
                  rows="2"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Alamat lengkap warga..."
                  disabled={saving}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleFormChange}
                  disabled={saving}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
                  Akun Aktif
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving && <RefreshCw size={16} className="animate-spin" />}
                  {saving
                    ? "Menyimpan..."
                    : editingUser
                    ? "Simpan Perubahan"
                    : "Tambah Warga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Hapus / Non-Aktifkan */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Hapus data warga?"
        message={`Warga "${selectedUser?.name || ""}" (${selectedUser?.email || ""}) akan dihapus dari sistem. Jika warga memiliki riwayat peminjaman, status akan diubah menjadi Non-Aktif.`}
        confirmText="Hapus / Non-Aktifkan"
        cancelText="Batal"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onClose={closeDeleteModal}
      />
    </div>
  );
}
