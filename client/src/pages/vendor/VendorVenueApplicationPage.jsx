import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  FileText,
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Waves,
  Gamepad2,
  ShieldCheck,
  Building,
  Flag,
  Car,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitVenueApplication } from "@/api/vendor.api";

const ALLOWED_STATES = [
  "Andhra Pradesh",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
];

const CATEGORIES = [
  {
    value: "waterpark",
    label: "Water Park",
    icon: Waves,
  },
  {
    value: "amusement_park",
    label: "Amusement Park",
    icon: Building,
  },

  {
    value: "playzone",
    label: "Play Zone",
    icon: Flag,
  },
  {
    value: "racing_zone",
    label: "Racing Zone",
    icon: Car,
  },
  {
    value: "gaming_zone",
    label: "Gaming Zone",
    icon: Gamepad2,
  },
];

export default function VendorVenueApplicationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    venueDetails: "",
    category: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
  });

  const [venueImages, setVenueImages] = useState([]);
  const [proofDocument, setProofDocument] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVenueImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type),
    );

    if (venueImages.length + validFiles.length > 5) {
      setError("You can upload a maximum of 5 venue images.");
      return;
    }

    setVenueImages((prev) => [...prev, ...validFiles].slice(0, 5));
    setError(null);
  };

  const removeVenueImage = (index) => {
    setVenueImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/jpeg", "image/png"].includes(file.type)) {
      setProofDocument(file);
      setError(null);
    } else {
      setError("Proof document must be a valid JPEG or PNG file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (venueImages.length !== 5) {
      setError("Please upload exactly 5 venue images.");
      return;
    }

    if (!proofDocument) {
      setError("Please attach 1 ownership/operational proof document.");
      return;
    }

    if (!formData.category) {
      setError("Please select a venue category.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      venueImages.forEach((image) => {
        payload.append("venueImages", image);
      });

      payload.append("proofDocument", proofDocument);

      await submitVenueApplication(payload);
      setSuccess(true);
      setTimeout(() => navigate("/vendor/venues"), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to submit application. Please verify your details.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Venue Registration Application
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Provide your property information, geolocation coordinates, and KYC
          proofs for verification.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            Application submitted successfully! Redirecting to venues list...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Property Identity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Basic Venue Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Venue Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Category
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                {CATEGORIES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                    className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                      formData.category === value
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description & Amenities
              </label>
              <textarea
                name="venueDetails"
                rows={3}
                required
                value={formData.venueDetails}
                onChange={handleInputChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address & Geolocation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Location & Geolocation
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                District
              </label>
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleInputChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                State
              </label>
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                <option value="" disabled>
                  Select a state
                </option>
                {ALLOWED_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                pattern="[0-9]{6}"
                required
                value={formData.pincode}
                onChange={handleInputChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Latitude
              </label>
              <input
                type="text"
                name="latitude"
                required
                value={formData.latitude}
                onChange={handleInputChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Longitude
              </label>
              <input
                type="text"
                name="longitude"
                required
                value={formData.longitude}
                onChange={handleInputChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Media Uploads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Venue Gallery Images (5 Required)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {venueImages.length} of 5 selected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {venueImages.map((file, idx) => (
              <div
                key={idx}
                className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeVenueImage(idx)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {venueImages.length < 5 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/20">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="mt-2 text-xs font-medium text-slate-600">
                  Upload Image
                </span>
                <span className="text-[10px] text-slate-400">JPEG, PNG</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleVenueImagesChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Section 4: Operational Document */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Ownership / Registration Proof (1 Required)
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <label className="flex h-36 w-full sm:w-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/20">
              <FileText className="h-7 w-7 text-slate-400" />
              <span className="mt-2 text-xs font-semibold text-slate-700">
                {proofDocument ? "Change Document" : "Select Proof File"}
              </span>
              <span className="text-[10px] text-slate-400">JPEG, PNG</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleProofChange}
                className="hidden"
              />
            </label>

            {proofDocument && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-200">
                  <img
                    src={URL.createObjectURL(proofDocument)}
                    alt="Proof Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="max-w-200px truncate text-xs font-semibold text-slate-800">
                    {proofDocument.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(proofDocument.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProofDocument(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className=" h-12 gap-2 rounded-xl border-rose-200 px-5 font-semibold text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 gap-2 rounded-xl bg-indigo-600 px-6 font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 disabled:translate-y-0"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Submitting Application..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
