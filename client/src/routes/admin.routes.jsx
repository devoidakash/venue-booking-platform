import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import HomePage from "@/pages/user/HomePage";

export const adminRoutes = [
  {
    path: "/admin/home",
    element: <HomePage />,
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
];
