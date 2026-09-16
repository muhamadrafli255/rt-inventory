import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  Boxes,
  ClipboardList,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  if (user) {
    return <Navigate to="/" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      general: "",
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Nama minimal 2 karakter";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!form.password) {
      newErrors.password = "Password wajib diisi";
    } else if (form.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    if (!form.passwordConfirmation) {
      newErrors.passwordConfirmation =
        "Konfirmasi password wajib diisi";
    } else if (form.password !== form.passwordConfirmation) {
      newErrors.passwordConfirmation = "Password tidak sama";
    }

    setErrors(newErrors);

    const hasError = Object.keys(newErrors).length > 0;
    if (hasError) {
      const firstErrorMsg = Object.values(newErrors)[0];
      showNotification("error", firstErrorMsg);
    }

    return !hasError;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        passwordConfirmation: form.passwordConfirmation,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Registrasi berhasil. Silakan masuk menggunakan akunmu.",
        },
      });
    } catch (error) {
      const responseData = error.response?.data;

      const fieldErrors =
        responseData?.errors?.fieldErrors || {};

      const generalMsg =
        responseData?.message ||
        "Registrasi gagal. Silakan coba lagi.";

      setErrors({
        name: fieldErrors.name?.[0] || "",
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
        passwordConfirmation:
          fieldErrors.passwordConfirmation?.[0] || "",
        general: generalMsg,
      });

      showNotification("error", generalMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-slate-50">
      {/* Toast Notification */}
      {notification && (
        <div
          className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/95 px-4 py-3 text-rose-800 shadow-xl backdrop-blur-md transition-all"
        >
          <AlertCircle size={22} className="mt-0.5 shrink-0 text-rose-600" />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Registrasi Gagal</p>
            <p className="mt-0.5 text-sm leading-5 opacity-90">
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotification(null)}
            className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid min-h-dvh w-full lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT BRAND PANEL */}
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
                Bangun pengelolaan
                <span className="block text-emerald-100">
                  inventaris yang tertata.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-emerald-50/80 xl:text-lg">
                Daftarkan akun dan mulai kelola barang, peminjaman,
                pengembalian, dan aktivitas inventaris RT dalam satu
                sistem yang sederhana.
              </p>

              <div className="mt-9 grid max-w-md gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <ShieldCheck
                    className="mb-3 text-emerald-100"
                    size={23}
                  />

                  <p className="text-sm font-semibold text-white">
                    Data lebih aman
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                    Akses berdasarkan akun dan hak akses.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <ClipboardList
                    className="mb-3 text-emerald-100"
                    size={23}
                  />

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
              © {new Date().getFullYear()} RT Inventory. All rights
              reserved.
            </p>
          </div>
        </section>

        {/* RIGHT REGISTER PANEL */}
        <section className="flex min-h-dvh items-center justify-center overflow-y-auto bg-slate-50 px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
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
                MULAI SEKARANG
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Buat akun baru
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Lengkapi data di bawah untuk membuat akun RT Inventory.
              </p>
            </div>

            {/* General error banner */}
            {errors.general && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="flex-1">{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nama lengkap
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    required
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  />
                </div>

                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
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
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    required
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* PASSWORD CONFIRMATION */}
              <div>
                <label
                  htmlFor="passwordConfirmation"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Konfirmasi password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type={
                      showPasswordConfirmation
                        ? "text"
                        : "password"
                    }
                    value={form.passwordConfirmation}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    required
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                      errors.passwordConfirmation
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordConfirmation(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                    aria-label={
                      showPasswordConfirmation
                        ? "Sembunyikan konfirmasi password"
                        : "Tampilkan konfirmasi password"
                    }
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.passwordConfirmation && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.passwordConfirmation}
                  </p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 hover:shadow-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Membuat akun...
                  </>
                ) : (
                  <>
                    Buat akun

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* LOGIN LINK */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="font-bold text-emerald-600 transition hover:text-emerald-700"
              >
                Masuk sekarang
              </Link>
            </p>

            <p className="mt-10 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} RT Inventory. All rights
              reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}