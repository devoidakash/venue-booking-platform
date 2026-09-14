import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  MapPin,
  Clock3,
  ImageIcon,
  AlertCircle,
  X,
  Plus,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getVenueDetails,
  uploadVenueCover,
  uploadVenueImages,
  updateVenueDescription,
  updateVenueHours,
  updateVenuePricing,
  updateVenueStatus,
} from "@/api/vendor.api";

function displayValue(value) {
  return value ?? "Not provided";
}

function formatTime(value) {
  if (!value) return "Not provided";
  const [h] = value.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = ((hour + 11) % 12) + 1;
  return `${hour12} ${suffix}`;
}

function normalizeTime(value) {
  return value ? value.slice(0, 5) : "";
}

function getStatusClass(status) {
  if (status === "live") return "bg-emerald-50 text-emerald-700";
  if (status === "draft") return "bg-amber-50 text-amber-700";
  if (status === "suspended") return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function withCacheBust(url) {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_cb=${Date.now()}`;
}

function defaultPricingRows(bookingType) {
  return [
    {
      day_type: "weekday",
      duration_minutes: bookingType === "time_slot" ? 60 : null,
      price: "",
    },
    {
      day_type: "weekend",
      duration_minutes: bookingType === "time_slot" ? 60 : null,
      price: "",
    },
  ];
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
      className="gap-1.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
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
  const coverInputRef = useRef(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successSection, setSuccessSection] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [removedGalleryIndexes, setRemovedGalleryIndexes] = useState([]);
  const [galleryError, setGalleryError] = useState("");
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [gallerySaving, setGallerySaving] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [coverSaving, setCoverSaving] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [descriptionEditing, setDescriptionEditing] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState("");
  const [descriptionSaving, setDescriptionSaving] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [hoursEditing, setHoursEditing] = useState(false);
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [hoursSaving, setHoursSaving] = useState(false);
  const [hoursError, setHoursError] = useState("");
  const [pricingBookingType, setPricingBookingType] = useState("whole_day");
  const [pricingRows, setPricingRows] = useState([]);
  const [pricingEditing, setPricingEditing] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingError, setPricingError] = useState("");
  const [statusEditing, setStatusEditing] = useState(false);

  const fetchVenue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getVenueDetails(venueId);
      const venueData = data?.venue;
      setVenue(
        venueData
          ? {
              ...venueData,
              coverImageUrl: withCacheBust(venueData.coverImageUrl),
            }
          : venueData,
      );
      setStatusValue(venueData?.status ?? "draft");
      setDescriptionValue(venueData?.description ?? "");
      setOpeningTime(normalizeTime(venueData?.openingTime));
      setClosingTime(normalizeTime(venueData?.closingTime));
      const bookingType = venueData?.bookingType ?? "whole_day";
      setPricingBookingType(bookingType);
      setPricingRows(
        venueData?.pricing?.length
          ? venueData.pricing.map((item) => ({
              day_type: item.day_type,
              duration_minutes: bookingType === "time_slot" ? 60 : null,
              price: item.price ?? "",
            }))
          : defaultPricingRows(bookingType),
      );
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

  function getGalleryImageId(url) {
    return url?.match(/venue_image-([0-9a-f-]{36})/i)?.[1] ?? null;
  }

  async function saveGallery() {
    const deleteIds = removedGalleryIndexes.map((index) =>
      getGalleryImageId(venue?.imageUrls?.[index]),
    );

    if (deleteIds.some((id) => !id)) {
      setGalleryError("Gallery image IDs are unavailable for removal.");
      return;
    }

    if (!galleryFiles.length && !deleteIds.length) {
      setIsEditingGallery(false);
      return;
    }

    setGalleryError("");
    setSuccessMessage("");
    setGallerySaving(true);
    try {
      const response = await uploadVenueImages(
        venueId,
        galleryFiles,
        deleteIds,
      );
      setSuccessMessage(
        response?.message || "Gallery images updated successfully.",
      );
      setSuccessSection("gallery");
      setGalleryFiles([]);
      setRemovedGalleryIndexes([]);
      setIsEditingGallery(false);
      await fetchVenue();
    } catch (err) {
      setGalleryError(
        err?.response?.data?.message || "Could not update gallery images.",
      );
    } finally {
      setGallerySaving(false);
    }
  }

  async function handleCoverFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCoverSaving(true);
    setCoverError("");
    setSuccessMessage("");
    try {
      const response = await uploadVenueCover(venueId, file);
      setSuccessMessage(
        response?.message || "Cover image updated successfully.",
      );
      setSuccessSection("cover");
      await fetchVenue();
    } catch (err) {
      setCoverError(
        err?.response?.data?.message || "Could not update cover image.",
      );
    } finally {
      setCoverSaving(false);
    }
  }

  async function saveDescription() {
    setDescriptionSaving(true);
    setDescriptionError("");
    setSuccessMessage("");
    try {
      const response = await updateVenueDescription(venueId, descriptionValue);
      setSuccessMessage(
        response?.message || "Description updated successfully.",
      );
      setSuccessSection("description");
      setDescriptionEditing(false);
      setVenue((current) =>
        current ? { ...current, description: descriptionValue } : current,
      );
    } catch (err) {
      setDescriptionError(
        err?.response?.data?.message || "Could not update description.",
      );
    } finally {
      setDescriptionSaving(false);
    }
  }

  async function saveHours() {
    setHoursSaving(true);
    setHoursError("");
    setSuccessMessage("");
    try {
      const response = await updateVenueHours(venueId, {
        opening_time: normalizeTime(openingTime),
        closing_time: normalizeTime(closingTime),
      });
      setSuccessMessage(
        response?.message || "Operating hours updated successfully.",
      );
      setSuccessSection("hours");
      setHoursEditing(false);
      setVenue((current) =>
        current ? { ...current, openingTime, closingTime } : current,
      );
    } catch (err) {
      setHoursError(
        err?.response?.data?.message || "Could not update operating hours.",
      );
    } finally {
      setHoursSaving(false);
    }
  }

  async function saveStatus() {
    setStatusSaving(true);
    setStatusError("");
    setSuccessMessage("");

    try {
      const response = await updateVenueStatus(venueId, statusValue);
      setSuccessMessage(
        response?.message || "Venue status updated successfully.",
      );
      setSuccessSection("status");
      setVenue((current) =>
        current ? { ...current, status: statusValue } : current,
      );
      setStatusEditing(false);
    } catch (err) {
      setStatusError(
        err?.response?.data?.message || "Could not update venue status.",
      );
    } finally {
      setStatusSaving(false);
    }
  }

  function changePricingBookingType(value) {
    setPricingBookingType(value);
    setPricingRows((current) => {
      const rows = current.length ? current : defaultPricingRows(value);
      return rows.map((row) => ({
        ...row,
        duration_minutes: value === "time_slot" ? 60 : null,
      }));
    });
  }

  function updatePricingRow(index, field, value) {
    setPricingRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  async function savePricing() {
    const pricing = pricingRows.map((row) => ({
      day_type: row.day_type,
      price: Number(row.price),
      ...(pricingBookingType === "time_slot" ? { duration_minutes: 60 } : {}),
    }));

    if (
      pricing.some(
        (row) =>
          !Number.isFinite(row.price) ||
          row.price <= 0 ||
          (pricingBookingType === "time_slot" && row.duration_minutes !== 60),
      )
    ) {
      setPricingError("Enter a valid positive price and duration.");
      return;
    }

    setPricingSaving(true);
    setPricingError("");
    setSuccessMessage("");
    try {
      const response = await updateVenuePricing(venueId, {
        bookingType: pricingBookingType,
        pricing,
      });
      setSuccessMessage(
        response?.message || "Venue pricing updated successfully.",
      );
      setSuccessSection("pricing");
      setPricingEditing(false);
      setVenue((current) =>
        current
          ? { ...current, bookingType: pricingBookingType, pricing }
          : current,
      );
    } catch (err) {
      setPricingError(
        err?.response?.data?.message || "Could not update pricing.",
      );
    } finally {
      setPricingSaving(false);
    }
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

      <header className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Venue Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Venue Management
          </h1>
          {venue?.name && (
            <p className="mt-2 text-sm font-medium text-slate-500">
              Manage details and availability for {venue.name}
            </p>
          )}
        </div>
        {venue && (
          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold uppercase ${getStatusClass(venue.status)}`}
          >
            {displayValue(venue.status)}
          </span>
        )}
      </header>

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
                        void saveGallery();
                      } else {
                        setIsEditingGallery(true);
                      }
                    }}
                    disabled={gallerySaving}
                    className={`gap-1.5 rounded-xl ${
                      isEditingGallery
                        ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    }`}
                  >
                    {isEditingGallery ? (
                      <>
                        <Save className="h-4 w-4" />
                        {gallerySaving ? "Saving..." : "Save"}
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
              {successSection === "gallery" && successMessage && (
                <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {successMessage}
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
              action={<EditButton disabled />}
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

            <div className="order-2 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              <SectionCard
                title="Cover Image"
                action={
                  <>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFile}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={coverSaving}
                      className="gap-1.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {coverSaving ? "Uploading..." : "Edit"}
                    </Button>
                  </>
                }
                className="p-4! sm:p-5! lg:col-span-3"
              >
                {venue.coverImageUrl ? (
                  <img
                    src={venue.coverImageUrl}
                    alt={`${venue.name} cover`}
                    className="aspect-4/5 w-full rounded-2xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex aspect-4/5 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                    <p className="text-sm">No cover image available.</p>
                  </div>
                )}
                {coverError && (
                  <p className="mt-3 text-sm font-medium text-rose-600">
                    {coverError}
                  </p>
                )}
                {successSection === "cover" && successMessage && (
                  <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    {successMessage}
                  </p>
                )}
              </SectionCard>

              <div className="space-y-6 lg:col-span-9">
                <SectionCard
                  title="Description"
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (descriptionEditing) {
                          void saveDescription();
                        } else {
                          setDescriptionEditing(true);
                        }
                      }}
                      disabled={descriptionSaving}
                      className={`gap-1.5 rounded-xl ${
                        descriptionEditing
                          ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      }`}
                    >
                      {descriptionEditing ? (
                        <>
                          <Save className="h-4 w-4" />
                          {descriptionSaving ? "Saving..." : "Save"}
                        </>
                      ) : (
                        <>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </>
                      )}
                    </Button>
                  }
                  className="min-h-72 lg:min-h-80"
                >
                  {descriptionEditing ? (
                    <textarea
                      value={descriptionValue}
                      onChange={(event) =>
                        setDescriptionValue(event.target.value)
                      }
                      minLength={10}
                      maxLength={1000}
                      rows={8}
                      className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-slate-600">
                      {displayValue(venue.description)}
                    </p>
                  )}
                  {descriptionError && (
                    <p className="mt-3 text-sm font-medium text-rose-600">
                      {descriptionError}
                    </p>
                  )}
                  {successSection === "description" && successMessage && (
                    <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                      {successMessage}
                    </p>
                  )}
                </SectionCard>

                <SectionCard
                  title="Operating Info"
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (hoursEditing) {
                          void saveHours();
                        } else {
                          setHoursEditing(true);
                        }
                      }}
                      disabled={hoursSaving}
                      className={`gap-1.5 rounded-xl ${
                        hoursEditing
                          ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      }`}
                    >
                      {hoursEditing ? (
                        <>
                          <Save className="h-4 w-4" />
                          {hoursSaving ? "Saving..." : "Save"}
                        </>
                      ) : (
                        <>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </>
                      )}
                    </Button>
                  }
                >
                  <div className="grid grid-cols-1 gap-4">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Clock3 className="h-4 w-4 text-indigo-500" />
                          Opening & Closing Time
                        </p>
                      </div>
                      {hoursEditing ? (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <select
                            value={openingTime.slice(0, 2)}
                            onChange={(event) =>
                              setOpeningTime(`${event.target.value}:00`)
                            }
                            className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          >
                            {Array.from({ length: 24 }, (_, hour) => {
                              const value = String(hour).padStart(2, "0");
                              return (
                                <option key={value} value={value}>
                                  {formatTime(`${value}:00`)}
                                </option>
                              );
                            })}
                          </select>
                          <select
                            value={closingTime.slice(0, 2)}
                            onChange={(event) =>
                              setClosingTime(`${event.target.value}:00`)
                            }
                            className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          >
                            {Array.from({ length: 24 }, (_, hour) => {
                              const value = String(hour).padStart(2, "0");
                              return (
                                <option key={value} value={value}>
                                  {formatTime(`${value}:00`)}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-slate-900">
                          <span>{formatTime(venue.openingTime)}</span>
                          <span className="h-px w-4 bg-slate-300" />
                          <span>{formatTime(venue.closingTime)}</span>
                        </div>
                      )}
                      {hoursError && (
                        <p className="mt-3 text-sm font-medium text-rose-600">
                          {hoursError}
                        </p>
                      )}
                      {successSection === "hours" && successMessage && (
                        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                          {successMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>

            <div className="order-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SectionCard
                title="Pricing Info"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (pricingEditing) {
                        void savePricing();
                      } else {
                        setPricingEditing(true);
                      }
                    }}
                    disabled={pricingSaving}
                    className={`gap-1.5 rounded-xl ${
                      pricingEditing
                        ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    }`}
                  >
                    {pricingEditing ? (
                      <>
                        <Save className="h-4 w-4" />
                        {pricingSaving ? "Saving..." : "Save"}
                      </>
                    ) : (
                      <>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </>
                    )}
                  </Button>
                }
              >
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <select
                    value={pricingBookingType}
                    onChange={(event) =>
                      changePricingBookingType(event.target.value)
                    }
                    disabled={!pricingEditing || pricingSaving}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="whole_day">Whole Day</option>
                    <option value="time_slot">Time Slot</option>
                  </select>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Day Type</th>
                        {pricingBookingType === "time_slot" && (
                          <th className="px-5 py-3 font-semibold">Duration</th>
                        )}
                        <th className="px-5 py-3 font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pricingRows.map((item, index) => (
                        <tr key={item.day_type}>
                          <td className="px-5 py-4 font-medium capitalize text-slate-700">
                            {item.day_type}
                          </td>
                          {pricingBookingType === "time_slot" && (
                            <td className="px-5 py-4">60 min</td>
                          )}
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {pricingEditing ? (
                              <input
                                type="number"
                                min="1"
                                value={item.price}
                                onChange={(event) =>
                                  updatePricingRow(
                                    index,
                                    "price",
                                    event.target.value,
                                  )
                                }
                                className="h-9 w-32 rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-indigo-400"
                              />
                            ) : (
                              item.price
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pricingError && (
                  <p className="mt-3 text-sm font-medium text-rose-600">
                    {pricingError}
                  </p>
                )}
                {successSection === "pricing" && successMessage && (
                  <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    {successMessage}
                  </p>
                )}
              </SectionCard>

              <SectionCard
                title="Venue Status"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (statusEditing) {
                        void saveStatus();
                      } else {
                        setStatusEditing(true);
                      }
                    }}
                    disabled={statusSaving}
                    className={`gap-1.5 rounded-xl ${
                      statusEditing
                        ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    }`}
                  >
                    {statusEditing ? (
                      <>
                        <Save className="h-4 w-4" />
                        {statusSaving ? "Saving..." : "Save"}
                      </>
                    ) : (
                      <>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </>
                    )}
                  </Button>
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <label className="flex w-full max-w-sm flex-col gap-2 text-sm font-semibold text-slate-700">
                    Status
                    <select
                      value={statusValue}
                      onChange={(event) => setStatusValue(event.target.value)}
                      disabled={!statusEditing || statusSaving}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="draft">Draft</option>
                      <option value="live">Live</option>
                    </select>
                  </label>
                </div>
                {statusError && (
                  <p className="mt-3 text-sm font-medium text-rose-600">
                    {statusError}
                  </p>
                )}
                {successSection === "status" && successMessage && (
                  <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    {successMessage}
                  </p>
                )}
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
