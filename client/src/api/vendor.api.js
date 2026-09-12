import axiosInstance from "@/lib/axios.instance";

export async function getVendorProfile() {
  return axiosInstance.get("/vendor/profile");
}
