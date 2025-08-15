// Server Component: ส่ง data เท่านั้น ห้ามส่ง handler
import CustomSofaCoversClient from "./CustomSofaCoversClient";
import { mockFabrics } from "@/lib/mock-fabrics";

export const metadata = { title: "Custom Sofa Covers" };

export default async function Page() {
  // ถ้าอนาคตเชื่อมฐานจริง: ดึง fabrics ที่นี่แล้วส่งลง client
  const fabrics = mockFabrics; // fallback mock
  return <CustomSofaCoversClient fabrics={fabrics} />;
}
