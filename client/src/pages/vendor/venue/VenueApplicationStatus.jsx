import { useEffect, useState } from "react";
import {
  Clock3,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  FileText,
  ExternalLink,
  Eye,
  Layers,
  Image as ImageIcon,
  Compass,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getVenuesApplicationStatus } from "@/api/vendor.api";

const STATUS_MAP = {
  pending: {
    label: "Under Review",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
    icon: Clock3,
    description:
      "Your application is in the queue awaiting compliance approval.",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
    dotClass: "bg-rose-500",
    icon: XCircle,
    description: "Application was declined during compliance review.",
  },
};

function formatTimestamp(iso) {
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

function ApplicationCard({ item, onPreviewDoc }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const statusCfg = STATUS_MAP[item.status] || STATUS_MAP.pending;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
      {/* Top Banner Row */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {item.name}
              </h2>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                {item.category}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>Submitted on {formatTimestamp(item.submittedAt)}</span>
              <span>•</span>
              <span className="font-mono">ID: {item.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusCfg.badgeClass}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusCfg.dotClass}`} />
            {statusCfg.label}
          </div>
        </div>
      </div>

      {/* Rejection Notification if applicable */}
      {item.status === "rejected" && item.rejectionReason && (
        <div className="flex items-start gap-3 border-b border-rose-100 bg-rose-50/60 p-4 px-6 text-sm text-rose-700">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-semibold">Reviewer Notes:</p>
            <p className="mt-0.5 text-rose-600">{item.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Main Body Details */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* Details Column */}
        <div className="space-y-4 lg:col-span-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview & Details
            </span>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {item.venueDetails}
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
                  {item.address}, {item.district}, {item.state} - {item.pincode}
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
                  {item.latitude}, {item.longitude}
                </span>
              </div>
            </div>
          </div>

          {/* Uploaded Venue Images Showcase */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <ImageIcon className="h-3.5 w-3.5" />
              Venue Photos ({item.images?.length || 0})
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {(item.images || []).map((imgUrl, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(imgUrl)}
                  className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                >
                  <img
                    src={imgUrl}
                    alt={`Venue ${i + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Document Panel */}
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
              <div
                onClick={() => onPreviewDoc(item.proofDocumentUrl)}
                className="group relative aspect-4/3 w-full cursor-pointer overflow-hidden rounded bg-slate-100"
              >
                <img
                  src={item.proofDocumentUrl}
                  alt="Proof doc thumbnail"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-semibold text-slate-800">
                    <Eye className="h-3 w-3" /> View Doc
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => onPreviewDoc(item.proofDocumentUrl)}
            className="mt-4 w-full gap-2 rounded-xl text-xs font-semibold text-slate-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Inspect Proof Fullscreen
          </Button>
        </div>
      </div>

      {/* Full Image Viewer Dialog */}
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
    </div>
  );
}

export default function VendorApplicationStatus() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const pendingCount = applications.filter(
    (application) => application.status === "pending",
  ).length;

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getVenuesApplicationStatus();
        const payload = Array.isArray(data) ? data : (data ?? []);
        if (isMounted) setApplications(payload);
      } catch {
        if (isMounted) setError("Failed to fetch venue applications.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Venues Application Status
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track Venue review progress, verification status, and admin feedback
            for your submitted properties.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {pendingCount} Under Review
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Rendering */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
            >
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Layers className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            No venue submissions on record
          </p>
          <p className="mt-1 text-xs text-slate-500">
            You currently have no pending or reviewed venue applications.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((item) => (
            <ApplicationCard
              key={item.id}
              item={item}
              onPreviewDoc={(url) => setPreviewDocUrl(url)}
            />
          ))}
        </div>
      )}

      {/* Full Document Preview Dialog */}
      <Dialog
        open={Boolean(previewDocUrl)}
        onOpenChange={() => setPreviewDocUrl(null)}
      >
        <DialogContent className="max-w-4xl p-2">
          <DialogHeader className="p-2 border-b">
            <DialogTitle className="text-sm font-semibold text-slate-800">
              Submitted Proof Document
            </DialogTitle>
          </DialogHeader>
          {previewDocUrl && (
            <div className="max-h-[80vh] overflow-auto rounded bg-slate-100">
              <img
                src={previewDocUrl}
                alt="Full Proof Document"
                className="w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
