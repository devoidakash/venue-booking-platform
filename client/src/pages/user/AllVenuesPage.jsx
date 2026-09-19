import { useEffect, useState } from "react";
import { ArrowRight, Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { getVenues } from "@/api/user.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

function VenueCard({ venue }) {
  return (
    <Card className="overflow-hidden border-0 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/venues/${venue.id}`} className="block overflow-hidden">
        <img
          src={venue.cover_img_url}
          alt={venue.name}
          className="aspect-4/3 w-full object-cover transition duration-500 hover:scale-105"
        />
      </Link>

      <CardContent className="gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              {toTitle(venue.category)}
            </p>
            <h2 className="truncate text-xl font-semibold text-slate-900">
              {venue.name}
            </h2>
          </div>
          <p className="shrink-0 text-right text-sm font-semibold text-slate-900">
            {formatPrice(venue.startingPrice)}
          </p>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-violet-600" />
            {venue.district}, {venue.state}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0 text-violet-600" />
            {toTime(venue.openingTime)} - {toTime(venue.closingTime)}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-500">
            {toTitle(venue.bookingType)}
          </span>
          <Button
            asChild
            variant="ghost"
            className="gap-2 px-0 text-violet-700 hover:text-violet-800"
          >
            <Link to={`/venues/${venue.id}`}>
              View venue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VenueSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-white">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <CardContent className="gap-4 p-5">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </section>
  );
}
