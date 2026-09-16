import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getWargaDashboard } from "../../api/dashboardApi";
import StatusBadge from "../../components/dashboard/StatusBadge";
import StatCard from "../../components/dashboard/StatCard";

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(date));
};

export default function WargaDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getWargaDashboard();

      const result = response?.data ?? response;

      setDashboard(result?.data ?? result);
    } catch (err) {
      console.error("Warga dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil data dashboard. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summary = dashboard?.summary || {};

  // Sesuaikan nama property dengan response backend
  const myLoans =
    dashboard?.myLoans ||
    dashboard?.loans ||
    dashboard?.recentLoans ||
    [];

  const pendingLoans = myLoans.filter(
    (loan) => loan.status === "MENUNGGU"
  ).length;

  const activeLoans = myLoans.filter(
    (loan) =>
      loan.status === "DISETUJUI" ||
      loan.status === "DIPINJAM"
  ).length;

  const returnedLoans = myLoans.filter(
    (loan) => loan.status === "DIKEMBALIKAN"
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white shadow-lg md:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-emerald-100">
            Portal Warga
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Halo, {dashboard?.user?.name || "Warga"} 👋
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50 md:text-base">
            Kelola peminjaman barang inventaris RT dengan mudah.
            Temukan barang yang tersedia dan pantau status pengajuanmu.
          </p>

          <Link
            to="/items"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            <Search size={17} />
            Lihat Katalog Barang
            <ArrowRight size={16} />
          </Link>
        </div>

        <Package
          size={180}
          className="absolute -bottom-10 -right-8 text-white/10"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">{error}</p>

          <button
            type="button"
            onClick={() => fetchDashboard()}
            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Refresh */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {/* User Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Barang Tersedia"
          value={
            summary.totalAvailableStock ??
            summary.availableStock ??
            0
          }
          description="Siap untuk dipinjam"
          icon={Package}
          color="emerald"
        />

        <StatCard
          title="Peminjaman Saya"
          value={myLoans.length}
          description="Total pengajuan peminjaman"
          icon={ClipboardList}
          color="blue"
        />

        <StatCard
          title="Sedang Dipinjam"
          value={activeLoans}
          description={`${pendingLoans} menunggu persetujuan`}
          icon={CalendarDays}
          color="violet"
        />
      </div>

      {/* Quick Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-700">
            Menunggu Persetujuan
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-900">
            {pendingLoans}
          </p>

          <p className="mt-1 text-xs text-amber-700">
            Pengajuan sedang diproses admin
          </p>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <p className="text-sm font-medium text-violet-700">
            Peminjaman Aktif
          </p>

          <p className="mt-2 text-3xl font-bold text-violet-900">
            {activeLoans}
          </p>

          <p className="mt-1 text-xs text-violet-700">
            Barang yang masih kamu gunakan
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-medium text-emerald-700">
            Selesai Dikembalikan
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-900">
            {returnedLoans}
          </p>

          <p className="mt-1 text-xs text-emerald-700">
            Riwayat peminjaman selesai
          </p>
        </div>
      </div>

      {/* My Loans */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-900">
              Peminjaman Terbaru Saya
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pantau status pengajuan peminjaman barangmu.
            </p>
          </div>

          <Link
            to="/my-loans"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Lihat Semua
            <ArrowRight size={16} />
          </Link>
        </div>

        {myLoans.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ClipboardList size={22} />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Kamu belum memiliki peminjaman.
            </p>

            <Link
              to="/items"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Cari Barang
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Barang</th>
                  <th className="px-6 py-4 font-semibold">Jumlah</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {myLoans.slice(0, 5).map((loan) => (
                  <tr
                    key={loan.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {loan.item?.name || loan.itemName || "-"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {loan.item?.code || loan.itemCode || ""}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {loan.quantity || 0} unit
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(loan.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={loan.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}