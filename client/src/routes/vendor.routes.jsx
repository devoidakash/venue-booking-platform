import { vendorApplyLoader } from "@/loaders/vendorApply.loader";
import { vendorAuthLoader } from "@/loaders/vendorAuth.loader";
import VendorApplyPage from "@/pages/vendor/VendorApplyPage";
import VendorDashboardPage from "@/pages/vendor/VendorDashboardPage";
import VendorOveriviewPage from "@/pages/vendor/VendorOverviewPage";
import VendorProfilePage from "@/pages/vendor/VendorProfilePage";
import VendorVenueApplicationPage from "@/pages/vendor/venue/VenueApplicationPage";
import VenueApplicationStatus from "@/pages/vendor/venue/VenueApplicationStatus";
import VendorVenuesPage from "@/pages/vendor/VendorVenuesPage";

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
        element: <VendorVenueApplicationPage />,
      },
      {
        path: "venues/applications/status",
        element: <VenueApplicationStatus />,
      },
    ],
  },
];
