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

export async function uploadVenueCover(venueId, file) {
  const formData = new FormData();
  formData.append("coverImage", file);

  return axiosInstance.patch(`/vendor/venues/${venueId}/cover`, formData);
}

export async function updateVenueDescription(venueId, description) {
  return axiosInstance.patch(`/vendor/venues/${venueId}/description`, {
    description,
  });
}

export async function uploadVenueImages(venueId, files, deleteIds = []) {
  const formData = new FormData();
  formData.append("deleteIds", JSON.stringify(deleteIds));
  files.forEach((file) => formData.append("venueImages", file));

  return axiosInstance.patch(`/vendor/venues/${venueId}/images`, formData);
}

export async function updateVenueHours(venueId, payload) {
  return axiosInstance.patch(
    `/vendor/venues/${venueId}/operation-hours`,
    payload,
  );
}

export async function updateVenuePricing(venueId, payload) {
  return axiosInstance.patch(`/vendor/venues/${venueId}/pricing`, payload);
}

export async function updateVenueStatus(venueId, status) {
  return axiosInstance.patch(`/vendor/venues/${venueId}/status`, { status });
}
