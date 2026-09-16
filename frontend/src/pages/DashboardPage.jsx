import {
  Package,
  ClipboardList,
  Users,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Barang",
    value: "128",
    description: "Inventaris terdaftar",
    icon: Package,
  },
  {
    label: "Sedang Dipinjam",
    value: "24",
    description: "Barang digunakan warga",
    icon: ClipboardList,
  },
  {
    label: "Total Warga",
    value: "356",
    description: "Warga terdaftar",
    icon: Users,
  },
  {
    label: "Menunggu Persetujuan",
    value: "8",
    description: "Pengajuan baru",
    icon: Clock3,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Ringkasan sistem
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Selamat datang di RT Inventory
        </h1>

        <p className="mt-2 text-slate-500">
          Pantau inventaris dan aktivitas peminjaman warga.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Icon size={22} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {stat.label}
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                {stat.value}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pengajuan Terbaru
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Aktivitas peminjaman terbaru dari warga.
              </p>
            </div>

            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Lihat semua
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-400">
                  <th className="pb-3 font-medium">Warga</th>
                  <th className="pb-3 font-medium">Barang</th>
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 font-medium text-slate-800">
                    Budi Santoso
                  </td>

                  <td className="py-4 text-slate-500">
                    Kursi Plastik
                  </td>

                  <td className="py-4 text-slate-500">
                    16 Sep 2026
                  </td>

                  <td className="py-4">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                      Menunggu
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-4 font-medium text-slate-800">
                    Siti Aminah
                  </td>

                  <td className="py-4 text-slate-500">
                    Sound System
                  </td>

                  <td className="py-4 text-slate-500">
                    15 Sep 2026
                  </td>

                  <td className="py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      Disetujui
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Barang Populer
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Barang yang paling sering dipinjam.
          </p>

          <div className="mt-6 space-y-5">
            {[
              ["Kursi Plastik", "32 peminjaman"],
              ["Tenda", "18 peminjaman"],
              ["Sound System", "14 peminjaman"],
              ["Meja Lipat", "11 peminjaman"],
            ].map(([name, total]) => (
              <div
                key={name}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {total}
                  </p>
                </div>

                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-3/4 rounded-full bg-indigo-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}