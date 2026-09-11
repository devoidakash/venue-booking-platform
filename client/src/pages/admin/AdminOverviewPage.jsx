import {
  getVendorApplicationCount,
  getVenueApplicationCount,
} from "@/api/admin.api";
import ApplicationStatusOverview from "@/components/admin/ApplicationStatusOverview";

export default function AdminOverviewPage() {
  return (
    <div className="grid grid-cols-2 gap-8 ">
      <ApplicationStatusOverview
        title="Vendor Applications"
        entityLabel="vendor applications"
        fetchCounts={getVendorApplicationCount}
        baseRoute="/admin/vendor/applications"
      />
      <ApplicationStatusOverview
        title="Venue Applications"
        entityLabel="venue applications"
        fetchCounts={getVenueApplicationCount}
        baseRoute="/admin/venue/applications"
      />
    </div>
  );
}
