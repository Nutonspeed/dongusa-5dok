export type SkirtStyle = "none" | "short" | "long";

export interface FabricLite {
  id: string;
  code?: string;
  name: string;
  price_per_m: number; // THB per meter
  width_cm?: number;   // default 150
}

export interface EstimateInput {
  width_cm: number;
  depth_cm: number;
  height_cm: number;
  seats: number;
  skirt: SkirtStyle;
  piping: boolean;
  extra_cushions: number;
  fabric: FabricLite;
  quantity: number;
}

export interface EstimateBreakdown {
  meters: number;
  fabric_cost: number;
  labor_cost: number;
  options_cost: number;
  total_per_item: number;
  total: number;
}

export function clamp(n:number, min:number, max:number){ return Math.max(min, Math.min(max, n)); }

// คร่าว ๆ: คิดผ้าตามพื้นที่ W*D ของที่นั่ง * seats แปลงเป็นเมตรที่ความกว้างผ้ามาตรฐาน 150cm
// เผื่อเย็บ/หดตัว/รอยต่อ +60% และบวกส่วนเกินจากสเกิร์ต/หมอน/piping
export function estimateMeters(input: Omit<EstimateInput, "fabric" | "quantity">): number {
  const w = clamp(input.width_cm, 30, 400) / 100;   // m
  const d = clamp(input.depth_cm, 30, 300) / 100;   // m
  const h = clamp(input.height_cm, 20, 150) / 100;  // m
  const seats = clamp(input.seats, 1, 10);

  const baseAreaM2 = w * d * seats; // พื้นที่ผิวที่นั่ง
  const fabricWidthM = 1.5;         // สมมุติผ้ากว้าง 150cm
  let meters = (baseAreaM2 / fabricWidthM) * 1.6; // allowance 60%

  // เผื่อหลังพนัก + ที่เท้าแขนอย่างหยาบ
  meters += (w * h * 0.6) / fabricWidthM;
  meters += (d * h * 0.6) / fabricWidthM;

  // สเกิร์ต
  if (input.skirt === "short") meters += 0.5;
  if (input.skirt === "long")  meters += 1.0;

  // หมอนเสริม
  meters += input.extra_cushions * 0.3;

  // piping เพิ่มอีกเล็กน้อย
  if (input.piping) meters += 0.2;

  // กันพลาดขั้นต่ำ
  return Math.max(1.2, Number(meters.toFixed(2)));
}

export function estimatePrice(input: EstimateInput): EstimateBreakdown {
  const meters = estimateMeters(input);
  const fabricPrice = input.fabric.price_per_m;
  const fabric_cost = Number((meters * fabricPrice).toFixed(2));

  // ค่าแรงคร่าว ๆ ต่อชุด
  let labor = 350;
  if (input.skirt === "short") labor += 200;
  if (input.skirt === "long")  labor += 300;
  if (input.piping) labor += 150;
  labor += input.extra_cushions * 80;

  const options_cost = labor - 350;
  const total_per_item = fabric_cost + labor;
  const total = Number((total_per_item * input.quantity).toFixed(2));

  return { meters, fabric_cost, labor_cost: labor, options_cost, total_per_item, total };
}
