import axiosInstance from "@/lib/axios.instance";

export async function getMe() {
  return axiosInstance.get("/auth/me");
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
