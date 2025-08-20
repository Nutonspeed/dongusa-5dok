import { NextResponse } from "next/server"

// Utility: CRC16-CCITT (0x1021)
function crc16ccitt(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021
      else crc <<= 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

function tag(id: string, value: string) {
  const len = value.length.toString().padStart(2, "0")
  return `${id}${len}${value}`
}

function sanitizePhone(thPhone: string) {
  // remove non-digits; assume Thai number without country code
  const digits = thPhone.replace(/\D/g, "")
  // PromptPay mobile uses leading 0066 and drop leading 0
  const national = digits.startsWith("0") ? digits.slice(1) : digits
  return `0066${national}`
}

function sanitizeCitizenId(id: string) {
  return id.replace(/\D/g, "")
}

function buildPromptPayPayload(input: { phoneOrId: string; amount?: number }) {
  const { phoneOrId, amount } = input
  const isPhone = /\d{9,10}/.test(phoneOrId.replace(/\D/g, "")) && phoneOrId.replace(/\D/g, "").length <= 10

  const GUID_PROMPTPAY = tag("00", "A000000677010111")

  // Merchant Account Info (ID 29)
  const target = isPhone
    ? tag("01", sanitizePhone(phoneOrId))
    : tag("02", sanitizeCitizenId(phoneOrId))
  const MAI = tag("29", GUID_PROMPTPAY + target)

  const payloadFormat = tag("00", "01")
  const poiMethod = tag("01", "11") // dynamic QR
  const countryCode = tag("58", "TH")
  const currency = tag("53", "764")
  const txnAmount = amount && amount > 0 ? tag("54", amount.toFixed(2)) : ""
  const crcPlaceholder = "6304" // tag 63 len 04 + CRC later

  const withoutCRC = payloadFormat + poiMethod + MAI + currency + countryCode + txnAmount + crcPlaceholder
  const crc = crc16ccitt(withoutCRC)
  return withoutCRC + crc
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || !body.phoneOrId) {
      return NextResponse.json({ error: "phoneOrId_required" }, { status: 400 })
    }
    const payload = buildPromptPayPayload({ phoneOrId: body.phoneOrId, amount: body.amount })
    const qrcodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(payload)}`
    return NextResponse.json({ success: true, payload, qrcodeUrl })
  } catch (e: any) {
    return NextResponse.json({ error: "internal_error", details: e?.message }, { status: 500 })
  }
}
