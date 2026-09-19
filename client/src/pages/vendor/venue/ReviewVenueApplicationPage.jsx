import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Pencil,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getVenuesApplication, submitVenueApplication } from "@/api/vendor.api";

const STATES = [
  "Andhra Pradesh",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Karnataka",
];

const CATEGORIES = [
  ["waterpark", "Water Park"],
  ["amusement_park", "Amusement Park"],
  ["playzone", "Play Zone"],
  ["racing_zone", "Racing Zone"],
  ["gaming_zone", "Gaming Zone"],
];
const EMPTY_IMAGES = [];

function getStatusClass(status) {
  if (status === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function Section({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1.5 text-sm font-semibold text-slate-800">
        {children || "-"}
      </div>
    </div>
  );
}

function UploadTile({ title, file, onChange, multiple = false, children }) {
  return (
    <label className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30 sm:w-56">
      {children || <Upload className="h-7 w-7 text-slate-400" />}
      <span className="relative z-10 mt-2 rounded-md bg-white/85 px-2 py-1 text-xs font-semibold text-slate-700">
        {file ? `Change ${title}` : `Select ${title}`}
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png"
        multiple={multiple}
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}

async function urlToFile(url, filename) {
  if (!url) return null;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${filename}`);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

function ResubmitForm({ application, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    name: application.name ?? "",
    venueDetails: application.venueDetails ?? "",
    category: application.category ?? "",
    address: application.address ?? "",
    district: application.district ?? "",
    state: application.state ?? "",
    pincode: application.pincode ?? "",
    latitude: application.latitude ?? "",
    longitude: application.longitude ?? "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [proofDocument, setProofDocument] = useState(null);
  const [venueImages, setVenueImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const existingVenueImages = application.images ?? EMPTY_IMAGES;

  useEffect(() => {
    let mounted = true;

    async function hydrateExistingMedia() {
      try {
        const [cover, proof, ...gallery] = await Promise.all([
          urlToFile(application.coverImageUrl, "existing-cover.jpg"),
          urlToFile(application.proofDocumentUrl, "existing-proof.jpg"),
          ...existingVenueImages.map((url, index) =>
            urlToFile(url, `existing-venue-${index + 1}.jpg`),
          ),
        ]);

        if (!mounted) return;
        if (cover) setCoverImage(cover);
        if (proof) setProofDocument(proof);
        if (
          gallery.length === existingVenueImages.length &&
          gallery.every(Boolean)
        ) {
          setVenueImages(gallery);
        }
      } catch {
        if (mounted) {
          setError(
            "Existing files could not be prepared. Please select them again before resubmitting.",
          );
        }
      } finally {
        if (mounted) setLoadingMedia(false);
      }
    }

    hydrateExistingMedia();
    return () => {
      mounted = false;
    };
  }, [application, existingVenueImages]);

  function updateField(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function updateImages(event) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type),
    );

    if (venueImages.length + files.length > 5) {
      setError("You can upload a maximum of 5 venue images.");
      event.target.value = "";
      return;
    }

    setVenueImages((current) => [...current, ...files]);
    setError("");
    event.target.value = "";
  }

  async function submit(event) {
    event.preventDefault();
    if (venueImages.length !== 5 || !coverImage || !proofDocument) {
      setError(
        "Select exactly 5 venue images, 1 cover image, and 1 proof document.",
      );
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries({
        ...formData,
        venueGroupId: application.venueGroupId,
      }).forEach(([key, value]) => payload.append(key, value));
      venueImages.forEach((file) => payload.append("venueImages", file));
      payload.append("coverImage", coverImage);
      payload.append("proofDocument", proofDocument);
      await submitVenueApplication(payload);
      onSuccess();
    } catch (submissionError) {
      setError(
        submissionError?.response?.data?.message ||
          "Could not resubmit application.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white";

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Edit Venue Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[
            ["name", "Venue Name"],
            ["district", "District"],
            ["address", "Address"],
            ["pincode", "Pincode"],
            ["latitude", "Latitude"],
            ["longitude", "Longitude"],
          ].map(([name, label]) => (
            <label
              key={name}
              className={`text-xs font-semibold uppercase tracking-wider text-slate-500 ${name === "address" ? "sm:col-span-2" : ""}`}
            >
              {label}
              <input
                name={name}
                value={formData[name]}
                onChange={updateField}
                required
                className={inputClass}
              />
            </label>
          ))}
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Category
            <select
              name="category"
              value={formData.category}
              onChange={updateField}
              required
              className={inputClass}
            >
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            State
            <select
              name="state"
              value={formData.state}
              onChange={updateField}
              required
              className={inputClass}
            >
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:col-span-2">
            Description & Amenities
            <textarea
              name="venueDetails"
              value={formData.venueDetails}
              onChange={updateField}
              rows={4}
              required
              className={inputClass}
            />
          </label>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Cover Image">
          <UploadTile
            title="Cover Image"
            file={coverImage || application.coverImageUrl}
            onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)}
          >
            {coverImage ? (
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Cover preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : application.coverImageUrl ? (
              <img
                src={application.coverImageUrl}
                alt="Current cover"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-7 w-7 text-slate-400" />
            )}
          </UploadTile>
        </Section>
        <Section title="Proof of Ownership">
          <UploadTile
            title="Proof Document"
            file={proofDocument || application.proofDocumentUrl}
            onChange={(event) =>
              setProofDocument(event.target.files?.[0] ?? null)
            }
          >
            {proofDocument ? (
              <img
                src={URL.createObjectURL(proofDocument)}
                alt="Proof preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : application.proofDocumentUrl ? (
              <img
                src={application.proofDocumentUrl}
                alt="Current proof document"
                className="absolute inset-0 h-full w-full object-contain"
              />
            ) : (
              <FileText className="h-7 w-7 text-slate-400" />
            )}
          </UploadTile>
        </Section>
      </div>

      <Section title="Venue Gallery Images (5 Required)">
        <div className="mb-4 flex items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <span>
            Existing images are shown for reference. Select 5 new images to
            resubmit.
          </span>
          {venueImages.length} of 5 selected
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {venueImages.length === 0 &&
            existingVenueImages.map((url, index) => (
              <div
                key={`existing-${url}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={url}
                  alt={`Current venue gallery ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                  Current
                </span>
              </div>
            ))}
          {venueImages.map((file, index) => (
            <div
              key={file.name + file.lastModified}
              className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Venue gallery ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setVenueImages((current) =>
                    current.filter((_, fileIndex) => fileIndex !== index),
                  )
                }
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                aria-label={`Remove gallery image ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {venueImages.length < 5 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30">
              <Upload className="h-5 w-5 text-slate-400" />
              <span className="mt-2 text-xs font-medium text-slate-600">
                Upload Image
              </span>
              <span className="text-[10px] text-slate-400">JPEG, PNG</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={updateImages}
                className="hidden"
              />
            </label>
          )}
        </div>
      </Section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting || loadingMedia}>
          {loadingMedia
            ? "Preparing files..."
            : submitting
              ? "Resubmitting..."
              : "Resubmit Application"}
        </Button>
      </div>
    </form>
  );
}

function ReadOnlyApplication({ application, onEdit }) {
  const statusClass = getStatusClass(application.status);
  return (
    <div className="space-y-6">
      <Section
        title="Application Summary"
        action={
          application.status === "rejected" ? (
            <Button onClick={onEdit} className="gap-2 rounded-xl">
              <Pencil className="h-4 w-4" />
              Edit & Resubmit
            </Button>
          ) : null
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {application.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Application ID: {application.id}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass}`}
          >
            {application.status}
          </span>
        </div>
        {application.rejectionReason && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <strong>Reviewer feedback:</strong> {application.rejectionReason}
          </div>
        )}
      </Section>
      <Section title="Venue Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name">{application.name}</Field>
          <Field label="Category">{application.category}</Field>
          <Field label="Submitted">{formatDate(application.submittedAt)}</Field>
          <Field label="Address">{application.address}</Field>
          <Field label="District">{application.district}</Field>
          <Field label="State">{application.state}</Field>
          <Field label="Pincode">{application.pincode}</Field>
          <Field label="Latitude">{application.latitude}</Field>
          <Field label="Longitude">{application.longitude}</Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Description & Amenities">
              {application.venueDetails}
            </Field>
          </div>
        </div>
      </Section>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Section title="Cover Image">
          <img
            src={application.coverImageUrl}
            alt={`${application.name} cover`}
            className="h-80 w-full rounded-xl border border-slate-200 bg-slate-50 object-cover sm:h-28rem"
          />
        </Section>
        <Section title="Proof of Ownership">
          <img
            src={application.proofDocumentUrl}
            alt="Proof of ownership"
            className="h-80 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain sm:h-28rem"
          />
        </Section>
      </div>
      <Section title={`Venue Photos (${application.images?.length ?? 0})`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(application.images ?? []).map((url, index) => (
            <img
              key={url}
              src={url}
              alt={`Venue ${index + 1}`}
              className="aspect-4/3 w-full rounded-xl border border-slate-200 object-cover"
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

export default function ReviewVenueApplicationPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getVenuesApplication(applicationId)
      .then((data) => {
        if (mounted) setApplication(data);
      })
      .catch((err) => {
        if (mounted)
          setError(
            err?.response?.data?.message || "Could not load application.",
          );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [applicationId]);

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (error)
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  if (!application) return null;

  return (
    <div className="w-full space-y-6 pb-12">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="w-fit gap-2 px-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Venues
      </Button>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Venue Application
            </h1>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusClass(application.status)}`}
            >
              {application.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Review your submitted venue information and verification files.
          </p>
        </div>
      </div>
      {editing && application.status === "rejected" ? (
        <ResubmitForm
          application={application}
          onCancel={() => setEditing(false)}
          onSuccess={() => navigate("/vendor/venues")}
        />
      ) : (
        <ReadOnlyApplication
          application={application}
          onEdit={() => setEditing(true)}
        />
      )}
    </div>
  );
}
