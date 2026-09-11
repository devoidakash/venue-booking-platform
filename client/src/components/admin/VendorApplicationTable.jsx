import { useCallback, useEffect, useState } from "react";
import {
  Clock3,
  CircleCheck,
  CircleX,
  FileText,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const REJECTION_REASONS = [
  "pan_image_unclear",
  "pan_name_mismatch",
  "invalid_pan_number",
  "invalid_address",
  "invalid_phone",
  "document_not_supported",
  "duplicate_application",
];

const STATUS_CONFIG = {
  pending: {
    title: "Pending Review",
    icon: Clock3,
    iconColor: "text-amber-500",
    headerBg: "bg-amber-50/70",
    headerBorder: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    countNoun: "requests",
    emptyMessage: "No pending requests",
    dateColumn: { key: "submittedAt", label: "Submitted" },
  },
  approved: {
    title: "Approved",
    icon: CircleCheck,
    iconColor: "text-emerald-500",
    headerBg: "bg-emerald-50/70",
    headerBorder: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    countNoun: "vendors",
    emptyMessage: "No approved vendors yet",
    dateColumn: { key: "reviewedAt", label: "Approved On" },
  },
  rejected: {
    title: "Rejected",
    icon: CircleX,
    iconColor: "text-rose-500",
    headerBg: "bg-rose-50/70",
    headerBorder: "border-rose-200",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
    countNoun: "vendors",
    emptyMessage: "No rejected vendors",
    dateColumn: { key: "reviewedAt", label: "Rejected On" },
  },
};

const BASE_COLUMNS = [
  { key: "panName", label: "PAN Name" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "pincode", label: "Pincode" },
  { key: "district", label: "District" },
  { key: "state", label: "State" },
  { key: "panNumber", label: "PAN Number" },
];

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

function DocumentLink({ url }) {
  if (!url) return <span className="text-sm text-slate-400">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
    >
      <FileText className="h-3.5 w-3.5" />
      View
    </a>
  );
}

export default function VendorApplicationsTable({
  status,
  fetchApplications,
  reviewApplication,
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Row-level action state
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplications(status);
      setRows(data ?? []);
    } catch {
      setError(
        `Couldn't load ${config.title.toLowerCase()} applications. Try refreshing.`,
      );
    } finally {
      setLoading(false);
    }
  }, [fetchApplications, status, config.title]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!isMounted) return;
      await load();
    })();
    return () => {
      isMounted = false;
    };
  }, [load]);

  const handleApprove = async (row) => {
    setBusyId(row.id);
    setBusyAction("approve");
    try {
      await reviewApplication(row.id, { status: "approved" });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      setError("Couldn't approve this application. Try again.");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const openRejectDialog = (row) => {
    setRejectTarget(row);
    setRejectReason("");
    setRejectError(null);
  };

  const confirmReject = async () => {
    if (!REJECTION_REASONS.includes(rejectReason)) {
      setRejectError("Select a valid rejection reason.");
      return;
    }
    setBusyId(rejectTarget.id);
    setBusyAction("reject");
    try {
      await reviewApplication(rejectTarget.id, {
        status: "rejected",
        rejectionReason: rejectReason,
      });
      setRows((prev) => prev.filter((r) => r.id !== rejectTarget.id));
      setRejectTarget(null);
    } catch {
      setRejectError("Couldn't reject this application. Try again.");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  // Build the column list for this status
  const columns = [
    ...BASE_COLUMNS,
    { key: "date", label: config.dateColumn.label },
    { key: "reason", label: "Reason" }, // rejected only
    { key: "document", label: "Document" },
    { key: "actions", label: "Actions" }, // pending only
  ].filter((col) => {
    if (col.key === "reason") return status === "rejected";
    if (col.key === "actions") return status === "pending";
    return true;
  });

  const skeletonRows = Array.from({ length: 4 });

  return (
    <div
      className={`min-h-full overflow-hidden rounded-xl border ${config.headerBorder}`}
    >
      {/* Header banner */}
      <div
        className={`flex items-center justify-between border-b ${config.headerBorder} ${config.headerBg} px-6 py-4`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
          <h2 className="text-base font-semibold text-slate-900">
            {config.title}
          </h2>
        </div>
        <Badge
          className={`border-0 ${config.badgeBg} ${config.badgeText} font-medium hover:${config.badgeBg}`}
        >
          {loading ? "…" : rows.length} {config.countNoun}
        </Badge>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="whitespace-nowrap font-semibold text-slate-800"
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {error && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="bg-rose-50 py-3 text-sm text-rose-600"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {loading &&
              skeletonRows.map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  {config.emptyMessage}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-slate-900">
                    {row.panName}
                  </TableCell>
                  <TableCell className="text-slate-600">{row.phone}</TableCell>
                  <TableCell className="max-w-55 truncate text-slate-600">
                    {row.address}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {row.pincode}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {row.district}
                  </TableCell>
                  <TableCell className="text-slate-600">{row.state}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {row.panNumber}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-600">
                    {formatDateTime(row[config.dateColumn.key])}
                  </TableCell>

                  {status === "rejected" && (
                    <TableCell>
                      <span
                        className="block max-w-55 truncate text-slate-600"
                        title={row.rejectionReason || ""}
                      >
                        {row.rejectionReason || "—"}
                      </span>
                    </TableCell>
                  )}

                  <TableCell>
                    <DocumentLink url={row.panDocumentUrl} />
                  </TableCell>

                  {status === "pending" && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          disabled={busyId === row.id}
                          onClick={() => handleApprove(row)}
                        >
                          {busyId === row.id && busyAction === "approve" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          disabled={busyId === row.id}
                          onClick={() => openRejectDialog(row)}
                        >
                          {busyId === row.id && busyAction === "reject" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Reject reason dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              {rejectTarget &&
                `Tell ${rejectTarget.panName} why this KYC application is being rejected.`}
            </DialogDescription>
          </DialogHeader>

          <select
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (rejectError) setRejectError(null);
            }}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Select a rejection reason</option>
            {REJECTION_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          {rejectError && (
            <p className="text-sm text-rose-600">{rejectError}</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={busyId === rejectTarget?.id}
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={confirmReject}
              disabled={busyId === rejectTarget?.id}
            >
              {busyId === rejectTarget?.id && busyAction === "reject" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Reject application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
