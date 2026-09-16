import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Boxes,
  ShieldCheck,
  LoaderCircle,
  ClipboardList,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Email atau password yang kamu masukkan salah.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh w-full overflow-hidden bg-slate-50">
      <div className="grid min-h-dvh w-full lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT PANEL */}
        <section className="relative hidden min-h-dvh overflow-hidden bg-emerald-700 lg:flex">
          {/* Decorative shapes */}
          <div className="absolute -left-32 -top-32 h-[430px] w-[430px] rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-40 -right-24 h-[520px] w-[520px] rounded-full bg-teal-300/20 blur-3xl" />
          <div className="absolute right-20 top-24 h-40 w-40 rounded-full border border-white/10" />
          <div className="absolute right-32 top-36 h-24 w-24 rounded-full border border-white/10" />

          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,78,59,0.98),rgba(4,120,87,0.96),rgba(5,150,105,0.92))]" />

          <div className="relative z-10 flex min-h-dvh w-full flex-col justify-between px-10 py-10 xl:px-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-xl shadow-emerald-950/20">
                <Boxes size={23} strokeWidth={2.4} />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-white">
                  RT Inventory
                </p>

                <p className="text-xs text-emerald-100">
                  Sistem inventaris warga
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-xl py-12">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
                Kelola inventaris lebih mudah
              </div>

              <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-white xl:text-6xl">
                Semua barang warga,
                <span className="block text-emerald-100">
                  tercatat dengan rapi.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-emerald-50/80 xl:text-lg">
                Kelola data barang, peminjaman, pengembalian, dan aktivitas
                inventaris RT dalam satu sistem yang sederhana.
              </p>

              <div className="mt-9 grid max-w-md gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <ShieldCheck className="mb-3 text-emerald-100" size={23} />

                  <p className="text-sm font-semibold text-white">
                    Data lebih aman
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                    Akses berdasarkan akun dan hak akses.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <ClipboardList className="mb-3 text-emerald-100" size={23} />

                  <p className="text-sm font-semibold text-white">
                    Inventaris terorganisir
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                    Pantau barang dan status peminjaman.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-emerald-100/60">
              © {new Date().getFullYear()} RT Inventory. All rights reserved.
            </p>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex min-h-dvh items-center justify-center overflow-y-auto bg-slate-50 px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <Boxes size={23} strokeWidth={2.4} />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900">
                  RT Inventory
                </p>

                <p className="text-xs text-slate-500">
                  Sistem inventaris warga
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-emerald-600">
                Selamat datang kembali
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Masuk ke akunmu
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Masukkan data akun untuk melanjutkan ke dashboard inventaris.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    required
                    className="h-13 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                    className="h-13 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight
                      size={19}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Belum memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                >
                  Daftar sekarang
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
