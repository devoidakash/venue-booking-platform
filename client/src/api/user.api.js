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
