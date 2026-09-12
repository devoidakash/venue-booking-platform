import { adminAuthLoader } from "@/loaders/adminAuth.loader";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import VendorApplicationsPage from "@/pages/admin/vendor/VendorApplicationsPage";
import VenueApplicationsStatusPage from "@/pages/admin/venue/VenueApplicationsStatusPage";

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
      {
        path: "venue/applications",
        children: [
          {
            index: true,
            element: <VenueApplicationsStatusPage status="pending" />,
          },
          {
            path: "pending",
            element: <VenueApplicationsStatusPage status="pending" />,
          },
          {
            path: "approved",
            element: <VenueApplicationsStatusPage status="approved" />,
          },
          {
            path: "rejected",
            element: <VenueApplicationsStatusPage status="rejected" />,
          },
        ],
      },
    ],
  },
];
