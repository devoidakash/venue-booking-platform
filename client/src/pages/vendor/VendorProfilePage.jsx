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
  ShieldCheck,
  ExternalLink,
  Eye,
  User,
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
      return;
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50/70 px-2 py-1 text-xs font-mono text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      title="Copy UUID"
    >
      <span>{id}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-slate-400" />
      )}
    </button>
  );
}

function InfoBlock({ icon: Icon, label, value, isLink, linkHref }) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50/60 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {isLink && linkHref ? (
          <a
            href={linkHref}
            className="mt-0.5 block truncate text-sm font-semibold text-indigo-600 hover:underline"
          >
            {value || "—"}
          </a>
        ) : (
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

function VendorProfileSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="h-48 w-full rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
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
        const payload = data ?? null;
        if (isMounted) setVendor(payload);
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
      <div className="flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
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
    <div className="w-full space-y-6">
      {/* Top Banner Profile Identity */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        {/* Subtle Decorative Background Ring */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-50/40 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 to-indigo-500 text-2xl font-bold tracking-tight text-white shadow-md shadow-indigo-200">
              {getInitials(vendorName)}
              {isVerified && (
                <span
                  title="Verified Partner"
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white"
                >
                  <Check className="h-3.5 w-3.5 stroke-3" />
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {vendorName}
                </h1>
                <Badge
                  className={`border px-2.5 py-0.5 font-semibold capitalize ${
                    isSuspended
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span
                    className={`mr-1.5 h-2 w-2 rounded-full ${
                      isSuspended ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                  />
                  {isSuspended ? "Suspended" : status || "Active"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500">
                <span>Account ID:</span>
                <CopyableId id={id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspension Alert */}
      {isSuspended && (
        <div className="flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <Ban className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-900">
              Account Under Active Suspension
            </h3>
            <p className="mt-1 text-sm text-rose-700">
              {suspensionReason ||
                "This account is currently blocked from publishing venues and accessing vendor services."}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Details & Meta */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Information Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <User className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Account Credentials & Contact
                </h2>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Role: {role}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoBlock
                icon={Mail}
                label="Registered Email"
                value={email}
                isLink
                linkHref={`mailto:${email}`}
              />
              <InfoBlock
                icon={Phone}
                label="Direct Mobile"
                value={phone}
                isLink
                linkHref={`tel:${phone}`}
              />
              <InfoBlock icon={MapPin} label="District" value={district} />
              <InfoBlock icon={Landmark} label="State / Region" value={state} />
            </div>
          </div>

          {/* Verification & Compliance Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                KYC & Operational Status
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoBlock
                icon={CalendarCheck}
                label="KYC Approval Date"
                value={formatDateTime(approvedAt)}
              />
              <InfoBlock
                icon={BadgeCheck}
                label="Verification Lifecycle"
                value={
                  isVerified ? "Verified Partner" : "Pending Document Audit"
                }
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: KYC Document Review */}
        <div className="space-y-6">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    PAN Verification
                  </h3>
                </div>
                {panDocumentUrl && (
                  <Badge className="border-0 bg-indigo-50 font-medium text-indigo-700">
                    Submitted
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Government-issued PAN record submitted by vendor during the
                onboarding workflow.
              </p>

              {/* Preview Thumbnail Window */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {panDocumentUrl ? (
                  <div className="group relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={panDocumentUrl}
                      alt="PAN Card Document"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <a
                        href={panDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview File
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center p-6 text-center text-slate-400">
                    <FileText className="h-8 w-8 stroke-1" />
                    <span className="mt-2 text-xs">
                      No PAN document attached
                    </span>
                  </div>
                )}
              </div>
            </div>

            {panDocumentUrl && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl text-slate-700 hover:bg-slate-50"
                  asChild
                >
                  <a href={panDocumentUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open Original Document
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
