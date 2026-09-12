import { Outlet, useNavigate } from "react-router-dom";
import { Home, User } from "lucide-react";
import { useLoaderData } from "react-router-dom";

import Layout from "../../components/dashboard/Layout";
import { logout } from "@/api/user.api";

const vendorNavigationLinks = [
  {
    to: "/vendor/overview",
    label: "Overview",
    icon: Home,
  },
  {
    to: "/vendor/profile",
    label: "Profile",
    icon: User,
  },
];

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const { email } = useLoaderData();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      if (!err.response || err.response.status >= 500) {
        navigate("/error/500");
        return;
      }
    } finally {
      navigate("/login");
    }
  };

  const handleSearch = (query) => {
    // Optional: Wire up global search for admin
    console.log("Vendor searching:", query);
  };

  return (
    <Layout
      sidebarLinks={vendorNavigationLinks}
      user={{
        email,
        role: "Vendor",
      }}
      searchPlaceholder="Search venues, bookings, transactions..."
      onSearch={handleSearch}
      onLogout={handleLogout}
    >
      <Outlet />
    </Layout>
  );
}
