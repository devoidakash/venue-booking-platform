import { useEffect, useMemo } from "react";
import { CheckCircle2, Mail, Ticket } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatCurrency = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

export default function VenuePaymentConfirmationPage({
  booking: bookingProp,
  open = true,
  onClose,
}) {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const booking = bookingProp ?? location.state?.booking;
  const close = useMemo(
    () => onClose ?? (() => navigate(-1)),
    [navigate, onClose],
  );

  useEffect(() => {
    if (!open) return undefined;
    const redirectTimer = window.setTimeout(close, 3000);
    return () => window.clearTimeout(redirectTimer);
  }, [close, open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogContent
        showCloseButton
        className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl p-6 sm:max-w-lg sm:p-8"
      >
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogTitle className="mt-5 text-2xl font-semibold text-neutral-900">
            Booking confirmed
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-neutral-500">
            Your payment was successful and your booking is confirmed.
          </DialogDescription>

          <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Booking ID</p>
              <p className="mt-1 break-all text-sm font-medium text-neutral-900">
                {booking?.id ?? bookingId}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Visit date</p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {formatDate(booking?.booking_date)}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Tickets</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-neutral-900">
                <Ticket className="h-4 w-4 text-violet-600" />
                {booking?.quantity ?? "-"}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">Amount paid</p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {formatCurrency(booking?.total_amount)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-violet-50 p-4 text-left text-sm text-violet-900">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
            <p>Your tickets will be sent to your registered email address.</p>
          </div>

          <p className="mt-6 text-xs text-neutral-400">
            Closing in 3 seconds...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
