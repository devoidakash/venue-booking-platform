import { vendorApplyLoader } from "@/loaders/vendorApply.loader";
import HomePage from "@/pages/vendor/HomePage";
import VendorApplyPage from "@/pages/vendor/VendorApplyPage";

export const vendorRoutes = [
  {
    path: "/vendor/home",
    element: <HomePage />,
  },
  {
    path: "/vendor/apply",
    element: <VendorApplyPage />,
    loader: vendorApplyLoader,
  },
];
