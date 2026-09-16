import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Tags,
  LogOut,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const menus = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inventaris",
    path: "/items",
    icon: Package,
  },
  {
    label: "Peminjaman",
    path: "/loans",
    icon: ClipboardList,
  },
  {
    label: "Kategori",
    path: "/categories",
    icon: Tags,
  },
  {
    label: "Warga",
    path: "/users",
    icon: Users,
  },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
              RT
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                RT Inventory
              </h1>

              <p className="text-xs text-slate-400">
                Management System
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon size={19} />
                {menu.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-100 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={19} />
            Keluar
          </button>
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div>
            <p className="text-sm text-slate-400">
              Area Admin
            </p>

            <h2 className="font-semibold text-slate-900">
              Kelola inventaris RT
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
            A
          </div>
        </header>

        <section className="p-5 sm:p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
}