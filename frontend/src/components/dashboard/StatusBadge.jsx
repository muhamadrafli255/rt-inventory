const statusConfig = {
  MENUNGGU: {
    label: "Menunggu",
    className: "bg-amber-100 text-amber-700",
  },
  DISETUJUI: {
    label: "Disetujui",
    className: "bg-blue-100 text-blue-700",
  },
  DIPINJAM: {
    label: "Sedang Dipinjam",
    className: "bg-violet-100 text-violet-700",
  },
  DIKEMBALIKAN: {
    label: "Dikembalikan",
    className: "bg-emerald-100 text-emerald-700",
  },
  DITOLAK: {
    label: "Ditolak",
    className: "bg-rose-100 text-rose-700",
  },
  DIBATALKAN: {
    label: "Dibatalkan",
    className: "bg-slate-100 text-slate-600",
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}