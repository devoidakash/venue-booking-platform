import { getMe } from "@/api/user.api";
import { redirect } from "react-router-dom";

export async function vendorAuthLoader() {
  try {
    const vendor = await getMe();
    if (vendor.role != "vendor") {
      return redirect("/login");
    }
    return vendor;
  } catch {
    return redirect("/login");
  }
}
