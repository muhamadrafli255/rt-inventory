import {
  Bell,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";

import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Kategori",
    to: "/categories",
    icon: Tags,
  },
  {
    label: "Barang",
    to: "/items",
    icon: Boxes,
  },
  {
    label: "Peminjaman",
    to: "/loans",
    icon: ClipboardList,
  },
  {
    label: "Warga",
    to: "/users",
    icon: Users,
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-[2px] lg:hidden"
          aria-label="Tutup sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white text-slate-900 shadow-xl shadow-slate-200/30 transition-transform duration-300 lg:shadow-none ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-600/20">
              RT
            </div>

            <div>
              <p className="font-bold tracking-tight text-slate-900">
                RT Inventory
              </p>

              <p className="text-xs text-slate-500">
                Management System
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Menu utama
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-slate-200 p-4">
          <button className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
            <Settings size={18} />
            Pengaturan
          </button>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-emerald-600 lg:hidden"
            aria-label="Buka sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">
              Sistem Inventaris RT
            </p>

            <h1 className="text-lg font-bold text-slate-900">
              Panel Manajemen
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Notification */}
            <button
              className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600"
              aria-label="Notifikasi"
            >
              <Bell size={20} />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            {/* User profile */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-800">
                  {user?.name}
                </p>

                <p className="text-xs text-slate-500">
                  {user?.role?.name || user?.role || "User"}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100dvh-5rem)] bg-slate-50 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}