import { CalendarDays, ClipboardList, User, X } from "lucide-react";
import LoanStatusBadge from "./LoanStatusBadge";

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(date));
};

export default function LoanDetailModal({
  loan,
  open,
  onClose,
}) {
  if (!open || !loan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Detail Peminjaman
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informasi lengkap transaksi peminjaman.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs text-slate-400">
                Nomor Peminjaman
              </p>

              <p className="mt-1 font-bold text-slate-800">
                LOAN-{String(loan.id).padStart(5, "0")}
              </p>
            </div>

            <LoanStatusBadge status={loan.status} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <InfoItem
              icon={User}
              label="Peminjam"
              value={loan.user?.name || loan.userName || "-"}
            />

            <InfoItem
              icon={ClipboardList}
              label="Barang"
              value={loan.item?.name || loan.itemName || "-"}
            />

            <InfoItem
              icon={CalendarDays}
              label="Tanggal Mulai"
              value={formatDate(loan.startDate)}
            />

            <InfoItem
              icon={CalendarDays}
              label="Tanggal Selesai"
              value={formatDate(loan.endDate)}
            />
          </div>

          <div className="grid gap-4 rounded-xl border border-slate-100 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">
                Jumlah Dipinjam
              </p>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {loan.quantity || 0} unit
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Dibuat Pada
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {formatDate(loan.createdAt)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">
              Tujuan Peminjaman
            </p>

            <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {loan.purpose || "-"}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">
              Catatan
            </p>

            <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {loan.notes || "Tidak ada catatan."}
            </div>
          </div>

          {loan.rejectionReason && (
            <div>
              <p className="text-sm font-semibold text-rose-700">
                Alasan Penolakan
              </p>

              <div className="mt-2 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">
                {loan.rejectionReason}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
        <Icon size={17} />
      </div>

      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}