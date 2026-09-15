"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Clock,
  CalendarClock,
  Ticket,
  Wallet,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Share2,
} from "lucide-react";
import { useParams } from "react-router-dom";

import {
  createBooking,
  createPaymentOrder,
  getVenuePricing,
  getVenues,
  verifyPayment,
} from "@/api/user.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import VenuePricingPage from "@/pages/user/VenuePricingPage";
import VenuePaymentConfirmationPage from "@/pages/user/VenuePaymentConfirmationPage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* ---------------------------------- utils --------------------------------- */

const toTime = (t) => {
  if (!t) return "--";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

const toTitle = (s = "") =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const BOOKING_LABEL = {
  whole_day: "Whole day access",
  slot_based: "Slot based entry",
};

const formatBookingDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatBookingTime = (hour) =>
  `${String(Number(hour)).padStart(2, "0")}:00:00`;

/* --------------------------------- gallery -------------------------------- */

function HeroGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [left, ...thumbnails] = images;
  const extra = Math.max(images.length - 5, 0);

  const tile =
    "group relative overflow-hidden bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";
  const img =
    "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105";

  return (
    <Dialog>
      <div className="relative">
        <div className="grid h-64 grid-cols-2 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl sm:h-105 sm:grid-cols-5">
          <DialogTrigger asChild>
            <button
              onClick={() => setActive(0)}
              className={`${tile} col-span-2 row-span-2 sm:col-span-3`}
            >
              <img src={left} alt={name} className={img} />
            </button>
          </DialogTrigger>

          {thumbnails.slice(0, 4).map((src, i) => (
            <DialogTrigger asChild key={src ?? i}>
              <button
                onClick={() => setActive(i + 1)}
                className={`${tile} hidden sm:block`}
              >
                <img src={src} alt="" className={img} />
                {i === 3 && extra > 0 && (
                  <span className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-medium text-white">
                    +{extra}
                  </span>
                )}
              </button>
            </DialogTrigger>
          ))}
        </div>

        <DialogTrigger asChild>
          <button
            aria-label="View all photos"
            onClick={() => setActive(0)}
            className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition hover:scale-105 sm:grid"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </DialogTrigger>
      </div>

      <DialogContent className="w-[calc(100%-2rem)] max-w-5xl gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-6xl">
        <DialogHeader className="min-w-0 px-6 pt-6">
          <DialogTitle className="text-base font-medium">{name}</DialogTitle>
        </DialogHeader>
        <div className="min-w-0 px-6 pb-6">
          <div className="relative">
            <img
              src={images[active]}
              alt=""
              className="aspect-16/10 max-h-[75vh] w-full rounded-xl bg-neutral-100 object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() =>
                    setActive((current) =>
                      current === 0 ? images.length - 1 : current - 1,
                    )
                  }
                  className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-md transition hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() =>
                    setActive((current) => (current + 1) % images.length)
                  }
                  className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-md transition hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                  i === active
                    ? "ring-violet-600"
                    : "opacity-60 ring-transparent hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- pieces --------------------------------- */

function Fact({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-[15px] text-neutral-700">
      <Icon className="h-4.5 w-4.5 shrink-0 text-neutral-400" />
      <span>{children}</span>
    </div>
  );
}

