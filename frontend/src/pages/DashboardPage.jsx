import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowDownToLine,
  Boxes,
  ClipboardList,
  FolderKanban,
  PackageCheck,
  RefreshCw,
  Users,
} from "lucide-react";

import { getDashboard } from "../api/dashboardApi";
import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/dashboard/StatusBadge";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(date));
};

const getStatusTotal = (statistics, status) => {
  const item = statistics?.find((entry) => entry.status === status);

  return item?.total || 0;
};

export default function DashboardPage() {
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

      const response = await getDashboard();

      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);

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
  const loanStatistics = dashboard?.loanStatistics || [];
  const recentLoans = dashboard?.recentLoans || [];
  const popularItems = dashboard?.popularItems || [];

    const totalStock = Number(summary?.totalStock ?? 0);
    const availableStock = Number(summary?.totalAvailableStock ?? 0);

    const borrowedStock = Math.max(
    totalStock - availableStock,
    0
    );

  const totalLoanStatistics = useMemo(() => {
    return loanStatistics.reduce((total, item) => total + item.total, 0);
  }, [loanStatistics]);

  const pendingLoans = getStatusTotal(loanStatistics, "MENUNGGU");
  const approvedLoans = getStatusTotal(loanStatistics, "DISETUJUI");
  const activeLoans = getStatusTotal(loanStatistics, "DIPINJAM");
  const returnedLoans = getStatusTotal(loanStatistics, "DIKEMBALIKAN");

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
        </div>

        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-600">
            Ringkasan Aktivitas RT
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Pantau inventaris dan aktivitas peminjaman barang secara realtime.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Memuat..." : "Refresh Data"}
        </button>
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Barang"
          value={summary.totalItems || 0}
          description={`${summary.availableStock || 0} barang tersedia`}
          icon={Archive}
          color="emerald"
        />

        <StatCard
          title="Total Warga"
          value={summary.totalUsers || 0}
          description="Pengguna terdaftar"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Total Kategori"
          value={summary.totalCategories || 0}
          description="Kategori inventaris"
          icon={FolderKanban}
          color="violet"
        />

        <StatCard
          title="Total Peminjaman"
          value={summary.totalLoans || 0}
          description={`${pendingLoans} menunggu persetujuan`}
          icon={ClipboardList}
          color="amber"
        />
      </div>

      {/* Stock Overview */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Ringkasan Peminjaman
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Distribusi status peminjaman barang.
              </p>
            </div>

            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <ClipboardList size={21} />
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <LoanProgress
              label="Menunggu"
              value={pendingLoans}
              total={totalLoanStatistics}
              className="bg-amber-500"
            />

            <LoanProgress
              label="Disetujui"
              value={approvedLoans}
              total={totalLoanStatistics}
              className="bg-blue-500"
            />

            <LoanProgress
              label="Sedang Dipinjam"
              value={activeLoans}
              total={totalLoanStatistics}
              className="bg-violet-500"
            />

            <LoanProgress
              label="Dikembalikan"
              value={returnedLoans}
              total={totalLoanStatistics}
              className="bg-emerald-500"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Kondisi Inventaris
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ringkasan stok barang.
              </p>
            </div>

            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Boxes size={21} />
            </div>
          </div>

        <div className="mt-8 flex items-center justify-center">
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-emerald-100">
            <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
                {availableStock}
            </p>

            <p className="text-xs text-slate-500">
                Tersedia
            </p>
            </div>
        </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
        <StockInfo
            label="Total Stok"
            value={totalStock}
            icon={Boxes}
        />

        <StockInfo
            label="Dipinjam"
            value={borrowedStock}
            icon={ArrowDownToLine}
        />
        </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Barang Sering Dipinjam
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Barang dengan aktivitas peminjaman terbanyak.
            </p>
          </div>

          <PackageCheck className="text-emerald-600" size={22} />
        </div>

        {popularItems.length === 0 ? (
          <EmptyState message="Belum ada data barang yang sering dipinjam." />
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {popularItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.code || "Tanpa kode"}
                    </p>
                  </div>

                  <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                    {item.totalLoans || item.loanCount || 0}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Loans */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="font-bold text-slate-900">
              Peminjaman Terbaru
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Aktivitas peminjaman terakhir.
            </p>
          </div>

          <ClipboardList className="text-emerald-600" size={22} />
        </div>

        {recentLoans.length === 0 ? (
          <EmptyState message="Belum ada aktivitas peminjaman." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Peminjam</th>
                  <th className="px-6 py-4 font-semibold">Barang</th>
                  <th className="px-6 py-4 font-semibold">Jumlah</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {loan.user?.name || loan.userName || "-"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {loan.user?.email || ""}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">
                        {loan.item?.name || loan.itemName || "-"}
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

function LoanProgress({ label, value, total, className }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>

        <span className="font-semibold text-slate-800">
          {value}{" "}
          <span className="font-normal text-slate-400">
            ({percentage}%)
          </span>
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${className}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function StockInfo({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={15} />

        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-2 text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <ClipboardList size={22} />
      </div>

      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </div>
  );
}