import AdminDashboardClient from "./page.client";
import { ENV } from "@/lib/config/env";

export default async function AdminPage() {
  const summary = ENV.MOCK_MODE
    ? { orders: 3, revenue: 12345.5 }
    : { orders: 0, revenue: 0 };
  return <AdminDashboardClient summary={summary} />;
}
