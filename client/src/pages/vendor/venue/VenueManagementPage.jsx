import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  MapPin,
  Clock3,
  CalendarClock,
  ImageIcon,
  AlertCircle,
  X,
  Plus,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVenueDetails } from "@/api/vendor.api";

function displayValue(value) {
  return value ?? "Not provided";
}

function formatTime(value) {
  if (!value) return "Not provided";
  const [h, m] = value.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = ((hour + 11) % 12) + 1;
  return `${hour12}:${m} ${suffix}`;
}

function formatBookingType(value) {
  if (!value) return "Not provided";
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function SectionCard({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EditButton({ label = "Edit", onClick, disabled = true }) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? "Editing isn't available yet" : undefined}
      className="gap-1.5 rounded-xl text-slate-600"
    >
      <Pencil className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {displayValue(value)}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 py-24 text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm">Loading venue details…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 py-16 text-center">
      <AlertCircle className="h-6 w-6 text-rose-500" />
      <p className="text-sm font-medium text-rose-700">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="rounded-xl border-rose-300 text-rose-700 hover:bg-rose-100"
      >
        Try again
      </Button>
    </div>
  );
}

export default function VenueManagementPage() {
  const { id: venueId } = useParams();
  const navigate = useNavigate();
  const galleryInputRef = useRef(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [removedGalleryIndexes, setRemovedGalleryIndexes] = useState([]);
  const [galleryError, setGalleryError] = useState("");
  const [isEditingGallery, setIsEditingGallery] = useState(false);

  const fetchVenue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getVenueDetails(venueId);
      setVenue(data?.venue);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load venue details.");
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    if (!venueId) return;

    queueMicrotask(() => void fetchVenue());
  }, [fetchVenue, venueId]);

  function handleGalleryFiles(event) {
    const files = Array.from(event.target.files ?? []);
    const existingCount =
      (venue?.imageUrls?.length ?? 0) -
      removedGalleryIndexes.length +
      galleryFiles.length;
    const availableSlots = 10 - existingCount;

    if (files.length > availableSlots) {
      setGalleryError(
        `You can add only ${Math.max(availableSlots, 0)} more image${availableSlots === 1 ? "" : "s"}. Maximum is 10.`,
      );
      event.target.value = "";
      return;
    }

    setGalleryError("");
    setGalleryFiles((current) => [...current, ...files]);
    event.target.value = "";
  }

  function removeGalleryImage(index) {
    setRemovedGalleryIndexes((current) => [...current, index]);
  }

  function removeGalleryFile(index) {
    setGalleryFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("..", { relative: "path" })}
          className="-ml-3 gap-2 text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venues
        </Button>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={fetchVenue} />}

      {!loading && !error && venue && (
        <>
          <div className="flex flex-col gap-6">
            <SectionCard
              title="Gallery"
              className="order-3"
              action={
                <>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFiles}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isEditingGallery) {
                        setIsEditingGallery(false);
                        setGalleryError("");
                      } else {
                        setIsEditingGallery(true);
                      }
                    }}
                    className="gap-1.5 rounded-xl text-slate-600"
                  >
                    {isEditingGallery ? (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4" />
                        Edit Gallery
                      </>
                    )}
                  </Button>
                </>
              }
            >
              {galleryError && (
                <p className="mb-4 text-sm font-medium text-rose-600">
                  {galleryError}
                </p>
              )}
              {venue.imageUrls?.length || galleryFiles.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {venue.imageUrls?.map((url, index) => {
                    if (removedGalleryIndexes.includes(index)) return null;

                    return (
                      <div key={url + index} className="group relative">
                        <img
                          src={url}
                          alt={`${venue.name} photo ${index + 1}`}
                          className="aspect-4/3 w-full rounded-xl border border-slate-200 object-cover"
                        />
                        {isEditingGallery && (
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            aria-label={`Remove photo ${index + 1}`}
                            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-rose-600 shadow-sm transition hover:bg-rose-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {galleryFiles.map((file, index) => (
                    <div
                      key={file.name + file.lastModified}
                      className="group relative"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="aspect-4/3 w-full rounded-xl border border-indigo-200 object-cover"
                      />
                      {isEditingGallery && (
                        <button
                          type="button"
                          onClick={() => removeGalleryFile(index)}
                          aria-label={`Remove new photo ${index + 1}`}
                          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-rose-600 shadow-sm transition hover:bg-rose-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <span className="absolute bottom-2 left-2 rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">
                        New
                      </span>
                    </div>
                  ))}
                  {isEditingGallery &&
                    (venue.imageUrls?.length ?? 0) -
                      removedGalleryIndexes.length +
                      galleryFiles.length <
                      10 && (
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex aspect-4/3 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                        aria-label="Upload new gallery images"
                      >
                        <Plus className="h-8 w-8" />
                      </button>
                    )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
                  <ImageIcon className="h-5 w-5" />
                  <p className="text-sm">No gallery images available.</p>
                  {isEditingGallery && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="mt-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600"
                      aria-label="Upload new gallery images"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              <p className="mt-4 text-xs text-slate-400">
                {(venue.imageUrls?.length ?? 0) -
                  removedGalleryIndexes.length +
                  galleryFiles.length}
                /10 images. Changes are preview-only until connected to the API.
              </p>
            </SectionCard>

            <SectionCard
              title="Basic Venue Details"
              className="order-1"
              action={
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {displayValue(venue.status)}
                  </span>
                  <EditButton disabled />
                </div>
              }
            >
              <div className="mb-6 border-b border-slate-100 pb-5">
                <p className="text-xl font-bold text-slate-900">
                  {displayValue(venue.name)}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  {displayValue(venue.address)}, {displayValue(venue.district)},{" "}
                  {displayValue(venue.state)} - {displayValue(venue.pincode)}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailCard label="Venue Name" value={venue.name} />
                <DetailCard label="Category" value={venue.category} />
                <DetailCard label="Address" value={venue.address} />
                <DetailCard label="District" value={venue.district} />
                <DetailCard label="State" value={venue.state} />
                <DetailCard label="Pincode" value={venue.pincode} />
                <DetailCard label="Latitude" value={venue.latitude} />
                <DetailCard label="Longitude" value={venue.longitude} />
              </div>
            </SectionCard>

            <div className="order-2 grid grid-cols-1 gap-6 lg:grid-cols-10">
              <SectionCard
                title="Cover Image"
                action={<EditButton disabled />}
                className="lg:col-span-3"
              >
                {venue.coverImageUrl ? (
                  <img
                    src={venue.coverImageUrl}
                    alt={`${venue.name} cover`}
                    className="aspect-video w-full rounded-2xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-12 text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                    <p className="text-sm">No cover image available.</p>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Description"
                action={<EditButton disabled />}
                className="lg:col-span-7"
              >
                <p className="text-sm leading-relaxed text-slate-600">
                  {displayValue(venue.description)}
                </p>
              </SectionCard>
            </div>

            <SectionCard title="Operating Info" className="order-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarClock className="h-4 w-4 text-indigo-500" />
                      Booking Type
                    </p>
                    <EditButton disabled />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {formatBookingType(venue.bookingType)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Clock3 className="h-4 w-4 text-indigo-500" />
                      Opening & Closing Time
                    </p>
                    <EditButton disabled />
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-900">
                    <span>{formatTime(venue.openingTime)}</span>
                    <span className="h-px w-4 bg-slate-300" />
                    <span>{formatTime(venue.closingTime)}</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
