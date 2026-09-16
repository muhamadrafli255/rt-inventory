import {
  ArrowUpRight,
  Boxes,
  ClipboardList,
  PackageCheck,
  Users,
  Plus,
  MoreHorizontal,
} from "lucide-react";

const stats = [
  {
    label: "Total Barang",
    value: "0",
    icon: Boxes,
    description: "Barang aktif",
  },
  {
    label: "Total Warga",
    value: "0",
    icon: Users,
    description: "Pengguna terdaftar",
  },
  {
    label: "Peminjaman",
    value: "0",
    icon: ClipboardList,
    description: "Seluruh transaksi",
  },
  {
    label: "Sedang Dipinjam",
    value: "0",
    icon: PackageCheck,
    description: "Barang digunakan",
  },
];

const borrowingStatuses = [
  ["Menunggu", 0],
  ["Disetujui", 0],
  ["Dipinjam", 0],
  ["Dikembalikan", 0],
];

export default function DashboardPage() {
  return (
    <div className="min-h-full space-y-8 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Overview
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Pantau kondisi inventaris dan aktivitas warga.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700">
          Lihat laporan
          <ArrowUpRight size={17} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon size={21} />
                </div>

                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                  Live
                </span>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {stat.label}
              </p>

              <h3 className="mt-1 text-3xl font-bold text-slate-900">
                {stat.value}
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent activities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Aktivitas Peminjaman
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Ringkasan transaksi terbaru.
              </p>
            </div>

            <button className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700">
              Lihat semua
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="mt-8 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
              <ClipboardList size={23} />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Belum ada aktivitas peminjaman
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Transaksi terbaru akan muncul di area ini.
            </p>
          </div>
        </div>

        {/* Borrowing status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Status Peminjaman
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Distribusi status transaksi.
              </p>
            </div>

            <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="mt-8 space-y-5">
            {borrowingStatuses.map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">{label}</span>

                  <span className="font-bold text-slate-800">
                    {value}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: value > 0 ? `${value}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-emerald-800">
              Mulai kelola inventaris
            </p>

            <p className="mt-1 text-sm text-emerald-700/70">
              Tambahkan barang pertama agar inventaris RT mulai tercatat.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700">
            <Plus size={17} />
            Tambah Barang
          </button>
        </div>
      </div>
    </div>
  );
}