"use client";
import { useMemo, useState } from "react";
import { estimatePrice, type SkirtStyle, type FabricLite } from "@/utils/sofa-pricing";

type MockFabric = {
  id: string; code?: string; name: string; price_per_m: number; width_cm?: number;
  colors?: { name: string; hex: string }[];
  images?: { url: string; alt?: string }[];
};

export default function CustomSofaCoversClient({ fabrics }: { fabrics: MockFabric[] }) {
  const [sel, setSel] = useState<MockFabric | null>(fabrics[0] ?? null);
  const [form, setForm] = useState({
    width_cm: 200, depth_cm: 90, height_cm: 80, seats: 3 as number,
    skirt: "none" as SkirtStyle, piping: false, extra_cushions: 0, quantity: 1
  });
  const [customer, setCustomer] = useState({ name:"", email:"", phone:"", notes:"" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ok:boolean; text:string} | null>(null);

  const breakdown = useMemo(()=>{
    if (!sel) return null;
    const lite: FabricLite = { id: sel.id, name: sel.name, price_per_m: sel.price_per_m, width_cm: sel.width_cm };
    return estimatePrice({ ...form, fabric: lite, quantity: 1 });
  }, [sel, form]);

  async function submit() {
    if (!sel) return;
    if (!customer.name) { setMsg({ok:false, text:"กรุณากรอกชื่อ"}); return; }
    setBusy(true); setMsg(null);
    try{
      const res = await fetch("/api/custom-sofa-covers/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          measurements: { ...form },
          fabric: { id: sel.id, code: sel.code, name: sel.name, price_per_m: sel.price_per_m, width_cm: sel.width_cm }
        })
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error||"send fail");
      setMsg({ ok:true, text:"บันทึกคำขอสำเร็จ! เราจะติดต่อกลับพร้อมใบเสนอราคา" });
    }catch(e:any){
      setMsg({ ok:false, text: e?.message || "ส่งไม่สำเร็จ"});
    }finally{ setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">Custom Sofa Covers</h1>
        <p className="text-sm text-gray-600">เลือกผ้า วัดขนาด ประเมินราคาได้ทันที — ส่งคำขอเพื่อให้ทีมงานติดต่อกลับ</p>
      </header>

      {/* เลือกผ้า */}
      <section className="space-y-3">
        <h2 className="text-base font-medium">เลือกผ้า</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {fabrics.map(f => {
            const active = sel?.id === f.id;
            const img = f.images?.[0]?.url;
            return (
              <button key={f.id} type="button" onClick={()=>setSel(f)}
                className={"text-left rounded-xl border p-3 hover:shadow transition " + (active?"ring-2 ring-black":"")}>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  {img ? <img src={img} alt={f.name} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full grid place-items-center text-gray-400 text-xs">No image</div>}
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium">{f.name}</span>
                    <span className="text-xs text-gray-500">{f.code}</span>
                  </div>
                  <div className="text-sm text-gray-600">{f.price_per_m}฿/m</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ขนาด/ออปชัน */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-base font-medium">ขนาดโซฟา</h2>
          <div className="grid grid-cols-3 gap-2">
            <NumberInput label="กว้าง (ซม.)" value={form.width_cm} onChange={(v)=>setForm({...form,width_cm:v})} />
            <NumberInput label="ลึก (ซม.)"  value={form.depth_cm} onChange={(v)=>setForm({...form,depth_cm:v})} />
            <NumberInput label="สูง (ซม.)"  value={form.height_cm} onChange={(v)=>setForm({...form,height_cm:v})} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumberInput label="จำนวนที่นั่ง" value={form.seats} min={1} max={10}
              onChange={(v)=>setForm({...form,seats:Math.max(1,Math.min(10,v))})} />
            <Select label="สเกิร์ต" value={form.skirt} onChange={(v)=>setForm({...form,skirt:v as any})}
              options={[{v:"none",t:"ไม่มี"},{v:"short",t:"สั้น"},{v:"long",t:"ยาว"}]} />
            <Select label="Piping" value={form.piping ? "yes":"no"}
              onChange={(v)=>setForm({...form,piping:v==="yes"})}
              options={[{v:"no",t:"ไม่เอา"},{v:"yes",t:"เอา"}]} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="หมอนเสริม (ใบ)" value={form.extra_cushions} min={0} max={10}
              onChange={(v)=>setForm({...form,extra_cushions:Math.max(0,Math.min(10,v))})} />
            <NumberInput label="จำนวนชุด" value={form.quantity} min={1} max={50}
              onChange={(v)=>setForm({...form,quantity:Math.max(1,Math.min(50,v))})} />
          </div>
        </div>

        {/* สรุป/ขอใบเสนอราคา */}
        <div className="space-y-3">
          <h2 className="text-base font-medium">สรุป & ประเมินราคา</h2>
          <div className="rounded-xl border p-3">
            {sel && breakdown ? (
              <div className="space-y-1 text-sm">
                <Row k="ผ้าที่เลือก" v={`${sel.name} (${sel.code||"-"})`} />
                <Row k="ใช้ผ้าประมาณ" v={`${breakdown.meters} m`} />
                <Row k="ค่าวัสดุ" v={`${breakdown.fabric_cost.toLocaleString()} ฿`} />
                <Row k="ค่าแรง (รวมออปชัน)" v={`${breakdown.labor_cost.toLocaleString()} ฿`} />
                <Row k="รวม/ชุด" v={`${breakdown.total_per_item.toLocaleString()} ฿`} />
                <Row k={`รวมทั้งสิ้น x${form.quantity}`} v={`${(breakdown.total_per_item*form.quantity).toLocaleString()} ฿`} bold />
              </div>
            ) : <div className="text-gray-500 text-sm">กรุณาเลือกผ้า</div>}
          </div>

          <h3 className="text-sm font-medium">ข้อมูลติดต่อ</h3>
          <div className="grid grid-cols-2 gap-2">
            <TextInput label="ชื่อ*" value={customer.name} onChange={(v)=>setCustomer({...customer,name:v})}/>
            <TextInput label="โทรศัพท์" value={customer.phone} onChange={(v)=>setCustomer({...customer,phone:v})}/>
            <TextInput label="อีเมล" value={customer.email} onChange={(v)=>setCustomer({...customer,email:v})} className="col-span-2"/>
            <TextArea label="โน้ต (ทางเลือก)" value={customer.notes} onChange={(v)=>setCustomer({...customer,notes:v})} className="col-span-2"/>
          </div>

          <button disabled={busy || !sel}
            onClick={submit}
            className="w-full rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-60">
            {busy ? "กำลังส่ง..." : "ขอใบเสนอราคา"}
          </button>
          {msg && <p className={(msg.ok?"text-green-600":"text-red-600")+" text-sm"}>{msg.text}</p>}
          <p className="text-xs text-gray-500">* ราคานี้เป็นการประเมินเบื้องต้น อาจเปลี่ยนแปลงหลังตรวจสอบงานจริง</p>
        </div>
      </section>
    </div>
  );
}

function Row({k,v,bold}:{k:string;v:string;bold?:boolean}) {
  return <div className="flex justify-between"><span className="text-gray-600">{k}</span><span className={bold?"font-semibold":""}>{v}</span></div>
}
function Select({label,value,onChange,options,className}:{label:string;value:string;onChange:(v:string)=>void;options:{v:string;t:string}[];className?:string}){
  return (
    <label className={"text-sm "+(className||"")}>
      <span className="block text-gray-600 mb-1">{label}</span>
      <select value={value} onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 bg-white">
        {options.map(o=> <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>
    </label>
  );
}
function NumberInput({label,value,onChange,min=0,max=999,className}:{label:string;value:number;onChange:(v:number)=>void;min?:number;max?:number;className?:string}){
  return (
    <label className={"text-sm "+(className||"")}>
      <span className="block text-gray-600 mb-1">{label}</span>
      <input type="number" value={value} min={min} max={max}
        onChange={(e)=>onChange(Number(e.target.value))}
        className="w-full rounded-lg border px-3 py-2"/>
    </label>
  );
}
function TextInput({label,value,onChange,className}:{label:string;value:string;onChange:(v:string)=>void;className?:string}){
  return (
    <label className={"text-sm "+(className||"")}>
      <span className="block text-gray-600 mb-1">{label}</span>
      <input value={value} onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"/>
    </label>
  );
}
function TextArea({label,value,onChange,className}:{label:string;value:string;onChange:(v:string)=>void;className?:string}){
  return (
    <label className={"text-sm "+(className||"")}>
      <span className="block text-gray-600 mb-1">{label}</span>
      <textarea rows={3} value={value} onChange={(e)=>onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 resize-y"/>
    </label>
  );
}
