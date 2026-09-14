import { vendorApplyLoader } from "@/loaders/vendorApply.loader";
import { vendorAuthLoader } from "@/loaders/vendorAuth.loader";
import VendorApplyPage from "@/pages/vendor/VendorApplyPage";
import VendorDashboardPage from "@/pages/vendor/VendorDashboardPage";
import VendorOveriviewPage from "@/pages/vendor/VendorOverviewPage";
import VendorProfilePage from "@/pages/vendor/VendorProfilePage";
import NewVenueAppllicationPage from "@/pages/vendor/venue/NewVenueApplicationPage";
import VenueManagementPage from "@/pages/vendor/venue/VenueManagementPage";
import VendorVenuesPage from "@/pages/vendor/VendorVenuesStatusPage";
import VenueApplicationStatusPage from "@/pages/vendor/venue/VenueApplicationStatusPage";

export const vendorRoutes = [
  {
    path: "/vendor/apply",
    element: <VendorApplyPage />,
    loader: vendorApplyLoader,
  },
  {
    path: "/vendor",
    element: <VendorDashboardPage />,
    loader: vendorAuthLoader,
    children: [
      {
        path: "overview",
        element: <VendorOveriviewPage />,
      },
      {
        path: "profile",
        element: <VendorProfilePage />,
      },
      {
        path: "venues",
        element: <VendorVenuesPage />,
      },
      {
        path: "venues/new",
        element: <NewVenueAppllicationPage />,
      },
      {
        path: "venues/:id",
        element: <VenueManagementPage />,
      },
      {
        path: "venues/application/status",
        element: <VenueApplicationStatusPage />,
      },
    ],
  },
];
