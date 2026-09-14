import axiosInstance from "@/lib/axios.instance";

export async function getVendorProfile() {
  return axiosInstance.get("/vendor/profile");
}

export async function getVendorVenues() {
  return axiosInstance.get("/vendor/venues");
}

export async function submitVenueApplication(payload) {
  return axiosInstance.post("/vendor/venues/application", payload);
}

export async function getVenuesApplicationStatus() {
  return axiosInstance.get("/vendor/venues/applications/status");
}

export async function getVenueDetails(venueId) {
  return axiosInstance.get(`/vendor/venues/${venueId}`);
}
