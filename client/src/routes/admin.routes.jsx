import { adminAuthLoader } from "@/loaders/adminAuth.loader";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import VendorApplicationsPage from "@/pages/admin/vendor/VendorApplicationsPage";

export const adminRoutes = [
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboardPage />,
    loader: adminAuthLoader,
    children: [
      { path: "overview", element: <AdminOverviewPage /> },
      {
        path: "vendor/applications",
        children: [
          {
            index: true,
            element: <VendorApplicationsPage status="pending" />,
          },
          {
            path: "pending",
            element: <VendorApplicationsPage status="pending" />,
          },
          {
            path: "approved",
            element: <VendorApplicationsPage status="approved" />,
          },
          {
            path: "rejected",
            element: <VendorApplicationsPage status="rejected" />,
          },
        ],
      },
    ],
  },
];
