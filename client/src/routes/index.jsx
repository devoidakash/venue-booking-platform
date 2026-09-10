import { createBrowserRouter } from "react-router-dom";
import { userRoutes } from "./user.routes";
import { vendorRoutes } from "./vendor.routes";
import { adminRoutes } from "./admin.routes";
import VendorLandingPage from "@/components/vendor/VendorLandingPage";

export const router = createBrowserRouter([
  ...userRoutes,
  ...vendorRoutes,
  ...adminRoutes,
  { path: "/partner-with-us", element: <VendorLandingPage /> },
]);
