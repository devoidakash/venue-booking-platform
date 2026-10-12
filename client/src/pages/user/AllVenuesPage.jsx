import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
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

      <div className="space-y-3 px-4 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {toTitle(venue.category)}
        </p>

        <div className="space-y-2">
          <h3 className="text-[1.35rem] font-bold leading-none tracking-[-0.04em] text-slate-900">
            {title}
          </h3>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-violet-600" />
            {venue.district || venue.city || "Location"},{" "}
            {venue.state || "India"}
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

function FeaturedHero({ venues }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = venues.slice(0, 5);
  const activeVenue = featured[activeIndex] || featured[0];

  useEffect(() => {
    if (
      featured.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featured.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [featured.length]);

  if (!activeVenue) return null;

  const theme = POSTER_THEMES[activeIndex % POSTER_THEMES.length];
  const title = activeVenue.name || "Featured venue";
  const location = `${activeVenue.district || activeVenue.city || "Location"}, ${activeVenue.state || "India"}`;

  return (
    <section className="mb-12 p-0">
      <div className="grid items-center gap-8 lg:grid-cols-[1.7fr_0.9fr]">
        <div className="relative flex min-h-85 items-center">
          <button
            type="button"
            aria-label="Previous venue"
            onClick={() =>
              setActiveIndex((current) =>
                current === 0 ? featured.length - 1 : current - 1,
              )
            }
            className="absolute -left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 sm:-left-4"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="ml-8 w-full max-w-175 pr-2 sm:ml-12">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
              Daily, Multiple slots
            </p>

            <h2 className="max-w-2xl text-3xl font-black leading-[0.92] tracking-[-0.06em] text-slate-900 sm:text-4xl lg:text-5xl">
              {title}
            </h2>

            <p className="mt-4 text-xl font-medium text-slate-700 sm:text-2xl">
              {activeVenue.state || "Haryana"}
            </p>

            <div className="mt-4 space-y-2 text-base text-slate-600">
              <p className="font-medium">{location}</p>
              <p className="text-sm">
                {formatPrice(activeVenue.startingPrice)}
              </p>
            </div>

            <Link
              to={`/venues/${activeVenue.id}`}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
            >
              Book tickets
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <button
            type="button"
            aria-label="Next venue"
            onClick={() =>
              setActiveIndex((current) =>
                current === featured.length - 1 ? 0 : current + 1,
              )
            }
            className="absolute -right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 sm:-right-4"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            className="relative aspect-4/5 w-full max-w-105 overflow-hidden rounded-[26px] shadow-[0_28px_60px_rgba(15,23,42,0.18)]"
            style={{ background: theme.background }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at top left, ${theme.overlay}, transparent 38%)`,
              }}
            />

            {activeVenue.coverImage && (
              <img
                key={activeVenue.id || activeIndex}
                src={activeVenue.coverImage}
                alt={title}
                className="venue-hero-image absolute inset-0 h-full w-full object-cover opacity-75 mix-blend-screen"
              />
            )}

            <div className="relative z-10 flex h-full flex-col justify-between p-5">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">
                <span className="rounded-full border border-white/30 bg-white/10 px-2 py-1 backdrop-blur-sm">
                  {toTitle(activeVenue.category)}
                </span>
                <span style={{ color: theme.accent }}>
                  {toTitle(activeVenue.bookingType)}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold uppercase tracking-widest text-white/80">
                  {toTitle(activeVenue.category)}
                </p>
                <h3 className="max-w-[9ch] text-[clamp(2rem,3vw,4rem)] font-black uppercase leading-[0.8] tracking-[-0.07em] text-white">
                  {title}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        {featured.map((venue, index) => (
          <button
            key={venue.id || index}
            type="button"
            aria-label={`Show ${venue.name}`}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex ? "w-10 bg-slate-900" : "w-2.5 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </section>
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
        <>
          <FeaturedHero venues={venues} />

          <div className="mt-10">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
              Explore venues
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {venues.map((venue, index) => (
                <VenueCard key={venue.id} venue={venue} index={index} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
