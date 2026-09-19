import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getVenueApplication, reviewVenueApplication } from "@/api/admin.api";
import VenueReviewApplication from "@/components/admin/VenueReviewApplication";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function VenueReviewApplicationPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pageBorderClass =
    application?.status === "rejected"
      ? "border-rose-200"
      : application?.status === "approved"
        ? "border-emerald-200"
        : "border-amber-200";

  useEffect(() => {
    let isMounted = true;

    async function loadApplication() {
      setLoading(true);
      setError(null);
      try {
        const data = await getVenueApplication(applicationId);
        if (isMounted) setApplication(data);
      } catch {
        if (isMounted)
          setError(
            "Couldn't load this venue application. It may have been moved or deleted.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadApplication();
    return () => {
      isMounted = false;
    };
  }, [applicationId]);

  const handleApprove = async (id) => {
    setIsProcessing(true);
    setError(null);
    try {
      await reviewVenueApplication(id, { status: "approved" });
      navigate("..", { relative: "path" });
    } catch {
      setError("Couldn't approve this application. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id, rejectionReason) => {
    setIsProcessing(true);
    setError(null);
    try {
      await reviewVenueApplication(id, {
        status: "rejected",
        rejectionReason: rejectionReason,
      });
      navigate("..", { relative: "path" });
    } catch {
      setError("Couldn't reject this application. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- SKELETON LOADER ---
  if (loading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex gap-3">
            <Skeleton className="aspect-video w-2/3 rounded-lg" />
            <div className="grid w-1/3 grid-cols-2 gap-3">
              <Skeleton className="rounded-lg" />
              <Skeleton className="rounded-lg" />
              <Skeleton className="rounded-lg" />
              <Skeleton className="rounded-lg" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-6 w-1/2 rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !application) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">
          Application not found
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          {error ||
            "This venue application doesn't exist, or you don't have permission to view it."}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("..", { relative: "path" })}
          className="mt-6"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to applications
        </Button>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div
      className={`w-full space-y-6 rounded-2xl border-2 bg-slate-50/30 p-4 sm:p-6 ${pageBorderClass}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("..", { relative: "path" })}
          className="-ml-3 gap-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Button>
        <span className="font-mono text-xs text-slate-400">
          {applicationId.slice(0, 8)}…
        </span>
      </div>

      {/* In-page action error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <VenueReviewApplication
        application={application}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={isProcessing}
      />

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-700">
              Processing decision…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
