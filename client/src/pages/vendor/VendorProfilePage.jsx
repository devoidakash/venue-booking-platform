import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  Landmark,
  CalendarCheck,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  Ban,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getVendorProfile } from "@/api/vendor.api";

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function CopyableId({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available — fail silently
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      title="Copy vendor ID"
    >
      <span className="font-mono">{id.slice(0, 8)}…</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function VendorProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VendorProfilePage() {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getVendorProfile();
        if (isMounted) setVendor(data ?? null);
      } catch {
        if (isMounted)
          setError("Couldn't load this vendor's profile. Try refreshing.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [vendorId]);

  if (loading) return <VendorProfileSkeleton />;

  if (error) {
    return (
      <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

  if (!vendor) return null;

  const {
    id,
    email,
    role,
    status,
    vendorName,
    phone,
    district,
    state,
    isSuspended,
    suspensionReason,
    approvedAt,
    panDocumentUrl,
  } = vendor;

  const isVerified = Boolean(approvedAt);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg font-semibold text-indigo-600">
              {getInitials(vendorName)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900">
                  {vendorName}
                </h1>
                {isVerified && (
                  <Badge className="gap-1 border-0 bg-indigo-50 font-medium text-indigo-600 hover:bg-indigo-50">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span>{email}</span>
                <span className="text-slate-300">·</span>
                <CopyableId id={id} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <Badge
              className={`border-0 font-medium ${
                isSuspended
                  ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {isSuspended ? "Suspended" : "Active"}
            </Badge>
            <span className="text-xs capitalize text-slate-400">{role}</span>
          </div>
        </div>
      </div>

      {/* Suspension notice */}
      {isSuspended && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <Ban className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="text-sm font-semibold text-rose-700">
              This vendor account is suspended
            </p>
            <p className="mt-0.5 text-sm text-rose-600">
              {suspensionReason || "No reason was provided."}
            </p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-sm font-semibold text-slate-900">
          Vendor details
        </h2>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <DetailItem icon={Phone} label="Phone number" value={phone} />
          <DetailItem icon={Mail} label="Email address" value={email} />
          <DetailItem icon={MapPin} label="District" value={district} />
          <DetailItem icon={Landmark} label="State" value={state} />
          <DetailItem
            icon={CalendarCheck}
            label="Approved on"
            value={formatDateTime(approvedAt)}
          />
          <DetailItem
            icon={BadgeCheck}
            label="Status"
            value={status ? status[0].toUpperCase() + status.slice(1) : "—"}
          />
        </div>
      </div>

      {/* Document */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
            <FileText className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">PAN document</p>
            <p className="text-xs text-slate-500">
              Submitted during KYC verification
            </p>
          </div>
        </div>
        {panDocumentUrl ? (
          <Button variant="outline" asChild>
            <a href={panDocumentUrl} target="_blank" rel="noreferrer">
              View document
            </a>
          </Button>
        ) : (
          <span className="text-sm text-slate-400">Not available</span>
        )}
      </div>
    </div>
  );
}
