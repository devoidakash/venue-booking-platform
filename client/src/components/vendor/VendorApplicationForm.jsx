import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useRevalidator } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  TriangleAlert,
  UploadCloud,
  X,
  FileText,
  Loader2,
  ChevronDown,
} from "lucide-react";
import * as z from "zod";

import { submitApplication } from "@/api/user.api";

const kycSchema = z.object({
  panName: z
    .string()
    .min(2, "Full name (as on PAN) is required")
    .transform((val) => val.toUpperCase()),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit phone number"),
  panNumber: z
    .string()
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
      "Invalid PAN format (e.g. ABCDE1234F)",
    ),
  address: z.string().min(5, "Full street address is required"),
  state: z.string().min(1, "Please select a state"),
  district: z.string().min(2, "District is required"),
  pincode: z.string().regex(/^\d{6}$/, "Must be exactly 6 digits"),
});

const STATES = [
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

function Field({ label, error, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 font-medium tracking-tight">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function VendorApplicationForm() {
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(kycSchema),
  });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5MB limit");
      handleRemoveFile();
      return;
    }

    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setFileError("Only JPG or PNG images are allowed");
      handleRemoveFile();
      return;
    }

    setFileError("");
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const handleRemoveFile = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data) => {
    if (!file) {
      setFileError("PAN Document is required");
      return;
    }

    setSubmitError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("panName", data.panName);
    formData.append("phone", data.phone);
    formData.append("panNumber", data.panNumber.toUpperCase());
    formData.append("address", data.address);
    formData.append("state", data.state);
    formData.append("district", data.district);
    formData.append("pincode", data.pincode);
    formData.append("panDocument", file);

    try {
      await submitApplication(formData);
      revalidator.revalidate();
      navigate(".", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        return;
      }
      setSubmitError(
        err?.response?.data?.message ||
          "Something went wrong during submission",
      );
    } finally {
      setLoading(false);
    }
  };

  const inp = (err) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 bg-stone-50/50 outline-none transition-all duration-150 ${
      err
        ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-stone-200 hover:border-stone-300 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
    }`;

  return (
    <div className="fixed inset-0 bg-[#FFFBF7] flex overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between w-180 shrink-0 bg-linear-to-b from-[#fff2db] to-[#ffe8c4] text-[#2b241a] p-10 relative overflow-hidden border-r border-[#ecd8ba]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20px 20px, rgba(255,175,82,.22) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#ffaf52] rounded-full opacity-25 translate-x-20 translate-y-20" />
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#ff8f3a] rounded-full opacity-20 -translate-x-10 -translate-y-10" />

        <div className="relative z-10">
          <img src="/logo.svg" alt="Venuez logo" className="mb-8 h-10 w-auto" />
          <span className="inline-flex rounded-full border border-[#f0c992] bg-[#fff7e8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6a5435]">
            Partner onboarding
          </span>
          <h1 className="mt-4 text-4xl font-black uppercase italic leading-tight tracking-tight text-[#2b241a]">
            Partner
            <br />
            with Us
          </h1>
          <p className="text-sm text-[#7b6d59] mt-3 leading-relaxed max-w-sm">
            Join our growing network of verified venues and unlock a new stream
            of customers.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {[
            {
              num: "01",
              title: "Submit Application",
              desc: "Fill your business details",
            },
            {
              num: "02",
              title: "Verification",
              desc: "We review within 48 hrs",
            },
            { num: "03", title: "Go Live", desc: "Start receiving bookings" },
          ].map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-4 rounded-xl border border-[#f0dcc0] bg-white/60 px-3 py-2"
            >
              <span className="text-[#ff8f3a] font-black text-xs mt-0.5 shrink-0">
                {step.num}
              </span>
              <div>
                <p className="text-xs font-bold text-[#2b241a]">{step.title}</p>
                <p className="text-[11px] text-[#7b6d59]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-[10px] text-[#8b7a62] uppercase tracking-widest">
          © 2025 Venuz · Built for local venues
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto px-4 py-8 sm:px-10 lg:px-12 flex justify-center items-start">
          <div className="w-full max-w-4xl rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-9">
            <header className="mb-6 border-b border-stone-100 pb-5">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-100/70 border border-amber-200/60 px-3 py-1 rounded-full mb-3">
                Partner Onboarding
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900">
                Vendor KYC Verification
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
                Fill in your details and upload your PAN document to continue.
              </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={loading} className="space-y-4">
                {submitError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2.5 font-medium">
                    <TriangleAlert className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{submitError}</span>
                  </div>
                )}

                <Field label="Full Name (as on PAN)" error={errors.panName}>
                  <input
                    {...register("panName", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      },
                    })}
                    placeholder="ENTER FULL NAME"
                    className={`${inp(errors.panName)} uppercase`}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field label="Phone Number" error={errors.phone}>
                    <input
                      {...register("phone")}
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      className={inp(errors.phone)}
                    />
                  </Field>
                  <Field label="PAN Number" error={errors.panNumber}>
                    <input
                      {...register("panNumber", {
                        onChange: (e) => {
                          e.target.value = e.target.value.toUpperCase();
                        },
                      })}
                      maxLength={10}
                      placeholder="ABCDE1234F"
                      className={`${inp(errors.panNumber)} uppercase font-mono tracking-wider`}
                    />
                  </Field>
                </div>

                <Field label="Street Address" error={errors.address}>
                  <input
                    {...register("address")}
                    placeholder="Building, Street name, Area"
                    className={inp(errors.address)}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <Field label="State" error={errors.state}>
                    <div className="relative">
                      <select
                        {...register("state")}
                        className={`${inp(errors.state)} appearance-none pr-8 cursor-pointer`}
                      >
                        <option value="">Select State</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="District" error={errors.district}>
                    <input
                      {...register("district")}
                      placeholder="District"
                      className={inp(errors.district)}
                    />
                  </Field>
                  <Field label="Pincode" error={errors.pincode}>
                    <input
                      {...register("pincode")}
                      maxLength={6}
                      placeholder="452001"
                      className={inp(errors.pincode)}
                    />
                  </Field>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                    PAN Document
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFile}
                    accept="image/jpeg,image/png"
                  />

                  {!file ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-14 border rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        fileError
                          ? "border-red-400 bg-red-50/50"
                          : "border-dashed border-stone-300 bg-stone-50/50 hover:bg-stone-100/60 hover:border-amber-400"
                      }`}
                    >
                      <UploadCloud className="w-4 h-4 text-stone-400" />
                      <span className="text-xs text-stone-600 font-medium">
                        Upload JPG or PNG (max 5MB)
                      </span>
                    </div>
                  ) : (
                    <div className="h-14 border border-stone-200 rounded-xl bg-stone-50/80 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 truncate">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="PAN Preview"
                            className="w-9 h-9 object-cover rounded-md border border-stone-200 shrink-0"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-stone-700 truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
                        aria-label="Remove uploaded file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {fileError && (
                    <p className="text-[11px] text-red-500 font-medium mt-1">
                      {fileError}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-linear-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 active:scale-[0.99] text-white font-semibold text-xs tracking-wide shadow-xs rounded-xl uppercase transition-all flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting Application...
                      </>
                    ) : (
                      "Submit Verification"
                    )}
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
