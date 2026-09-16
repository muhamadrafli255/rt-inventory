import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  approveLoan,
  borrowLoan,
  cancelLoan,
  createLoan,
  getLoans,
  rejectLoan,
  returnLoan,
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
  {
    value: "",
    label: "Semua Status",
  },
  {
    value: "MENUNGGU",
    label: "Menunggu",
  },
  {
    value: "DISETUJUI",
    label: "Disetujui",
  },
  {
    value: "DIPINJAM",
    label: "Sedang Dipinjam",
  },
  {
    value: "DIKEMBALIKAN",
    label: "Dikembalikan",
  },
  {
    value: "DITOLAK",
    label: "Ditolak",
  },
  {
    value: "DIBATALKAN",
    label: "Dibatalkan",
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

  if (Array.isArray(data?.loans)) {
    return data.loans;
  }

  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }

  if (Array.isArray(data?.data?.loans)) {
    return data.data.loans;
  }

  return [];
}

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(parsedDate);
}

function getErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (responseData?.message) {
    return responseData.message;
  }

  const fieldErrors = responseData?.errors?.fieldErrors;

  if (fieldErrors && typeof fieldErrors === "object") {
    const messages = Object.entries(fieldErrors).flatMap(
      ([field, errors]) => {
        if (!Array.isArray(errors)) return [];

        return errors.map((message) => `${field}: ${message}`);
      },
    );

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return fallbackMessage;
}

