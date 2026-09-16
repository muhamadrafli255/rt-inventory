import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  cancelLoan,
  createLoan,
  getLoans,
} from "../api/loanApi";
import { getItems } from "../api/itemApi";

import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";
import LoanStatusBadge from "../components/loans/LoanStatusBadge";
import LoanDetailModal from "../components/loans/LoanDetailModal";

const initialForm = {
  itemId: "",
  quantity: 1,
  purpose: "",
  notes: "",
  startDate: "",
  endDate: "",
};

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "MENUNGGU", label: "Menunggu" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "DIPINJAM", label: "Sedang Dipinjam" },
  { value: "DIKEMBALIKAN", label: "Dikembalikan" },
  { value: "DITOLAK", label: "Ditolak" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
];

function extractArray(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.loans)) return data.loans;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.loans)) return data.data.loans;
  return [];
}

function formatDate(date) {
  if (!date) return "-";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(parsedDate);
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

export default function MyLoansPage() {
  const [loans, setLoans] = useState([]);
  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notification, setNotification] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [selectedLoan, setSelectedLoan] = useState(null);

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

        const [loansResponse, itemsResponse] = await Promise.all([
          getLoans(),
          getItems(),
        ]);

        const nextLoans = extractArray(loansResponse);
        const nextItems = extractArray(itemsResponse);

        setLoans(nextLoans);
        setItems(nextItems);

        if (isRefresh) {
          showNotification("success", "Data peminjaman berhasil diperbarui.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        const message = getErrorMessage(err, "Gagal mengambil data peminjaman.");
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

  const filteredLoans = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return loans.filter((loan) => {
      const itemName = loan.item?.name || loan.itemName || "";
      const purpose = loan.purpose || "";
      const matchesSearch =
        String(loan.id || "").includes(keyword) ||
        itemName.toLowerCase().includes(keyword) ||
        purpose.toLowerCase().includes(keyword);

      const matchesStatus = !statusFilter || loan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  const availableItems = useMemo(() => {
    return items.filter(
      (item) => item.isActive !== false && Number(item.available) > 0
    );
  }, [items]);

  const stats = useMemo(() => {
    return {
      total: loans.length,
      pending: loans.filter((l) => l.status === "MENUNGGU").length,
      borrowed: loans.filter((l) => l.status === "DIPINJAM").length,
      returned: loans.filter((l) => l.status === "DIKEMBALIKAN").length,
    };
  }, [loans]);

  const openCreateModal = () => {
    setForm({
      ...initialForm,
      itemId: availableItems[0]?.id ? String(availableItems[0].id) : "",
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeCreateModal = () => {
    if (saving) return;
    setFormOpen(false);
    setForm(initialForm);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "itemId" || name === "quantity"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleCreateLoan = async (event) => {
    event.preventDefault();

    if (!form.itemId) {
      const msg = "Barang wajib dipilih.";
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    if (Number(form.quantity) < 1) {
      const msg = "Jumlah peminjaman minimal 1.";
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    const selectedItem = items.find(
      (item) => String(item.id) === String(form.itemId)
    );

    if (selectedItem && Number(form.quantity) > Number(selectedItem.available)) {
      const msg = `Stok tersedia hanya ${selectedItem.available} unit.`;
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    if (!form.purpose.trim()) {
      const msg = "Tujuan peminjaman wajib diisi.";
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    if (!form.startDate || !form.endDate) {
      const msg = "Tanggal mulai dan selesai wajib diisi.";
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      const msg = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
      setFormError(msg);
      showNotification("error", msg);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await createLoan({
        itemId: Number(form.itemId),
        quantity: Number(form.quantity),
        purpose: form.purpose.trim(),
        notes: form.notes.trim() || null,
        startDate: form.startDate,
        endDate: form.endDate,
      });

      closeCreateModal();
      showNotification("success", "Pengajuan peminjaman berhasil dibuat.");
      await fetchData();
    } catch (err) {
      console.error("Create loan error:", err);
      const msg = getErrorMessage(err, "Gagal membuat pengajuan peminjaman.");
      setFormError(msg);
      showNotification("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (loan) => {
    setSelectedLoan(loan);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setSelectedLoan(null);
    setDetailOpen(false);
  };

  const openCancelConfirm = (loan) => {
    setSelectedLoan(loan);
    setConfirmOpen(true);
  };

  const closeCancelConfirm = () => {
    if (actionLoading) return;
    setSelectedLoan(null);
    setConfirmOpen(false);
  };

  const handleCancelLoan = async () => {
    if (!selectedLoan) return;

    try {
      setActionLoading(true);
      await cancelLoan(selectedLoan.id);
      closeCancelConfirm();
      showNotification("success", "Peminjaman berhasil dibatalkan.");
      await fetchData();
    } catch (err) {
      console.error("Cancel loan error:", err);
      const msg = getErrorMessage(err, "Gagal membatalkan peminjaman.");
      setError(msg);
      showNotification("error", msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="relative space-y-8">
      {/* Toast Notification */}
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
            Layanan Warga
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Peminjaman Saya
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Kelola dan pantau seluruh status pengajuan peminjaman barang RT Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Ajukan Peminjaman
        </button>
      </div>

      {/* Stat Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Total Pengajuan</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-amber-500">Menunggu</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-violet-500">Sedang Dipinjam</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.borrowed}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-emerald-500">Dikembalikan</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.returned}</p>
        </div>
      </div>

      {/* Error alert */}
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
              placeholder="Cari ID, barang, atau tujuan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
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
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : filteredLoans.length === 0 ? (
          <EmptyState
            title={
              search || statusFilter
                ? "Peminjaman tidak ditemukan"
                : "Belum ada pengajuan peminjaman"
            }
            description={
              search || statusFilter
                ? "Coba sesuaikan kata kunci atau filter status."
                : "Klik tombol 'Ajukan Peminjaman' untuk mengajukan pinjaman barang RT."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nomor</th>
                  <th className="px-6 py-4 font-semibold">Barang</th>
                  <th className="px-6 py-4 font-semibold">Jumlah</th>
                  <th className="px-6 py-4 font-semibold">Periode Pinjam</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        LOAN-{String(loan.id).padStart(5, "0")}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(loan.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {loan.item?.name || loan.itemName || "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {loan.item?.code || loan.itemCode || "Tanpa kode"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {loan.quantity || 0} unit
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays size={14} className="text-emerald-600" />
                        <span>
                          {formatDate(loan.startDate)} - {formatDate(loan.endDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDetail(loan)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
                        >
                          <Eye size={14} />
                          Detail
                        </button>
                        {loan.status === "MENUNGGU" && (
                          <button
                            type="button"
                            onClick={() => openCancelConfirm(loan)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            <X size={14} />
                            Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ajukan Peminjaman */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Form Pengajuan Peminjaman
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Isi formulir di bawah ini untuk mengajukan peminjaman barang RT.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4 p-6">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pilih Barang <span className="text-rose-500">*</span>
                </label>
                {availableItems.length === 0 ? (
                  <p className="mt-1 text-xs text-rose-500">
                    Tidak ada barang yang tersedia untuk dipinjam saat ini.
                  </p>
                ) : (
                  <select
                    name="itemId"
                    value={form.itemId}
                    onChange={handleFormChange}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  >
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.code}) — Tersedia: {item.available}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Jumlah Dipinjam <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={form.quantity}
                  onChange={handleFormChange}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Tanggal Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleFormChange}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Tanggal Selesai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleFormChange}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tujuan Peminjaman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="purpose"
                  rows="3"
                  value={form.purpose}
                  onChange={handleFormChange}
                  placeholder="Jelaskan tujuan peminjaman barang ini..."
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Catatan Tambahan
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Catatan opsional jika ada..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || availableItems.length === 0}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Peminjaman */}
      <LoanDetailModal
        loan={selectedLoan}
        open={detailOpen}
        onClose={closeDetail}
      />

      {/* Modal Konfirmasi Pembatalan */}
      <ConfirmModal
        open={confirmOpen}
        title="Batalkan pengajuan peminjaman?"
        message="Pengajuan peminjaman ini akan dibatalkan."
        confirmText="Batalkan Peminjaman"
        cancelText="Tutup"
        danger
        loading={actionLoading}
        onConfirm={handleCancelLoan}
        onClose={closeCancelConfirm}
      />
    </div>
  );
}
