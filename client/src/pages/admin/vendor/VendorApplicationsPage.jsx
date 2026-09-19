import ApplicationsTable from "@/components/admin/VendorApplicationTable";
import {
  getVendorApplications,
  reviewVendorApplication,
} from "@/api/admin.api";
import { useSearchParams } from "react-router-dom";

export default function VendorApplicationsPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "pending";

  return (
    <ApplicationsTable
      status={status}
      fetchApplications={getVendorApplications}
      reviewApplication={reviewVendorApplication}
    />
  );
}
