import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function getErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;
  if (responseData?.message) return responseData.message;

  const fieldErrors = responseData?.errors?.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const messages = Object.entries(fieldErrors).flatMap(([field, errors]) => {
      if (!Array.isArray(errors)) return [];
      return errors.map((msg) => `${field}: ${msg}`);
    });
    if (messages.length > 0) return messages.join(" | ");
  }

  return fallbackMessage;
}

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setProfileError("");

    if (!profileForm.name.trim()) {
      const msg = "Nama lengkap wajib diisi.";
      setProfileError(msg);
      showNotification("error", msg);
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || null,
        address: profileForm.address.trim() || null,
      });

      showNotification("success", "Profil Anda berhasil diperbarui!");
    } catch (err) {
      console.error("Update profile error:", err);
      const msg = getErrorMessage(err, "Gagal memperbarui profil.");
      setProfileError(msg);
      showNotification("error", msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");

    if (!passwordForm.currentPassword) {
      const msg = "Masukkan password Anda saat ini.";
      setPasswordError(msg);
      showNotification("error", msg);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      const msg = "Password baru minimal 6 karakter.";
      setPasswordError(msg);
      showNotification("error", msg);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const msg = "Konfirmasi password baru tidak cocok.";
      setPasswordError(msg);
      showNotification("error", msg);
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showNotification("success", "Password Anda berhasil diperbarui!");
    } catch (err) {
      console.error("Change password error:", err);
      const msg = getErrorMessage(err, "Gagal memperbarui password.");
      setPasswordError(msg);
      showNotification("error", msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="relative space-y-8">
      {/* Toast notification */}
      {notification && (
        <div
          className={`fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={22} className="mt-0.5 shrink-0 text-rose-600" />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">
              {notification.type === "success" ? "Berhasil" : "Gagal"}
            </p>
            <p className="mt-0.5 text-sm leading-5 opacity-80">
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

      {/* Header */}
      <div>
        <p className="mb-2 text-sm font-semibold text-emerald-600">Akun Pengguna</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Pengaturan Akun
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola data diri, nomor telepon, alamat, dan keamanan kata sandi Anda.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Profile Card */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 font-extrabold text-emerald-700 text-xl shadow-inner">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <Shield size={12} />
                    {user?.role?.name || user?.role || "User"}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{user?.email}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Informasi Pribadi
              </h3>

              {profileError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                    placeholder="Nama lengkap..."
                    disabled={savingProfile}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Alamat Email <span className="text-slate-400 font-normal lowercase">(read-only)</span>
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  No. Telepon / WhatsApp
                </label>
                <div className="relative mt-1.5">
                  <Phone
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="08123456789"
                    disabled={savingProfile}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Alamat Rumah / Tempat Tinggal
                </label>
                <div className="relative mt-1.5">
                  <MapPin
                    size={18}
                    className="absolute left-3.5 top-3 text-slate-400"
                  />
                  <textarea
                    name="address"
                    rows="3"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    placeholder="Alamat rumah lengkap..."
                    disabled={savingProfile}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {savingProfile ? "Memproses..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Ubah Password</h2>
                <p className="text-xs text-slate-500">
                  Perbarui kata sandi akun Anda secara berkala.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
              {passwordError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password Saat Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    disabled={savingPassword}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Minimal 6 karakter"
                    disabled={savingPassword}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Konfirmasi Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Ulangi password baru"
                    disabled={savingPassword}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingPassword ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <KeyRound size={16} />
                  )}
                  {savingPassword ? "Memproses..." : "Ubah Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
