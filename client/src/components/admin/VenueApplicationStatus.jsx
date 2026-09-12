import { useEffect, useState, useMemo } from "react";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  Filter,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getVenueApplication, getVenueApplications } from "@/api/admin.api";
import { useNavigate } from "react-router-dom";

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-500/90 text-white backdrop-blur-md",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    badgeClass: "bg-emerald-500/90 text-white backdrop-blur-md",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-rose-500/90 text-white backdrop-blur-md",
    icon: XCircle,
  },
};

// --- SUB-COMPONENTS ---

function ApplicationGridCard({ app, onAction }) {
  const {
    id,
    name,
    category,
    coverImage,
    district,
    state,
    status,
    submittedAt,
  } = app;

  const [imgFailed, setImgFailed] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div
      onClick={() => onAction(id)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      {/* Tall Portrait Image Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-100">
        {coverImage && !imgFailed ? (
          <img
            src={coverImage}
            alt={name}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
            <Building2 className="h-10 w-10 text-slate-300 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}

        {/* Floating Badges inside the image */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start">
          <Badge
            className={`border-0 px-2 py-0.5 text-[10px] font-semibold tracking-wider ${cfg.badgeClass}`}
          >
            {cfg.label}
          </Badge>
          <Badge className="border-0 bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white backdrop-blur-md uppercase">
            {category}
          </Badge>
        </div>

        {/* Gradient overlay for better contrast at the bottom if needed */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Text Details (Outside Image) */}
      <div className="flex flex-col p-4">
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <MapPin className="h-3 w-3 shrink-0 text-indigo-500" />
          <span className="truncate">
            {district}, {state}
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-indigo-600 transition-colors">
          {name}
        </h3>

        <p className="mt-1 text-[11px] font-medium text-slate-400">
          Submitted: {formatDateTime(submittedAt)}
        </p>
      </div>
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-4/5 w-full rounded-2xl" />
      <div className="mt-3 space-y-2 px-0.5">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function VenueApplicationsStatus({ status = "pending" }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const data = await getVenueApplications();
        const payload = Array.isArray(data) ? data : (data?.data ?? []);
        if (isMounted) setApplications(payload);
      } catch {
        if (isMounted) setError("Failed to fetch applications");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = app.status === status;
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, status, searchQuery]);

  const handleActionClick = async (id) => {
    await getVenueApplication(id);
    navigate(`/admin/venue/applications/${id}`);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Venue Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and manage property listings submitted by vendors.
          </p>
        </div>

        <div className="flex w-full sm:w-72 items-center">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Content (5 Columns on XL screens) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:gap-8">
        {loading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <ApplicationSkeleton key={i} />
            ))}
          </>
        ) : filteredApps.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xs border border-slate-100">
              <Filter className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mt-5 text-base font-bold text-slate-900">
              No matching applications
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              There are currently no "{status}" applications that match your
              criteria.
            </p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <ApplicationGridCard
              key={app.id}
              app={app}
              onAction={handleActionClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
