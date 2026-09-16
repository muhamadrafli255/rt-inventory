import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import DashboardPage from "./pages/DashboardPage";
import ItemsPage from "./pages/ItemsPage";
import CategoriesPage from "./pages/CategoriesPage";
import LoansPage from "./pages/LoansPage";
import UsersPage from "./pages/UsersPage";
import MyLoansPage from "./pages/MyLoansPage";
import SettingsPage from "./pages/SettingsPage";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleGuard from "./routes/RoleGuard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />

              {/* Halaman yang bisa diakses semua role */}
              <Route path="items" element={<ItemsPage />} />
              <Route path="loans" element={<LoansPage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Khusus ADMIN */}
              <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="users" element={<UsersPage />} />
              </Route>

              {/* Khusus WARGA */}
              <Route element={<RoleGuard allowedRoles={["WARGA"]} />}>
                <Route path="my-loans" element={<MyLoansPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}