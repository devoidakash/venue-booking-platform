import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  Building2,
  Waves,
  Gamepad2,
  AlertTriangle,
  CircleCheck,
  Clock3,
  FileText,
  Ban,
  Search,
  ChevronRight,
  Car,
  Dumbbell,
  Mountain,
  Flag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getVendorVenues } from "@/api/vendor.api";

const CATEGORY_CONFIG = {
  waterpark: {
    label: "Water Park",
    icon: Waves,
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200/60",
  },
  racingZone: {
    label: "Racing Zone",
    icon: Car,
    badgeBg: "bg-red-50 text-red-700 border-red-200/60",
  },
  trampolinePark: {
    label: "Trampoline Park",
    icon: Dumbbell,
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200/60",
  },
  gamingZone: {
    label: "Gaming Zone",
    icon: Gamepad2,
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200/60",
  },
  playZone: {
    label: "Play Zone",
    icon: Flag,
    badgeBg: "bg-pink-50 text-pink-700 border-pink-200/60",
  },
  adventurePark: {
    label: "Adventure Park",
    icon: Mountain,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
};

function toTitleCase(value = "") {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getCategoryMeta(category) {
  return (
    CATEGORY_CONFIG[category] || {
      label: toTitleCase(category || "Venue"),
      icon: Building2,
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    }
  );
}

const STATUS_CONFIG = {
  live: {
    label: "Live & Active",
    dotColor: "bg-emerald-500 ring-emerald-100",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  draft: {
    label: "Draft",
    dotColor: "bg-slate-400 ring-slate-100",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
  },
  pending: {
    label: "Pending Review",
    dotColor: "bg-amber-500 ring-amber-100",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
  },

  suspended: {
    label: "Suspended",
    dotColor: "bg-rose-500 ring-rose-100",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/60",
  },
};

function getStatusMeta(status) {
  return (
    STATUS_CONFIG[status] || {
      label: toTitleCase(status || "unknown"),
      dotColor: "bg-slate-400 ring-slate-100",
      badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
    }
  );
}

function withCacheBust(url, token) {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_cb=${token}`;
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ring-4 ${meta.dotColor}`} />
      {meta.label}
    </span>
  );
}

function StatTile({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  helper,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-between rounded-xl border bg-white p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm ${
        active ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200"
      }`}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        {helper && <p className="text-[11px] text-slate-400">{helper}</p>}
      </div>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </button>
  );
}

function VenueCard({ venue, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const {
    icon: CategoryIcon,
    label: categoryLabel,
    badgeBg,
  } = getCategoryMeta(venue.category);
  const showImage = venue.coverImageUrl && !imgFailed;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer text-left"
    >
      {/* Top Banner / Cover */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {showImage ? (
          <img
            src={venue.coverImageUrl}
            alt={venue.name}
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <CategoryIcon className="h-12 w-12 text-slate-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

        {/* Top Badges */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${badgeBg}`}
          >
            <CategoryIcon className="h-3.5 w-3.5" />
            {categoryLabel}
          </span>
          <StatusBadge status={venue.status} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            {venue.name}
          </h3>

          <div className="mt-2.5 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate font-medium">
              {venue.district}, {venue.state}
            </span>
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">
            ID: {venue.id?.slice(0, 8)}...
          </span>
          <div className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-transform group-hover:translate-x-0.5">
            Manage Venue
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function VenueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="pt-3 border-t border-slate-100 flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function VendorVenuesPage() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getVendorVenues();
        const rawData = Array.isArray(res) ? res : (res?.data ?? []);

        const cacheToken = Date.now();
        const fresh = rawData.map((v) => ({
          ...v,
          coverImageUrl: withCacheBust(v.coverImageUrl, cacheToken),
        }));
        if (isMounted) setVenues(fresh);
      } catch {
        if (isMounted) setError("Couldn't load your venues. Try refreshing.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const statusCounts = useMemo(
    () => ({
      all: venues.length,
      live: venues.filter((v) => v.status === "live").length,
      draft: venues.filter((v) => v.status === "draft").length,
      pending: venues.filter((v) => v.status === "pending").length,
      suspended: venues.filter((v) => v.status === "suspended").length,
    }),
    [venues],
  );

  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchesSearch =
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.state?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || v.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [venues, searchQuery, selectedStatus]);

  return (
    <div className="w-full space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Venue Inventory
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {venues.length} Total
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Control your listings, update schedules, and track live customer
            visibility.
          </p>
        </div>
        <Button
          onClick={() => navigate("/vendor/venues/new")}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Create New Venue
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          {error}
        </div>
      )}

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile
          icon={Building2}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          label="Registered Venues"
          value={loading ? "..." : statusCounts.all}
          helper="Properties across all regions"
          active={selectedStatus === "all"}
          onClick={() => setSelectedStatus("all")}
        />
        <StatTile
          icon={CircleCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Published / Live"
          value={loading ? "..." : statusCounts.live}
          helper="Accepting customer bookings"
          active={selectedStatus === "live"}
          onClick={() => setSelectedStatus("live")}
        />
        <StatTile
          icon={FileText}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          label="Draft Venues"
          value={loading ? "..." : statusCounts.draft}
          helper="Still being configured"
          active={selectedStatus === "draft"}
          onClick={() => setSelectedStatus("draft")}
        />
        <StatTile
          icon={Clock3}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Pending"
          value={loading ? "..." : statusCounts.pending}
          helper="Check status / admin review"
          active={selectedStatus === "pending"}
          onClick={() => navigate("/vendor/venues/applications/status")}
        />
        <StatTile
          icon={Ban}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          label="Suspended Venues"
          value={loading ? "..." : statusCounts.suspended}
          helper="Contact support"
          active={selectedStatus === "suspended"}
          onClick={() => setSelectedStatus("suspended")}
        />
      </div>

      {/* Control Bar: Filters & Live Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter venues by name, district, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Grid Canvas: 4 Columns on Extra Large Displays */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      ) : venues.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
            <Building2 className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
            No venues found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            You haven't listed any venues yet. Register your venue property to
            begin taking bookings.
          </p>
          {selectedStatus === "all" && (
            <Button
              onClick={() => navigate("/vendor/venues/new")}
              className="mt-6 gap-2 rounded-xl bg-indigo-600 px-5 text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add First Venue
            </Button>
          )}
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
          <p className="text-sm font-semibold text-slate-800">
            No venues match your current filters
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Try adjusting your search query or status filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("all");
            }}
            className="mt-4 text-xs font-semibold text-indigo-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVenues.map((venue) => (
            <VenueCard
              key={`${venue.id}-${venue.coverImageUrl}`}
              venue={venue}
              onClick={() => navigate(`/vendor/venues/${venue.id}`)}
            />
          ))}

          {selectedStatus === "all" && (
            <>
              {/* Inline Add Quick Button */}
              <button
                onClick={() => navigate("/vendor/venues/new")}
                className="group flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-slate-500 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 transition-all group-hover:scale-110 group-hover:ring-indigo-300">
                  <Plus className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-slate-700 group-hover:text-indigo-600">
                    Register New Venue
                  </span>
                  <span className="text-xs text-slate-400">
                    Water parks, theme parks & more
                  </span>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
