import axiosInstance from "@/lib/axios.instance";

export async function getMe() {
  return axiosInstance.get("/auth/me", {
    skipAuthRedirect: true,
  });
}

export async function requestOtp(email) {
  return axiosInstance.post("/auth/otp/request", { email });
}

export async function verifyOtp({ email, otp }) {
  return axiosInstance.post("/auth/otp/verify", { email, otp });
}

export async function logout() {
  return axiosInstance.post("/auth/logout");
}

export async function getApplicationStatus() {
  return axiosInstance.get("/application/status");
}

export async function submitApplication(payload) {
  return axiosInstance.post("/application", payload);
}

export async function getVenues(venueId) {
  return axiosInstance.get(`/venues/${venueId}`);
}

export async function getVenuePricing(venueId) {
  return axiosInstance.get(`/venues/${venueId}/pricing`);
}

export async function createBooking(venueId, payload) {
  return axiosInstance.post(`/venues/${venueId}/bookings`, payload);
}

export async function createPaymentOrder(bookingId) {
  return axiosInstance.post(`/venues/bookings/${bookingId}/payment`);
}

export async function verifyPayment(bookingId, payload) {
  return axiosInstance.post(`/bookings/${bookingId}/payment/verify`, payload);
}
