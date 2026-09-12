import VenueApplicationsStatus from "@/components/admin/VenueApplicationStatus";

export default function VenueApplicationsStatusPage({ status = "pending" }) {
  return <VenueApplicationsStatus status={status} />;
}
