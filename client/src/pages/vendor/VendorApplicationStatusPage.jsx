import { useLoaderData } from "react-router-dom";
import ApplicationStatusCard from "@/components/vendor/ApplicationStatusCard";

export default function VendorApplicationStatusPage() {
  const { applicationStatus, rejectionReason } = useLoaderData();

  return (
    <ApplicationStatusCard
      status={applicationStatus}
      reason={rejectionReason}
    />
  );
}