function InfoRow({ icon: Icon, title, subtitle, href, accent }) {
  const Comp = href ? "a" : "div";
  return (
    <Comp
      {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-neutral-50"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[15px] font-medium ${
            accent ? "text-emerald-600" : "text-neutral-900"
          }`}
        >
          {title}
        </p>
        <p className="truncate text-[13px] text-neutral-500">{subtitle}</p>
      </div>
      {href && <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />}
    </Comp>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-8 w-72 rounded-lg" />
      <Skeleton className="mt-3 h-4 w-44 rounded" />
      <Skeleton className="mt-6 h-64 w-full rounded-2xl sm:h-105" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/* ----------------------------------- page --------------------------------- */

export default function VenueBookingPage({ onBook }) {
  const { venueId } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [pricingData, setPricingData] = useState(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const handleConfirmationClose = useCallback(
    () => setConfirmedBooking(null),
    [],
  );
  const [pricingError, setPricingError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadVenue() {
      setLoading(true);
      setError(null);
      try {
        const data = await getVenues(venueId);
        if (isMounted) setVenue(data);
      } catch {
        if (isMounted) setError("Couldn't load this venue. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadVenue();
    return () => {
      isMounted = false;
    };
  }, [venueId]);

  if (loading) return <PageSkeleton />;

  if (error || !venue) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="flex max-w-sm flex-col items-center text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-neutral-400" />
          <h1 className="text-lg font-semibold">Venue unavailable</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {error || "This venue could not be found."}
          </p>
          <Button
            variant="outline"
            className="mt-5 rounded-full"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const {
    name,
    description,
    category,
    district,
    state,
    pincode,
    latitude,
    longitude,
    bookingType,
    openingTime,
    closingTime,
    startingPrice,
    images = [],
  } = venue;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const hours = `${toTime(openingTime)} - ${toTime(closingTime)}`;
  const access = BOOKING_LABEL[bookingType] ?? toTitle(bookingType);

  const handleShare = async () => {
    const shareData = { title: name, url: window.location.href };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch (shareError) {
        if (shareError.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert("Venue link copied to clipboard.");
    } catch {
      window.prompt("Copy this venue link:", window.location.href);
    }
  };

  const handleBook = async () => {
    if (onBook) {
      onBook(venue);
      return;
    }

    setPricingLoading(true);
    setPricingError(null);
    try {
      const data = await getVenuePricing(venue.id);
      setPricingData(data);
      setPricingOpen(true);
    } catch {
      setPricingError("Could not load ticket pricing. Please try again.");
    } finally {
      setPricingLoading(false);
    }
  };

  const handleProceed = async ({ date, slot, quantity, bookingType }) => {
    setBookingLoading(true);
    setPricingError(null);

    const payload = {
      bookingDate: formatBookingDate(date),
      bookingType: bookingType === "whole_day" ? "whole_day" : "time_slot",
      quantity,
    };

    if (payload.bookingType === "time_slot") {
      const [startHour, endHour] = slot.split("-");
      payload.startTime = formatBookingTime(startHour);
      payload.endTime = formatBookingTime(endHour);
    }

    try {
      const booking = await createBooking(venueId, payload);
      const paymentOrder = await createPaymentOrder(booking.bookingId);

      if (typeof window.Razorpay !== "function") {
        throw new Error("Payment checkout is unavailable. Please try again.");
      }

      const razorpay = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Venuz",
        description: "Venue booking",
        order_id: paymentOrder.orderId,
        handler: async (response) => {
          try {
            const confirmation = await verifyPayment(booking.bookingId, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            setConfirmedBooking(confirmation);
          } catch (err) {
            setPricingError(
              err?.response?.data?.message ||
                "Payment verification failed. Please contact support.",
            );
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false);
          },
        },
        theme: {
          color: "#171717",
        },
      });

      razorpay.open();
      setPricingOpen(false);
    } catch (err) {
      setPricingError(
        err?.response?.data?.message ||
          err.message ||
          "Could not start payment. Please try again.",
      );
      setBookingLoading(false);
    }
  };

  return (
    <div className="pb-24 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-8">
        {/* Title */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-neutral-900 sm:text-[32px]">
              {name}
            </h1>
            <p className="mt-1 text-[15px] font-medium text-violet-600">
              Open daily, {access.toLowerCase()}
            </p>
          </div>

          <div className="flex items-center gap-5 pt-1">
            <div className="text-right">
              <p className="text-[15px] font-semibold text-neutral-900">
                {toTitle(category)}
              </p>
              <p className="text-[13px] text-neutral-500">
                {district}, {state}
              </p>
            </div>
            <span className="h-9 w-px bg-neutral-200" />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Share venue"
              className="rounded-full text-neutral-500"
              onClick={handleShare}
            >
              <Share2 className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <HeroGallery images={images} name={name} />
        </div>

        {/* Body */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-14">
          <div className="space-y-12">
            {/* About */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900">
                About the venue
              </h2>

              <p
                className={`mt-5 max-w-[66ch] text-[15px] leading-7 text-neutral-600 ${
                  expanded ? "" : "line-clamp-3"
                }`}
              >
                {description}
              </p>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900"
              >
                {expanded ? "Read less" : "Read more"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </section>

            {/* Things to know */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900">
                Things to know
              </h2>
              <div className="mt-4 grid gap-x-10 sm:grid-cols-2">
                <Fact icon={Ticket}>{access}</Fact>
                <Fact icon={CalendarClock}>Open all days of the week</Fact>
                <Fact icon={Clock}>{hours}</Fact>
                <Fact icon={Wallet}>Tickets from {inr(startingPrice)}</Fact>
                <Fact icon={MapPin}>
                  {district}, {state} {pincode}
                </Fact>
              </div>
            </section>

            {/* More */}
            <section>
              <h2 className="text-xl font-semibold text-neutral-900">More</h2>
              <a className="mt-4 flex items-center gap-3 rounded-xl bg-white px-4 py-4 shadow-[0_1px_2px_rgba(16,12,40,.06)] ring-1 ring-black/5 transition hover:shadow-md">
                <FileText className="h-4.5 w-4.5 text-neutral-500" />
                <span className="flex-1 text-[15px] font-medium">
                  Terms and conditions
                </span>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </a>
            </section>
          </div>

          {/* Sticky rail */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:space-y-3">
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(16,12,40,.06)] ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-[13px] text-neutral-500">From</p>
                  <p className="text-[22px] font-semibold leading-tight text-neutral-900">
                    {inr(startingPrice)}
                  </p>
                  <p className="text-[12px] text-neutral-400">(Inc. taxes)</p>
                </div>
                <Button
                  onClick={handleBook}
                  disabled={pricingLoading}
                  className="h-11 rounded-xl bg-neutral-900 px-6 text-[15px] hover:bg-neutral-800"
                >
                  Book tickets
                </Button>
              </div>
            </div>

            <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(16,12,40,.06)] ring-1 ring-black/5">
              <InfoRow
                icon={MapPin}
                title={`${name}, ${district}`}
                subtitle={`${state} ${pincode}`}
                href={mapsUrl}
              />
              <InfoRow
                icon={Clock}
                title="Open daily"
                subtitle={hours}
                accent
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <div>
          <p className="text-[18px] font-semibold leading-none text-neutral-900">
            {inr(startingPrice)}
          </p>
          <p className="mt-1 text-[12px] text-neutral-500">
            Inc. taxes · {hours}
          </p>
        </div>
        <Button
          onClick={handleBook}
          disabled={pricingLoading}
          className="h-11 rounded-xl bg-neutral-900 px-7 hover:bg-neutral-800"
        >
          Book tickets
        </Button>
      </div>

      {pricingError && (
        <p className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 shadow-lg">
          {pricingError}
        </p>
      )}

      <VenuePricingPage
        venue={venue}
        pricingData={pricingData}
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        onProceed={handleProceed}
        proceedLoading={bookingLoading}
      />

      <VenuePaymentConfirmationPage
        booking={confirmedBooking}
        open={Boolean(confirmedBooking)}
        onClose={handleConfirmationClose}
      />
    </div>
  );
}
