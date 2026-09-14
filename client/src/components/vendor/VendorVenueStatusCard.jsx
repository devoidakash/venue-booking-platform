import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Car,
  ChevronRight,
  Clock3,
  Compass,
  Eye,
  ExternalLink,
  FileText,
  Flag,
  Gamepad2,
  Dumbbell,
  Image as ImageIcon,
  MapPin,
  Mountain,
  Waves,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const CATEGORY_CONFIG = {
  waterpark: { label: "Water Park", icon: Waves },
  racingzone: { label: "Racing Zone", icon: Car },
  trampolinepark: { label: "Trampoline Park", icon: Dumbbell },
  playzone: { label: "Play Zone", icon: Flag },
  gamingzone: { label: "Gaming Zone", icon: Gamepad2 },
  adventurepark: { label: "Adventure Park", icon: Mountain },
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
    icon: Clock3,
  },
  rejected: {
    label: "Rejected",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
    icon: XCircle,
  },
  live: {
    label: "Live",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  draft: {
    label: "Draft",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dotClassName: "bg-slate-400",
  },
  suspended: {
    label: "Suspended",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
  },
};

function normalizeKey(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatSubmittedAt(value, includeTime = false) {
  if (!value) return "Submitted date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  }).format(new Date(value));
}

function StatusBadge({ status, detailed }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        detailed ? "px-3 py-1" : "px-2.5 py-1"
      } text-xs font-semibold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
      {detailed && config.icon ? <config.icon className="h-3.5 w-3.5" /> : null}
      {detailed ? config.label.replace(" Review", "") : config.label}
    </span>
  );
}

function CategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[normalizeKey(category)] || {
    label: category || "Venue",
    icon: Building2,
  };
  const CategoryIcon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/60 bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-700 backdrop-blur-md">
      <CategoryIcon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function SummaryCard({ application }) {
  const category = CATEGORY_CONFIG[normalizeKey(application.category)] || {
    icon: Building2,
  };
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
          <CategoryBadge category={application.category} />
          <StatusBadge status={application.status} />
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

function VenueCard({ venue, onClick }) {
  const category = CATEGORY_CONFIG[normalizeKey(venue.category)] || {
    label: venue.category || "Venue",
    icon: Building2,
  };
  const CategoryIcon = category.icon;

  return (
    <article
      onClick={onClick}
      onKeyDown={(event) => event.key === "Enter" && onClick?.()}
      role="button"
      tabIndex={0}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100">
        {venue.coverImageUrl ? (
          <img
            src={venue.coverImageUrl}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <CategoryIcon className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
          <CategoryBadge category={venue.category} />
          <StatusBadge status={venue.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h2 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600">
            {venue.name}
          </h2>
          <div className="mt-2.5 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate font-medium">
              {venue.district}, {venue.state}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-medium text-slate-400">
            ID: {venue.id?.slice(0, 8)}...
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
            Manage Venue
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

function DetailedCard({ application, onPreviewDoc }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {application.name}
              </h2>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                {application.category}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>
                Submitted on {formatSubmittedAt(application.submittedAt, true)}
              </span>
              <span>•</span>
              <span className="font-mono">ID: {application.id}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={application.status} detailed />
      </div>

      {application.status === "rejected" && application.rejectionReason && (
        <div className="flex items-start gap-3 border-b border-rose-100 bg-rose-50/60 p-4 px-6 text-sm text-rose-700">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-semibold">Reviewer Notes:</p>
            <p className="mt-0.5 text-rose-600">
              {application.rejectionReason}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview & Details
            </span>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {application.venueDetails}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2">
            <div>
              <span className="text-xs font-medium text-slate-400">
                Location
              </span>
              <div className="mt-1 flex items-start gap-1.5 text-sm font-semibold text-slate-800">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {application.address}, {application.district},{" "}
                  {application.state} - {application.pincode}
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400">
                Geolocation
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Compass className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {application.latitude}, {application.longitude}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <ImageIcon className="h-3.5 w-3.5" />
              Venue Photos ({application.images?.length || 0})
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {(application.images || []).map((imageUrl, index) => (
                <button
                  type="button"
                  key={imageUrl || index}
                  onClick={() => setSelectedImage(imageUrl)}
                  className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                >
                  <img
                    src={imageUrl}
                    alt={`Venue ${index + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <Eye className="h-4 w-4 text-white" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/40 p-5">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Proof of Ownership
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Attached document for licensing & premises authority verification.
            </p>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
              <button
                type="button"
                onClick={() => onPreviewDoc?.(application.proofDocumentUrl)}
                className="group relative aspect-4/3 w-full cursor-pointer overflow-hidden rounded bg-slate-100"
              >
                <img
                  src={application.proofDocumentUrl}
                  alt="Proof doc thumbnail"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-semibold text-slate-800">
                    <Eye className="h-3 w-3" /> View Doc
                  </span>
                </span>
              </button>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => onPreviewDoc?.(application.proofDocumentUrl)}
            className="mt-4 w-full gap-2 rounded-xl text-xs font-semibold text-slate-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Inspect Proof Fullscreen
          </Button>
        </div>
      </div>

      <Dialog
        open={Boolean(selectedImage)}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Gallery enlarged"
              className="max-h-[80vh] w-full object-contain bg-black"
            />
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
}

export default function VendorVenueStatusCard({
  application,
  venue,
  detailed = false,
  onClick,
  onPreviewDoc,
}) {
  if (venue) {
    return <VenueCard venue={venue} onClick={onClick} />;
  }

  return detailed ? (
    <DetailedCard application={application} onPreviewDoc={onPreviewDoc} />
  ) : (
    <SummaryCard application={application} />
  );
}
