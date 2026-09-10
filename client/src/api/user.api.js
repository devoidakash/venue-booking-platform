import axiosInstance from "@/lib/axios.instance";

export async function getMe() {
  const res = await axiosInstance.get("/auth/me");
  return res.data.user;
}

export async function requestOtp(email) {
  return await axiosInstance.post("/auth/otp/request", { email });
}

export async function verifyOtp({ email, otp }) {
  return await axiosInstance.post("/auth/otp/verify", { email, otp });
}

export async function getApplicationStatus() {
  const res = await axiosInstance.get("/application/status");
  return res.data;
}

export async function submitApplication(payload) {
  const res = await axiosInstance.post("/application", payload);
  return res.data;
}
