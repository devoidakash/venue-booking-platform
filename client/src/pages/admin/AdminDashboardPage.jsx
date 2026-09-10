import { Outlet, useNavigate } from "react-router-dom";
import { CircleCheck, CircleX, Clock3, Home, UserPlus } from "lucide-react";

import Layout from "../../components/dashboard/Layout";
import { adminLogout } from "@/api/admin.api";

const adminNavigationLinks = [
  {
    to: "/admin/overview",
    label: "Overview",
    icon: Home,
  },
  {
    to: "/admin/application?status=pending",
    label: "Vendor KYC",
    icon: UserPlus,
    children: [
      {
        to: "/admin/application?status=pending",
        label: "Pending",
        icon: Clock3,
      },
      {
        to: "/admin/application?status=approved",
        label: "Approved",
        icon: CircleCheck,
      },
      {
        to: "/admin/application?status=rejected",
        label: "Rejected",
        icon: CircleX,
      },
    ],
  },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch (err) {
      if (!err.response || err.response.status >= 500) {
        navigate("/error/500");
        return;
      }
    } finally {
      navigate("/admin/login");
    }
  };

  const handleSearch = (query) => {
    // Optional: Wire up global search for admin
    console.log("Admin searching:", query);
  };

  return (
    <Layout
      sidebarLinks={adminNavigationLinks}
      user={{
        email: "akashpatel522004@gmail.com",
        role: "Admin",
      }}
      searchPlaceholder="Search venues, vendors, reports..."
      onSearch={handleSearch}
      onLogout={handleLogout}
    >
      <Outlet />
    </Layout>
  );
}
