import adminAxiosInstance from "@/lib/adminAxios.instance";

export async function adminLogin(payload) {
  return adminAxiosInstance.post("/admin/auth/login", payload);
}
