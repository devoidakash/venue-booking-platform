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

export async function getVendorApplicationsCount() {
  return adminAxiosInstance.get("/admin/vendor/applications/counts");
}

export async function getVenueApplicationsCount() {
  return adminAxiosInstance.get("/admin/vendor/applications/counts");
}

export async function getVendorApplications(status) {
  return adminAxiosInstance.get(`/admin/vendor/applications?status=${status}`);
}

export async function reviewVendorApplication(applicationId, payload) {
  return adminAxiosInstance.patch(
    `/admin/vendor/applications/${applicationId}`,
    payload,
  );
}
