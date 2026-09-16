import { PackageOpen } from "lucide-react";

export default function EmptyState({
  title = "Belum ada data",
  description = "Data belum tersedia.",
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <PackageOpen size={26} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-700">{title}</h3>

      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}