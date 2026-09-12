import { vendorApplyLoader } from "@/loaders/vendorApply.loader";
import { vendorAuthLoader } from "@/loaders/vendorAuth.loader";
import VendorApplyPage from "@/pages/vendor/VendorApplyPage";
import VendorDashboardPage from "@/pages/vendor/VendorDashboardPage";
import VendorOveriviewPage from "@/pages/vendor/VendorOverviewPage";
import VendorProfilePage from "@/pages/vendor/VendorProfilePage";

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
    ],
  },
];
