import { redirect } from "react-router-dom";
import { getApplicationStatus, getMe } from "@/api/user.api";

export async function vendorApplyLoader({ request }) {
  let user;
  try {
    user = await getMe();
  } catch {
    const redirectTo = new URL(request.url).pathname;
    return redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (user.role === "vendor") {
    return redirect("/vendor/dashboard");
  }

  const { applicationStatus, rejectionReason } = await getApplicationStatus();
  return { user, applicationStatus, rejectionReason };
}
