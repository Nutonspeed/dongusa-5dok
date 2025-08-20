"use client"

import React, { useState } from "react"

export default function PaymentToolsPage() {
  const [billId, setBillId] = useState("")
  const [amount, setAmount] = useState<string>("")
  const [method, setMethod] = useState("bank_transfer")
  const [file, setFile] = useState<File | null>(null)
  const [proofUrl, setProofUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string>("")

  const uploadProof = async () => {
    if (!file || !billId) {
      setMsg("กรุณาเลือกไฟล์และกรอกรหัสบิล")
      return
    }
    setLoading(true)
    setMsg("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("billId", billId)
      const res = await fetch("/api/uploads/proof", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "อัปโหลดล้มเหลว")
      setProofUrl(data.publicUrl)
      setMsg("อัปโหลดสำเร็จ")
    } catch (e: any) {
      setMsg(e.message || "เกิดข้อผิดพลาดขณะอัปโหลด")
    } finally {
      setLoading(false)
    }
  }

  const notifyPayment = async () => {
    if (!billId || !amount) {
      setMsg("กรุณากรอกรหัสบิลและยอดชำระ")
      return
    }
    setLoading(true)
    setMsg("")
    try {
      const res = await fetch(`/api/bills/${billId}/notify-payment`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentAmount: Number(amount), paymentMethod: method }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "แจ้งชำระเงินล้มเหลว")
      setMsg("แจ้งชำระเงินสำเร็จ")
    } catch (e: any) {
      setMsg(e.message || "เกิดข้อผิดพลาดขณะบันทึกการชำระ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">เครื่องมือแจ้งชำระเงินอย่างง่าย</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">รหัสบิล (billId)</label>
        <input
          className="w-full border rounded p-2"
          placeholder="เช่น 2b6f7a4e-..."
          value={billId}
          onChange={(e) => setBillId(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">ยอดชำระ (บาท)</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          placeholder="เช่น 1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">วิธีการชำระ</label>
        <select className="w-full border rounded p-2" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="bank_transfer">โอนผ่านธนาคาร</option>
          <option value="promptpay">พร้อมเพย์</option>
          <option value="cash">เงินสด</option>
          <option value="other">อื่น ๆ</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">อัปโหลดสลิป (ไม่บังคับ)</label>
        <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 rounded border" onClick={uploadProof} disabled={loading || !file || !billId}>
            อัปโหลดสลิป
          </button>
          {proofUrl && (
            <a href={proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
              เปิดไฟล์ที่อัปโหลด
            </a>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button
          className="px-4 py-2 bg-black text-white rounded"
          onClick={notifyPayment}
          disabled={loading || !billId || !amount}
        >
          แจ้งชำระเงิน
        </button>
      </div>

      {!!msg && <p className="text-sm text-gray-700">{msg}</p>}
    </div>
  )
}
