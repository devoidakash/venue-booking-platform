import adminAxiosInstance from "@/lib/adminAxios.instance";

export async function adminLogin(payload) {
  return adminAxiosInstance.post("/admin/auth/login", payload);
}

export async function getAdminMe() {
  return adminAxiosInstance.get("/admin/auth/me");
}

export async function adminLogout() {
  return adminAxiosInstance.post("/admin/auth/logout");
}

export async function getVendorApplicationCount() {
  return adminAxiosInstance.get("/admin/vendor/applications/counts");
}

export async function getVendorApplication(payload) {
  return adminAxiosInstance.get("/admin/vendor/applications", payload);
}

export async function reviewVendorApplication(applicationId, payload) {
  return adminAxiosInstance.patch(
    `/admin/vendor/applications/${applicationId}`,
    payload,
  );
}
