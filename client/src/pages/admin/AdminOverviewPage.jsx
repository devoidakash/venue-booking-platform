import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, CircleCheck, CircleX, ArrowRight } from "lucide-react";
import { getVendorApplicationCount } from "@/api/admin.api";

const statusConfig = [
  {
    status: "pending",
    label: "Pending review",
    icon: Clock3,
    accent: "text-amber-600",
    iconBg: "bg-amber-50",
    barColor: "bg-amber-400",
    emphasize: true,
  },
  {
    status: "approved",
    label: "Approved",
    icon: CircleCheck,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-50",
    barColor: "bg-emerald-400",
  },
  {
    status: "rejected",
    label: "Rejected",
    icon: CircleX,
    accent: "text-rose-600",
    iconBg: "bg-rose-50",
    barColor: "bg-rose-400",
  },
];

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    pending: null,
    approved: null,
    rejected: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCounts() {
      setLoading(true);
      setError(null);

      try {
        const { pending, approved, rejected } =
          await getVendorApplicationCount();
        if (isMounted) setCounts({ pending, approved, rejected });
      } catch (err) {
        if (isMounted)
          setError("Couldn't load application counts. Try refreshing.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const total =
    loading || error
      ? null
      : (counts.pending ?? 0) + (counts.approved ?? 0) + (counts.rejected ?? 0);

  return (
    <div className="max-w-2xl space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Vendor Applications
        </h2>

        {/* Summary strip */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <p className="text-sm text-slate-500">Total applications</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-100 align-middle" />
              ) : (
                total
              )}
            </p>
          </div>
          {!loading && !error && counts.pending > 0 && (
            <button
              onClick={() => navigate("/admin/application?status=pending")}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {counts.pending} waiting on you
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Proportion bar */}
        <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
          {!loading &&
            !error &&
            total > 0 &&
            statusConfig.map(({ status, barColor }) => (
              <div
                key={status}
                className={barColor}
                style={{ width: `${(counts[status] / total) * 100}%` }}
              />
            ))}
        </div>

        {/* Status cards */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {statusConfig.map(
            ({ status, label, icon: Icon, accent, iconBg, emphasize }) => (
              <button
                key={status}
                onClick={() => navigate(`/admin/application?status=${status}`)}
                className={`group flex flex-col rounded-lg border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  emphasize ? "border-amber-200" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
                  >
                    <Icon className={`h-4 w-4 ${accent}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <p className="mt-3 text-xs font-medium text-slate-500">
                  {label}
                </p>

                {loading ? (
                  <span className="mt-1 inline-block h-7 w-8 animate-pulse rounded bg-slate-100" />
                ) : (
                  <p className="mt-0.5 text-2xl font-semibold text-slate-900">
                    {counts[status] ?? "—"}
                  </p>
                )}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
