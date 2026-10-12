import { useEffect, useState } from "react";
import { Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { getVenues } from "@/api/user.api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const POSTER_THEMES = [
  {
    background:
      "linear-gradient(135deg, #1124c5 0%, #1b4de0 35%, #0b0d2c 100%)",
    accent: "#facc15",
    overlay: "rgba(15,23,42,0.18)",
  },
  {
    background:
      "linear-gradient(135deg, #0d0d0f 0%, #1a1d2b 38%, #3a3a3a 100%)",
    accent: "#f8fafc",
    overlay: "rgba(255,255,255,0.06)",
  },
  {
    background:
      "linear-gradient(135deg, #f6d8e6 0%, #f59e0b 42%, #7c3aed 100%)",
    accent: "#111827",
    overlay: "rgba(17,24,39,0.1)",
  },
  {
    background:
      "linear-gradient(135deg, #5b0f23 0%, #f43f5e 35%, #111827 100%)",
    accent: "#f5f3ff",
    overlay: "rgba(255,255,255,0.08)",
  },
];

const toTitle = (value = "") =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const toTime = (value) => {
  if (!value) return "Not available";

  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;

  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return "Price unavailable";
  return `From ₹${Number(value).toLocaleString("en-IN")}`;
};

function VenueCard({ venue, index = 0 }) {
  const theme = POSTER_THEMES[index % POSTER_THEMES.length];
  const title = venue.name || "Featured venue";

  return (
    <Card className="group overflow-hidden border-0 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(15,23,42,0.12)]">
      <Link
        to={`/venues/${venue.id}`}
        className="block overflow-hidden rounded-[28px]"
      >
        <div
          className="relative aspect-4/5 overflow-hidden p-4 text-white"
          style={{ background: theme.background }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at top left, ${theme.overlay}, transparent 38%)`,
            }}
          />

          {venue.coverImage && (
            <img
              src={venue.coverImage}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-screen"
            />
          )}

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
              <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1 backdrop-blur-sm">
                {toTitle(venue.category)}
              </span>
              <span
                className="text-(--poster-accent)"
                style={{ color: theme.accent }}
              >
                {toTitle(venue.bookingType)}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="max-w-[10ch] text-[clamp(2rem,3vw,4rem)] font-black uppercase leading-[0.85] tracking-[-0.06em] text-white">
                {title}
              </h2>
            </div>
          </div>
        </div>
      </Link>

      <div className="space-y-3 px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {toTitle(venue.category)}
        </p>

        <div className="space-y-2">
          <h3 className="text-[1.8rem] font-bold leading-none tracking-[-0.04em] text-slate-900">
            {title}
          </h3>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-violet-600" />
            {venue.district}, {venue.state}
          </p>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Clock3 className="h-4 w-4 shrink-0 text-violet-600" />
            {toTime(venue.openingTime)} - {toTime(venue.closingTime)}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-base font-semibold text-slate-900">
            {formatPrice(venue.startingPrice)}
          </span>
          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-violet-700">
            Book now
          </span>
        </div>
      </div>
    </Card>
  );
}

function VenueSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-white">
      <Skeleton className="aspect-4/5 w-full rounded-none" />
      <div className="space-y-3 px-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-full" />
      </div>
    </Card>
  );
}

export default function AllVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getVenues()
      .then((data) => {
        if (isMounted) setVenues(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setError("We could not load venues right now.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
          Find your place
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Venues made for your moments
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Browse live venues, compare the essentials, and choose the setting
          that fits your next event.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <VenueSkeleton key={index} />
          ))}
        </div>
      )}

      {!error && !isLoading && venues.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            No venues are available yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Check back soon for new places to book.
          </p>
        </div>
      )}

      {!error && !isLoading && venues.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {venues.map((venue, index) => (
            <VenueCard key={venue.id} venue={venue} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
