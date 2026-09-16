import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
          <ShieldX size={32} />
        </div>

        <h1 className="text-2xl font-bold text-white">
          Akses Ditolak
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Akun kamu tidak memiliki izin untuk mengakses halaman ini.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}