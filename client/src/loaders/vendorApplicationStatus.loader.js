import { getApplicationStatus } from "@/api/user.api";

export async function vendorApplicationStatusLoader() {
  return getApplicationStatus();
}
