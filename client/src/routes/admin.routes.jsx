import { adminAuthLoader } from "@/loaders/adminAuth.loader";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import VendorApplicationsPage from "@/pages/admin/vendor/VendorApplicationsPage";
import VendorProfilePage from "@/pages/admin/vendor/VendorProfilePage";
import VenueApplicationsStatusPage from "@/pages/admin/venue/VenueApplicationsStatusPage";
import VenueReviewApplicationPage from "@/pages/admin/venue/VenueReviewApplicationPage";

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
            element: <VendorApplicationsPage />,
          },
        ],
      },
      {
        path: "venue/applications",
        children: [
          {
            index: true,
            element: <VenueApplicationsStatusPage />,
          },
          {
            path: ":applicationId",
            element: <VenueReviewApplicationPage />,
          },
        ],
      },
      {
        path: "vendor/profile/:id",
        element: <VendorProfilePage />,
      },
    ],
  },
];
