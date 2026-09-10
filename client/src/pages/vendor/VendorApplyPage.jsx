import { useLoaderData } from "react-router-dom";
import VendorApplicationForm from "@/components/vendor/VendorApplicationForm";
import ApplicationPending from "@/components/vendor/ApplicationPending";
import ApplicationRejected from "@/components/vendor/ApplicationRejected";

export default function VendorApplyPage() {
  const { applicationStatus, rejectionReason } = useLoaderData();

  if (applicationStatus === "pending") return <ApplicationPending />;
  if (applicationStatus === "rejected")
    return <ApplicationRejected reason={rejectionReason} />;
  return <VendorApplicationForm />;
}
