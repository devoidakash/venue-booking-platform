import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Check,
  ChevronRight,
  Clock3,
  CircleCheck,
  CircleX,
  Eye,
  FileText,
  MapPin,
  User,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const REJECTION_REASONS = [
  "venue_name_mismatch",
  "venue_address_mismatch",
  "document_unclear",
  "document_expired",
  "invalid_document",
  "document_not_supported",
  "venue_photos_unclear",
  "venue_photos_inappropriate",
  "venue_not_found",
  "venue_not_operational",
  "suspicious_or_fraudulent_information",
];

function formatRejectionReason(reason) {
  return reason
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

const STATUS_BANNER = {
  pending: {
    title: "Pending review",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-600",
    borderClass: "border-amber-200",
    getMessage: (a) => `Submitted on ${formatDateTime(a.submittedAt)}.`,
  },
  approved: {
    title: "Approved",
    icon: CircleCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
    borderClass: "border-emerald-200",
    getMessage: (a) =>
      `Approved on ${formatDateTime(a.reviewedAt)} by ${a.reviewedBy?.email || "an admin"}.`,
  },
  rejected: {
    title: "Rejected",
    icon: CircleX,
    iconClass: "bg-rose-50 text-rose-600",
    borderClass: "border-rose-200",
    getMessage: (a) =>
      `Rejected on ${formatDateTime(a.reviewedAt)} by ${a.reviewedBy?.email || "an admin"}.`,
  },
};

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-xs font-medium text-slate-500">{children}</h2>
    </div>
  );
}

export default function VenueReviewApplication({
  application,
  onApprove,
  onReject,
  isProcessing = false,
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!application) return null;

  const {
    id,
    name,
    category,
    venue_details,
    address,
    district,
    state,
    pincode,
    images = [],
    proofDocumentUrl,
    status,
    rejectionReason,
    submittedAt,
    vendor,
  } = application;

  const displayedImage = selectedImage || images[0];
  const galleryImages = images.filter((image) => image !== displayedImage);
  const banner = STATUS_BANNER[status];
  const BannerIcon = banner?.icon;

  const handleRejectSubmit = () => {
    if (!REJECTION_REASONS.includes(rejectReason)) return;
    onReject(id, rejectReason);
    setIsRejectDialogOpen(false);
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Status banner */}
      {banner && (
        <div
          className={`flex items-start gap-3 rounded-xl border bg-white p-4 ${banner.borderClass}`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${banner.iconClass}`}
          >
            <BannerIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {banner.title}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {banner.getMessage(application)}
            </p>
            {status === "rejected" && (
              <p className="mt-1.5 text-sm text-rose-600">
                <span className="font-medium">Reason: </span>
                {rejectionReason
                  ? formatRejectionReason(rejectionReason)
                  : "No specific reason provided."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Media */}
        <div className="bg-slate-50/50 p-5 sm:p-6">
          {displayedImage ? (
            <div className="grid h-64 w-full grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl bg-slate-100 sm:h-96 lg:h-120">
              <button
                type="button"
                onClick={() => setSelectedImage(displayedImage)}
                aria-label={`Show ${name} featured photo`}
                className="group relative col-span-2 row-span-2 min-h-0 overflow-hidden bg-slate-200"
              >
                <img
                  src={displayedImage}
                  alt={name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </button>
              {galleryImages.slice(0, 4).map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Show ${name} photo ${idx + 2}`}
                  className="group relative col-span-1 row-span-1 min-h-0 overflow-hidden bg-slate-200"
                >
                  <img
                    src={img}
                    alt={`${name} photo ${idx + 2}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-300 sm:h-96 lg:h-120">
              <Building2 className="h-8 w-8" />
              <span className="text-xs font-medium text-slate-400">
                No venue images provided
              </span>
            </div>
          )}
        </div>

        <div className="h-px w-full bg-slate-100" />

        {/* Identity */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold text-slate-900">{name}</h1>
            <Badge className="border-0 bg-indigo-50 font-medium text-indigo-600 hover:bg-indigo-50">
              {category}
            </Badge>
          </div>
          {venue_details && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              {venue_details}
            </p>
          )}
        </div>

        {/* Location + Vendor */}
        <div className="grid grid-cols-1 border-t border-slate-100 sm:grid-cols-2">
          <div className="border-b border-slate-100 p-5 sm:border-b-0 sm:border-r sm:p-6">
            <SectionLabel icon={MapPin}>Location</SectionLabel>
            <div className="mt-3 pl-42px">
              <p className="text-sm font-medium text-slate-900">{address}</p>
              <p className="mt-0.5 text-sm text-slate-500">
                {district}, {state}
                <span className="mx-1.5 text-slate-300">·</span>
                {pincode}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <SectionLabel icon={User}>Vendor</SectionLabel>
            <div className="mt-3 pl-42px">
              <p className="text-sm font-medium text-slate-900">
                {vendor?.name || "Unknown vendor"}
              </p>
              <Link
                to={`/admin/vendor/profile/${vendor?.id}`}
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View vendor profile
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Document + Timeline */}
        <div className="grid grid-cols-1 border-t border-slate-100 sm:grid-cols-2">
          <div className="border-b border-slate-100 p-5 sm:border-b-0 sm:border-r sm:p-6">
            <SectionLabel icon={FileText}>Ownership document</SectionLabel>
            <div className="mt-3 pl-42px">
              {proofDocumentUrl ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={proofDocumentUrl} target="_blank" rel="noreferrer">
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View document
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-slate-400">No document attached</p>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <SectionLabel icon={Clock3}>Submitted</SectionLabel>
            <div className="mt-3 pl-42px">
              <p className="text-sm font-medium text-slate-900">
                {formatDateTime(submittedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {status === "pending" && (
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsRejectDialogOpen(true)}
            disabled={isProcessing}
            className="border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            <X className="mr-1.5 h-4 w-4" />
            Reject
          </Button>
          <Button
            type="button"
            onClick={() => onApprove(id)}
            disabled={isProcessing}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Check className="mr-1.5 h-4 w-4" />
            Approve venue
          </Button>
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              Choose the reason that best explains the rejection — it's shared
              with the vendor.
            </DialogDescription>
          </DialogHeader>

          <select
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="" disabled>
              Select a reason…
            </option>
            {REJECTION_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {formatRejectionReason(reason)}
              </option>
            ))}
          </select>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRejectSubmit}
              disabled={!REJECTION_REASONS.includes(rejectReason)}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
