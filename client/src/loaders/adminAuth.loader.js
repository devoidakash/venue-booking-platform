import { redirect } from "react-router-dom";
import { getAdminMe } from "@/api/admin.api";

export async function adminAuthLoader() {
  try {
    const admin = await getAdminMe();
    return { admin };
  } catch {
    return redirect("/admin/login");
  }
}
