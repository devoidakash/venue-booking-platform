import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CalendarCheck,
  CheckCircle2,
  Copy,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Replace with your actual API import path
import { getVendorProfile } from "@/api/admin.api";

// --- UTILITIES ---
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

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "V";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function CopyableText({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-1.5 rounded-lg bg-slate-100/50 px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
      title={`Copy ${label}`}
    >
      <span className="truncate max-w-50">{text}</span>
      {copied ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

// --- SUB-COMPONENTS ---
function InfoCard({ icon: Icon, label, value, isLink, linkHref }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-colors hover:border-slate-200 hover:bg-slate-50/50">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {isLink && linkHref ? (
          <a
            href={linkHref}
            className="mt-0.5 block truncate text-base font-semibold text-indigo-600 hover:underline"
          >
            {value || "—"}
          </a>
        ) : (
          <p className="mt-0.5 truncate text-base font-semibold text-slate-900">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function VendorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const response = await getVendorProfile(id);
        const data = response?.data || response; // Handle different axios response shapes

        if (isMounted) setVendor(data);
      } catch {
        if (isMounted)
          setError(
            "Failed to load vendor profile. They may not exist or were removed.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) loadProfile();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !vendor) {
    return (
      <div className="flex min-h-[40vh] w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Profile Not Found
        </h2>
        <p className="mb-8 max-w-md text-base text-slate-500">{error}</p>
        <Button
          onClick={() => navigate("..", { relative: "path" })}
          className="h-12 rounded-xl bg-slate-900 px-8 text-base font-semibold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Directory
        </Button>
      </div>
    );
  }

  const {
    vendorName,
    email,
    phone,
    district,
    state,
    isSuspended,
    suspensionReason,
    accountStatus,
    approvedAt,
  } = vendor;

  const isVerified = Boolean(approvedAt);

  return (
    <div className="w-full space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("..", { relative: "path" })}
          className="-ml-3 h-10 gap-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </Button>
      </div>

      {/* Suspension Alert */}
      {isSuspended && (
        <div className="flex items-start gap-4 rounded-3xl border border-rose-200 bg-linear-to-r from-rose-50 to-white p-6 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <Ban className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-rose-900">
              Account Suspended
            </h3>
            <p className="mt-1 text-sm text-rose-700">
              This vendor is currently blocked from platform operations.
            </p>
            {suspensionReason && (
              <div className="mt-3 rounded-xl border border-rose-100 bg-white/60 p-3 text-sm text-rose-800">
                <span className="font-semibold">Reason:</span>{" "}
                {suspensionReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Decorative Background */}
        <div className="absolute inset-0 h-32 bg-li-to-r from-indigo-500 via-purple-500 to-indigo-600 sm:h-40" />

        <div className="relative px-6 pb-8 pt-20 sm:px-10 sm:pt-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Avatar Profile */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-slate-900 text-3xl font-bold text-white shadow-md sm:h-32 sm:w-32 sm:text-4xl">
                {getInitials(vendorName)}
                {isVerified && !isSuspended && (
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Name & Badges */}
              <div className="mb-2 space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {vendorName}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={`border-0 px-3 py-1 font-bold tracking-wider uppercase ${
                      isSuspended
                        ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                        : accountStatus === "active"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isSuspended ? "Suspended" : accountStatus || "Unknown"}
                  </Badge>
                  {isVerified && (
                    <Badge className="border-0 bg-indigo-50 px-3 py-1 font-bold tracking-wider text-indigo-700 uppercase hover:bg-indigo-50">
                      Verified Partner
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions / Meta */}
            <div className="mb-2 flex flex-col items-start sm:items-end gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                System ID
              </span>
              <CopyableText text={id} label="Vendor ID" />
            </div>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={Mail}
          label="Email Address"
          value={email}
          isLink
          linkHref={`mailto:${email}`}
        />
        <InfoCard
          icon={Phone}
          label="Phone Number"
          value={phone}
          isLink
          linkHref={`tel:${phone}`}
        />
        <InfoCard icon={MapPin} label="District" value={district} />
        <InfoCard icon={Landmark} label="State / Region" value={state} />
      </div>

      {/* Extended Details / Audit Section */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Account Operations & Audit
          </h2>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 p-6 sm:p-8">
          <div className="pb-6 sm:pb-0 sm:pr-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  KYC Approval Date
                </p>
                <p className="mt-1 text-lg font-medium text-slate-900">
                  {formatDateTime(approvedAt)}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {approvedAt
                    ? "Fully verified by administration."
                    : "Pending verification."}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pl-8 sm:pt-0">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Account Type
                </p>
                <p className="mt-1 text-lg font-medium text-slate-900 capitalize">
                  Vendor Partner
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Standard platform permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
