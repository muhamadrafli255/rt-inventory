import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/role";

import AdminDashboard from "./dashboard/AdminDashboard";
import WargaDashboard from "./dashboard/WargaDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (isAdmin(user)) {
    return <AdminDashboard />;
  }

  return <WargaDashboard />;
}