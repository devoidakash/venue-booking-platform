import { adminAuthLoader } from "@/loaders/adminAuth.loader";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";

export const adminRoutes = [
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboardPage />,
    loader: adminAuthLoader,
    children: [{ path: "overview", element: <AdminOverviewPage /> }],
  },
];
