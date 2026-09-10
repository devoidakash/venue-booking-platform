import { useLoaderData } from "react-router-dom";
import VendorApplicationForm from "@/components/vendor/VendorApplicationForm";
import ApplicationStatusCard from "@/components/vendor/ApplicationStatusCard";

export default function VendorApplyPage() {
  const { applicationStatus, rejectionReason } = useLoaderData();

  if (applicationStatus === "pending" || applicationStatus === "rejected") {
    return (
      <ApplicationStatusCard
        status={applicationStatus}
        reason={rejectionReason}
      />
    );
  }
  return <VendorApplicationForm />;
}
