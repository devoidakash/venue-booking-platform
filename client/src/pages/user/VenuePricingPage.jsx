import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const isWeekendDay = (date) => {
  const d = date.getDay();
  return d === 0 || d === 6;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Monday-first grid: JS getDay() 0=Sun..6=Sat -> 0=Mon..6=Sun
const mondayIndex = (jsDay) => (jsDay + 6) % 7;

const formatHour = (h) => {
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:00 ${suffix}`;
};

const parseHour = (t) => (t ? Number(t.split(":")[0]) : null);

function usePricingLookup(pricing = []) {
  return useMemo(() => {
    const dayEntries = pricing.filter((p) => p.durationMinutes == null);
    const slotEntries = pricing.filter((p) => p.durationMinutes === 60);
    const mode = slotEntries.length > 0 ? "slot" : "whole_day";

    const dayPrice = (date) => {
      const type = isWeekendDay(date) ? "weekend" : "weekday";
      const match = dayEntries.find((p) => p.dayType === type) ?? dayEntries[0];
      return match?.price ?? null;
    };

    const slotEntry = (date) => {
      const type = isWeekendDay(date) ? "weekend" : "weekday";
      const match =
        slotEntries.find((p) => p.dayType === type) ??
        slotEntries.find((p) => p.dayType === "time_slot") ??
        slotEntries[0];
      return match ?? null;
    };

    const priceForDate = (date) =>
      mode === "slot" ? (slotEntry(date)?.price ?? null) : dayPrice(date);

    return { mode, priceForDate, slotEntry };
  }, [pricing]);
}

function Calendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  priceForDate,
  canGoBack,
  canGoForward,
  earliestDate,
  latestDate,
}) {
  const year = month.getFullYear();
  const m = month.getMonth();

  const totalDays = new Date(year, m + 1, 0).getDate();
  const leading = mondayIndex(new Date(year, m, 1).getDay());

  const cells = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => new Date(year, m, i + 1)),
  ];

  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-[15px] font-semibold text-neutral-900">
          {MONTHS[m]} {year}
        </h3>
        {canGoBack && (
          <button
            aria-label="Previous month"
            onClick={() => onMonthChange(new Date(year, m - 1, 1))}
            className="grid h-6 w-6 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canGoForward && (
          <button
            aria-label="Next month"
            onClick={() => onMonthChange(new Date(year, m + 1, 1))}
            className="grid h-6 w-6 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-3 gap-x-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-xs font-medium text-neutral-400">
            {w}
          </span>
        ))}

        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;

          const disabled = date < earliestDate || date > latestDate;
          const isSelected = selected && isSameDay(date, selected);
          const price = !disabled ? priceForDate(date) : null;

          return (
            <button
              key={date.toISOString()}
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-sm transition ${
                disabled
                  ? "cursor-not-allowed text-neutral-300"
                  : isSelected
                    ? "bg-violet-50 font-semibold text-violet-700 ring-1 ring-violet-300"
                    : "text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              <span>{date.getDate()}</span>
              {price != null && (
                <span
                  className={`text-[11px] ${
                    isSelected ? "text-violet-500" : "text-neutral-400"
                  }`}
                >
                  {inr(price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SlotPanel({
  openingTime,
  closingTime,
  date,
  price,
  selectedSlot,
  onSelect,
}) {
  const openHour = parseHour(openingTime);
  const closeHour = parseHour(closingTime);

  if (!date) {
    return (
      <div className="grid h-full min-h-220px place-items-center px-6 text-center text-sm text-neutral-400 lg:min-h-0">
        Select a date to see available times
      </div>
    );
  }

  if (openHour == null || closeHour == null || closeHour <= openHour) {
    return (
      <div className="grid h-full min-h-220px place-items-center px-6 text-center text-sm text-neutral-400 lg:min-h-0">
        No time slots available for this venue.
      </div>
    );
  }

  const today = new Date();
  const isToday = isSameDay(date, today);
  const nowHour = isToday ? today.getHours() : null;
  const nowMinute = isToday ? today.getMinutes() : 0;
  const minuteThreshold = nowMinute > 0 ? 1 : 0;
  const earliestStartHour = isToday
    ? Math.max(openHour, nowHour + minuteThreshold)
    : openHour;

  const slots = Array.from(
    { length: closeHour - earliestStartHour },
    (_, i) => ({
      start: earliestStartHour + i,
      end: earliestStartHour + i + 1,
    }),
  ).filter((slot) => slot.end <= closeHour);

  if (slots.length === 0) {
    return (
      <div className="grid h-full min-h-220px place-items-center px-6 text-center text-sm text-neutral-400 lg:min-h-0">
        No time slots available for this venue.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-1">
      {slots.map((s) => {
        const key = `${s.start}-${s.end}`;
        const isSelected = selectedSlot === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key, price)}
            className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
              isSelected
                ? "border-violet-300 bg-violet-50 text-violet-700"
                : "border-neutral-200 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {formatHour(s.start)} – {formatHour(s.end)}
          </button>
        );
      })}
    </div>
  );
}

export default function VenuePricingPage({
  pricingData,
  trigger,
  open: openProp,
  onOpenChange,
  onProceed,
  proceedLoading = false,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const { mode, priceForDate, slotEntry } = usePricingLookup(
    pricingData?.pricing,
  );

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const latestDate = useMemo(() => addDays(today, 30), [today]);
  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotPrice, setSelectedSlotPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const canGoBack =
    month.getFullYear() > today.getFullYear() ||
    (month.getFullYear() === today.getFullYear() &&
      month.getMonth() > today.getMonth());

  const canGoForward =
    month.getFullYear() < latestDate.getFullYear() ||
    (month.getFullYear() === latestDate.getFullYear() &&
      month.getMonth() < latestDate.getMonth());

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSelectedSlotPrice(null);
  };

  const canProceed =
    mode === "slot" ? !!(selectedDate && selectedSlot) : !!selectedDate;

  const selectedSlotPricing = selectedDate ? slotEntry(selectedDate) : null;

  const finalPrice =
    mode === "slot"
      ? selectedSlotPrice
      : selectedDate
        ? priceForDate(selectedDate)
        : null;
  const totalPrice = finalPrice != null ? finalPrice * quantity : null;

  const handleProceed = () => {
    if (!canProceed) return;
    onProceed?.({
      date: selectedDate,
      slot: selectedSlot,
      price: totalPrice,
      quantity,
      bookingType: pricingData?.bookingType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        showCloseButton={false}
        className={`gap-0 rounded-2xl p-0 ${
          mode === "slot" ? "sm:max-w-4xl" : "sm:max-w-sm"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-neutral-900">
            When would you like to visit?
          </DialogTitle>
          <DialogClose className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div
          className={`grid gap-6 px-6 py-6 ${
            mode === "slot"
              ? "sm:grid-cols-[minmax(320px,1fr)_minmax(0,1.25fr)] sm:divide-x sm:divide-neutral-100"
              : ""
          }`}
        >
          <div className={mode === "slot" ? "min-w-0 sm:pr-6" : ""}>
            <Calendar
              month={month}
              onMonthChange={setMonth}
              selected={selectedDate}
              onSelect={handleSelectDate}
              priceForDate={priceForDate}
              canGoBack={canGoBack}
              canGoForward={canGoForward}
              earliestDate={today}
              latestDate={latestDate}
            />
          </div>

          {mode === "slot" && (
            <div className="sm:pl-6">
              <SlotPanel
                openingTime={selectedSlotPricing?.openingTime}
                closingTime={selectedSlotPricing?.closingTime}
                date={selectedDate}
                price={selectedDate ? priceForDate(selectedDate) : null}
                selectedSlot={selectedSlot}
                onSelect={(key, price) => {
                  setSelectedSlot(key);
                  setSelectedSlotPrice(price);
                }}
              />
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 px-6 py-4">
          {finalPrice != null && (
            <>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  {selectedDate?.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  {selectedSlot &&
                    ` · ${formatHour(Number(selectedSlot.split("-")[0]))} – ${formatHour(
                      Number(selectedSlot.split("-")[1]),
                    )}`}
                </span>
                <span className="font-semibold text-neutral-900">
                  {inr(totalPrice)}
                </span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">
                  Quantity
                </span>
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity === 1}
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
          {finalPrice == null && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                Quantity
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 p-1">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled
                  className="grid h-8 w-8 place-items-center rounded-lg text-neutral-300"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((value) => value + 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <Button
            disabled={!canProceed || proceedLoading}
            onClick={handleProceed}
            className="h-12 w-full rounded-xl bg-neutral-900 text-[15px] hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400"
          >
            {proceedLoading ? "Creating booking..." : "Proceed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
