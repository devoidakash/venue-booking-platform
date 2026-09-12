import axiosInstance from "@/lib/axios.instance";

export async function getVendorProfile() {
  return axiosInstance.get("/vendor/profile");
}

export async function getVendorVenues() {
  return axiosInstance.get("/vendor/venues");
}

export async function submitVenueApplication(payload) {
  return axiosInstance.post("/vendor/venue/application", payload);
}
