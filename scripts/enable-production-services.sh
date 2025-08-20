#!/bin/bash
# สคริปต์สำหรับเปิดใช้งานบริการจริงทั้งหมด

echo "🚀 เปลี่ยนจาก Mock Services เป็น Production Services"

# ปิด Mock Services ทั้งหมด
export MOCK_EMAIL_ENABLED=false
export MOCK_UPLOAD_ENABLED=false  
export MOCK_PAYMENT_ENABLED=false
export ENABLE_MOCK_SERVICES=false

# ตั้งค่าบริการจริง
echo "📧 Email Service: ตั้งค่า SMTP_HOST เพื่อใช้อีเมลจริง"
echo "📁 File Upload: ตั้งค่า BLOB_READ_WRITE_TOKEN เพื่อใช้ Vercel Blob"
echo "💳 Payment: ตั้งค่าบัญชีธนาคารและ PromptPay จริง"

echo "✅ ระบบพร้อมใช้งาน Production แล้ว!"
echo "🔍 ตรวจสอบสถานะ: npm run dev:validate"