export default function LoansPage() {
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
  const [rejectOpen, setRejectOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionType, setActionType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

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

        const [loansResponse, itemsResponse] = await Promise.all([
          getLoans(),
          getItems(),
        ]);

        const nextLoans = extractArray(loansResponse);
        const nextItems = extractArray(itemsResponse);

        setLoans(nextLoans);
        setItems(nextItems);

        if (isRefresh) {
          showNotification(
            "success",
            "Data peminjaman berhasil diperbarui.",
          );
        }
      } catch (err) {
        console.error("Loan fetch error:", err);

        const message = getErrorMessage(
          err,
          "Gagal mengambil data peminjaman.",
        );

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

  const filteredLoans = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return loans.filter((loan) => {
      const borrowerName =
        loan.user?.name ||
        loan.userName ||
        loan.borrower?.name ||
        "";

      const borrowerEmail =
        loan.user?.email ||
        loan.userEmail ||
        loan.borrower?.email ||
        "";

      const itemName =
        loan.item?.name ||
        loan.itemName ||
        "";

      const matchesSearch =
        String(loan.id || "").includes(keyword) ||
        borrowerName.toLowerCase().includes(keyword) ||
        borrowerEmail.toLowerCase().includes(keyword) ||
        itemName.toLowerCase().includes(keyword);

      const matchesStatus =
        !statusFilter || loan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  const availableItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.isActive !== false &&
        Number(item.available) > 0,
    );
  }, [items]);

  const openCreateModal = () => {
    setForm({
      ...initialForm,
      itemId: availableItems[0]?.id
        ? String(availableItems[0].id)
        : "",
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

    setForm((previous) => ({
      ...previous,
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
      const message = "Barang wajib dipilih.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (Number(form.quantity) < 1) {
      const message = "Jumlah peminjaman minimal 1.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    const selectedItem = items.find(
      (item) => String(item.id) === String(form.itemId),
    );

    if (
      selectedItem &&
      Number(form.quantity) > Number(selectedItem.available)
    ) {
      const message = `Stok tersedia hanya ${selectedItem.available} unit.`;

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (!form.purpose.trim()) {
      const message = "Tujuan peminjaman wajib diisi.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (!form.startDate || !form.endDate) {
      const message = "Tanggal mulai dan selesai wajib diisi.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      const message =
        "Tanggal selesai tidak boleh sebelum tanggal mulai.";

      setFormError(message);
      showNotification("error", message);

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

      showNotification(
        "success",
        "Pengajuan peminjaman berhasil dibuat.",
      );

      await fetchData();
    } catch (err) {
      console.error("Create loan error:", err);

      const message = getErrorMessage(
        err,
        "Gagal membuat pengajuan peminjaman.",
      );

      setFormError(message);
      showNotification("error", message);
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

  const openActionConfirm = (loan, type) => {
    setSelectedLoan(loan);
    setActionType(type);
    setConfirmOpen(true);
  };

  const closeActionConfirm = () => {
    if (actionLoading) return;

    setSelectedLoan(null);
    setActionType("");
    setConfirmOpen(false);
  };

  const handleAction = async () => {
    if (!selectedLoan) return;

    try {
      setActionLoading(true);

      if (actionType === "approve") {
        await approveLoan(selectedLoan.id);
      }

      if (actionType === "borrow") {
        await borrowLoan(selectedLoan.id);
      }

      if (actionType === "return") {
        await returnLoan(selectedLoan.id);
      }

      if (actionType === "cancel") {
        await cancelLoan(selectedLoan.id);
      }

      const successMessages = {
        approve: "Peminjaman berhasil disetujui.",
        borrow: "Peminjaman berhasil ditandai sebagai dipinjam.",
        return: "Peminjaman berhasil dikembalikan.",
        cancel: "Peminjaman berhasil dibatalkan.",
      };

      closeActionConfirm();

      showNotification(
        "success",
        successMessages[actionType] || "Aksi berhasil dilakukan.",
      );

      await fetchData();
    } catch (err) {
      console.error("Loan action error:", err);

      const message = getErrorMessage(
        err,
        "Aksi peminjaman gagal dilakukan.",
      );

      setError(message);
      showNotification("error", message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (loan) => {
    setSelectedLoan(loan);
    setRejectionReason("");
    setFormError("");
    setRejectOpen(true);
  };

  const closeRejectModal = () => {
    if (actionLoading) return;

    setSelectedLoan(null);
    setRejectionReason("");
    setRejectOpen(false);
    setFormError("");
  };

  const handleReject = async (event) => {
    event.preventDefault();

    if (!selectedLoan) return;

    if (!rejectionReason.trim()) {
      const message = "Alasan penolakan wajib diisi.";

      setFormError(message);
      showNotification("error", message);

      return;
    }

    try {
      setActionLoading(true);
      setFormError("");

      await rejectLoan(selectedLoan.id, {
        rejectionReason: rejectionReason.trim(),
      });

      closeRejectModal();

      showNotification(
        "success",
        "Peminjaman berhasil ditolak.",
      );

      await fetchData();
    } catch (err) {
      console.error("Reject loan error:", err);

      const message = getErrorMessage(
        err,
        "Gagal menolak peminjaman.",
      );

      setFormError(message);
      showNotification("error", message);
    } finally {
      setActionLoading(false);
    }
  };

  const getActionText = () => {
    const actionTexts = {
      approve: {
        title: "Setujui peminjaman?",
        message:
          "Pengajuan ini akan disetujui dan dapat dilanjutkan ke proses pengambilan barang.",
        confirm: "Setujui",
      },
      borrow: {
        title: "Tandai sebagai dipinjam?",
        message:
          "Stok barang akan dikurangi sesuai jumlah peminjaman.",
        confirm: "Tandai Dipinjam",
      },
      return: {
        title: "Konfirmasi pengembalian?",
        message:
          "Barang akan dianggap sudah dikembalikan dan stok tersedia akan bertambah.",
        confirm: "Konfirmasi Kembali",
      },
      cancel: {
        title: "Batalkan peminjaman?",
        message:
          "Pengajuan peminjaman ini akan dibatalkan.",
        confirm: "Batalkan",
      },
    };

    return (
      actionTexts[actionType] || {
        title: "Konfirmasi aksi",
        message: "Apakah kamu yakin ingin melanjutkan?",
        confirm: "Lanjutkan",
      }
    );
  };

  const actionText = getActionText();

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
            Manajemen Transaksi
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Peminjaman Barang
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola pengajuan, persetujuan, peminjaman, dan
            pengembalian barang.
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
              placeholder="Cari ID, peminjam, atau barang..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
        ) : filteredLoans.length === 0 ? (
          <EmptyState
            title={
              search || statusFilter
                ? "Peminjaman tidak ditemukan"
                : "Belum ada peminjaman"
            }
            description={
              search || statusFilter
                ? "Coba ubah kata kunci atau filter status."
                : "Ajukan peminjaman barang untuk mulai membuat transaksi."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Peminjaman
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Peminjam
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Barang
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Periode
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Jumlah
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        LOAN-{String(loan.id).padStart(5, "0")}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(loan.createdAt)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {loan.user?.name ||
                          loan.userName ||
                          loan.borrower?.name ||
                          "-"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {loan.user?.email ||
                          loan.userEmail ||
                          loan.borrower?.email ||
                          ""}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">
                        {loan.item?.name ||
                          loan.itemName ||
                          "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays size={15} />

                        <span>
                          {formatDate(loan.startDate)}

                          <span className="mx-1 text-slate-300">
                            →
                          </span>

                          {formatDate(loan.endDate)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {loan.quantity} unit
                    </td>

                    <td className="px-6 py-4">
                      <LoanStatusBadge status={loan.status} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDetail(loan)}
                          title="Lihat detail"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Eye size={17} />
                        </button>

                        {loan.status === "MENUNGGU" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                openActionConfirm(
                                  loan,
                                  "approve",
                                )
                              }
                              title="Setujui"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Check size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openRejectModal(loan)}
                              title="Tolak"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              <X size={17} />
                            </button>
                          </>
                        )}

                        {loan.status === "DISETUJUI" && (
                          <button
                            type="button"
                            onClick={() =>
                              openActionConfirm(loan, "borrow")
                            }
                            title="Tandai dipinjam"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                          >
                            <ClipboardList size={17} />
                          </button>
                        )}

                        {loan.status === "DIPINJAM" && (
                          <button
                            type="button"
                            onClick={() =>
                              openActionConfirm(loan, "return")
                            }
                            title="Tandai dikembalikan"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <Check size={17} />
                          </button>
                        )}

                        {["MENUNGGU", "DISETUJUI"].includes(
                          loan.status,
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              openActionConfirm(loan, "cancel")
                            }
                            title="Batalkan"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <X size={17} />
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

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Ajukan Peminjaman
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Isi data barang dan periode peminjaman.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleCreateLoan}
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

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Barang
                  </label>

                  <select
                    name="itemId"
                    value={form.itemId}
                    onChange={handleFormChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">Pilih barang</option>

                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — tersedia {item.available}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Jumlah
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleFormChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tanggal Mulai
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleFormChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tanggal Selesai
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleFormChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tujuan Peminjaman
                </label>

                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Contoh: Digunakan untuk kegiatan kerja bakti RT."
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Catatan
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Catatan tambahan jika diperlukan..."
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
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

                  {saving ? "Mengirim..." : "Ajukan Peminjaman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LoanDetailModal
        loan={selectedLoan}
        open={detailOpen}
        onClose={closeDetail}
      />

      <ConfirmModal
        open={confirmOpen}
        title={actionText.title}
        message={actionText.message}
        confirmText={actionText.confirm}
        loading={actionLoading}
        onCancel={closeActionConfirm}
        onConfirm={handleAction}
      />

      {rejectOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tolak Peminjaman
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Berikan alasan penolakan kepada peminjam.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRejectModal}
                disabled={actionLoading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleReject}
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
                  Alasan Penolakan
                </label>

                <textarea
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  rows={4}
                  placeholder="Contoh: Barang sedang digunakan untuk kegiatan RT."
                  disabled={actionLoading}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {actionLoading
                    ? "Memproses..."
                    : "Tolak Peminjaman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}