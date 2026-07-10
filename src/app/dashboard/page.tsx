import { redirect } from "next/navigation";

// The /dashboard route is now deprecated.
// All authenticated users are redirected to the Admin Panel.
export default function DashboardRedirect() {
  redirect("/admin");
}
