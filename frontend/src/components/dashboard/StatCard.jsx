const colorVariants = {
  emerald: {
    icon: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-700",
  },
  blue: {
    icon: "bg-blue-100 text-blue-600",
    value: "text-blue-700",
  },
  amber: {
    icon: "bg-amber-100 text-amber-600",
    value: "text-amber-700",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600",
    value: "text-violet-700",
  },
  rose: {
    icon: "bg-rose-100 text-rose-600",
    value: "text-rose-700",
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "emerald",
}) {
  const variant = colorVariants[color] || colorVariants.emerald;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3
            className={`mt-3 text-3xl font-bold tracking-tight ${variant.value}`}
          >
            {value}
          </h3>

          {description && (
            <p className="mt-2 text-xs text-slate-400">{description}</p>
          )}
        </div>

        <div className={`rounded-xl p-3 ${variant.icon}`}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}