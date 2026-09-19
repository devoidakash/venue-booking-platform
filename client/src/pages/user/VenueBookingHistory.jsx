import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, ReceiptText } from "lucide-react";

import { getBookingHistory } from "@/api/user.api";

const STATUS_STYLES = {
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending_payment: "bg-amber-50 text-amber-700 ring-amber-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const toTitle = (value = "") =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

function formatDate(value) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return null;
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatAmount(value) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function BookingCard({ booking }) {
  const time = booking.startTime
    ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`
    : "Whole day booking";
  const statusClass =
    STATUS_STYLES[booking.bookingStatus] ??
    "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            {toTitle(booking.venueCategory)}
          </p>
          <h2 className="mt-1 truncate text-xl font-semibold text-slate-900">
            {booking.venueName}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Booking ID: {booking.bookingId}
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass}`}
        >
          {toTitle(booking.bookingStatus)}
        </span>
      </div>

      <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <div>
            <p className="text-xs text-slate-500">Date</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatDate(booking.bookingDate)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <div>
            <p className="text-xs text-slate-500">Schedule</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{time}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ReceiptText className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <div>
            <p className="text-xs text-slate-500">Total paid</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatAmount(booking.totalAmount)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function BookingSkeleton() {
  return <div className="h-52 animate-pulse rounded-2xl bg-white/70" />;
}

export default function VenueBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getBookingHistory()
      .then((data) => {
        if (isMounted) setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setError("We could not load your bookings right now.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
          Your plans
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Booking history
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Keep track of your venue reservations, schedules, and payment details.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!error && loading && (
        <div className="space-y-4">
          <BookingSkeleton />
          <BookingSkeleton />
        </div>
      )}

      {!error && !loading && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <MapPin className="mx-auto h-8 w-8 text-violet-500" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            No bookings yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your venue reservations will appear here after you make a booking.
          </p>
        </div>
      )}

      {!error && !loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.bookingId} booking={booking} />
          ))}
        </div>
      )}
    </section>
  );
}
