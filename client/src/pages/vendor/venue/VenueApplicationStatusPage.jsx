import { useEffect, useState } from "react";
import { AlertTriangle, Clock3, Layers } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getVenuesApplicationStatus } from "@/api/vendor.api";
import VendorVenueStatusCard from "@/components/vendor/VendorVenueStatusCard";

function withCacheBust(url, token) {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_cb=${token}`;
}

function ApplicationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="aspect-3/4 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export default function VenueApplicationStatusPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadApplications() {
      setLoading(true);
      setError(null);

      try {
        const response = await getVenuesApplicationStatus();
        const data = Array.isArray(response)
          ? response
          : (response?.data ?? []);
        const cacheToken = Date.now();

        if (isMounted) {
          setApplications(
            data.map((application) => ({
              ...application,
              coverImageUrl: withCacheBust(
                application.coverImageUrl,
                cacheToken,
              ),
            })),
          );
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load your application status. Try refreshing.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCount = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const rejectedCount = applications.filter(
    (application) => application.status === "rejected",
  ).length;

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Venue Application Status
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {loading ? "..." : applications.length} Total
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Track the review status of your submitted venue applications.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
          <Clock3 className="h-4 w-4" />
          {pendingCount} Under Review
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ApplicationCardSkeleton key={index} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Layers className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            No venue applications found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Submitted applications will appear here with their review status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {applications.map((application) => (
            <VendorVenueStatusCard
              key={application.id}
              application={application}
            />
          ))}
        </div>
      )}

      {!loading && applications.length > 0 && (
        <div className="text-xs text-slate-400">
          {rejectedCount} rejected application
          {rejectedCount === 1 ? "" : "s"} included
        </div>
      )}
    </div>
  );
}
