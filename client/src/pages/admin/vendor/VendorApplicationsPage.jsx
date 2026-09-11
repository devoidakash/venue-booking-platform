import ApplicationsTable from "@/components/admin/VendorApplicationTable";
import {
  getVendorApplications,
  reviewVendorApplication,
} from "@/api/admin.api";

export default function VendorApplicationsPage({ status }) {
  return (
    <ApplicationsTable
      status={status}
      fetchApplications={getVendorApplications}
      reviewApplication={reviewVendorApplication}
    />
  );
}
