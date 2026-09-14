import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Clock3,
  Flag,
  Gamepad2,
  Layers,
  MapPin,
  Mountain,
  Waves,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getVenuesApplicationStatus } from "@/api/vendor.api";

const CATEGORY_CONFIG = {
  waterpark: { label: "Water Park", icon: Waves },
  playzone: { label: "Play Zone", icon: Flag },
  gamingzone: { label: "Gaming Zone", icon: Gamepad2 },
  adventurepark: { label: "Adventure Park", icon: Mountain },
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
  },
};

function withCacheBust(url, token) {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_cb=${token}`;
}

function normalizeKey(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatSubmittedAt(value) {
  if (!value) return "Submitted date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ApplicationCard({ application }) {
  const category = CATEGORY_CONFIG[normalizeKey(application.category)] || {
    label: application.category || "Venue",
    icon: Building2,
  };
  const status = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
  const CategoryIcon = category.icon;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="relative aspect-3/4 overflow-hidden bg-slate-100">
        {application.coverImageUrl ? (
          <img
            src={application.coverImageUrl}
            alt={application.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <CategoryIcon className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/60 bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur-md">
            <CategoryIcon className="h-3.5 w-3.5" />
            {category.label}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
            />
            {status.label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h2 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900">
          {application.name}
        </h2>
        <div className="mt-2.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate font-medium">
            {application.district}, {application.state}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-400">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          Submitted {formatSubmittedAt(application.submittedAt)}
        </div>
      </div>
    </article>
  );
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
            <ApplicationCard key={application.id} application={application} />
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
