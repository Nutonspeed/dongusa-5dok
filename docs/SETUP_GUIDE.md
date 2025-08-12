# 🚀 ระบบผ้าคลุมโซฟา - คู่มือการตั้งค่า

## 📋 ขั้นตอนการติดตั้งแบบง่าย

### 1. ติดตั้งและตั้งค่าเบื้องต้น

\`\`\`bash
# Clone โปรเจค
git clone <your-repo-url>
cd sofa-cover-website

# ติดตั้ง dependencies
npm install

# ตั้งค่าสำหรับ development (จะสร้างไฟล์ .env.local ให้อัตโนมัติ)
npm run dev:setup

# ตรวจสอบการตั้งค่า
npm run dev:validate

# เริ่มต้นใช้งาน
npm run dev
\`\`\`

### 2. เปิดเว็บไซต์

เปิดเบราว์เซอร์ไปที่: http://localhost:3000

## 🔧 การตั้งค่าแบบละเอียด

### Environment Variables ที่สำคัญ

#### สำหรับ Development (ใช้ Mock Database)
\`\`\`env
NODE_ENV=development
NEXT_PUBLIC_USE_SUPABASE=false
QA_BYPASS_AUTH=1
ENABLE_MOCK_SERVICES=true
\`\`\`

#### สำหรับ Production (ใช้ Supabase จริง)
\`\`\`env
NODE_ENV=production
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
QA_BYPASS_AUTH=0
\`\`\`

### ข้อมูลร้านค้า (ปรับแต่งตามต้องการ)
\`\`\`env
STORE_NAME="ร้านผ้าคลุมโซฟาพรีเมียม"
STORE_PHONE="02-123-4567"
STORE_LINE_ID="@sofacover"
STORE_ADDRESS="123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110"
ADMIN_EMAIL=admin@sofacover.com
\`\`\`

## 🗄️ ตัวเลือกฐานข้อมูล

### 1. Mock Database (แนะนำสำหรับ Development)
- ✅ ไม่ต้องตั้งค่าอะไร
- ✅ ใช้งานได้ทันที
- ✅ เหมาะสำหรับทดสอบ

\`\`\`env
NEXT_PUBLIC_USE_SUPABASE=false
ENABLE_MOCK_SERVICES=true
\`\`\`

### 2. Supabase Database (สำหรับ Production)
- 🔧 ต้องสร้าง Supabase project
- 🔧 ต้องตั้งค่า environment variables
- ✅ ฐานข้อมูลจริง มีประสิทธิภาพสูง

\`\`\`env
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

## 📧 การตั้งค่า Email

### Mock Email (Development)
\`\`\`env
MOCK_EMAIL_ENABLED=true
\`\`\`

### SMTP Email (Production)
\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME="ร้านผ้าคลุมโซฟาพรีเมียม"
SMTP_FROM_EMAIL=noreply@sofacover.com
\`\`\`

## 📁 การตั้งค่า File Upload

### Mock Upload (Development)
\`\`\`env
MOCK_UPLOAD_ENABLED=true
\`\`\`

### Vercel Blob (Production)
\`\`\`env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif
\`\`\`

## 💳 การตั้งค่าการชำระเงิน

\`\`\`env
# PromptPay
PROMPTPAY_ID=0123456789
PROMPTPAY_MERCHANT_NAME="ร้านผ้าคลุมโซฟาพรีเมียม"

# Bank Transfer
BANK_ACCOUNT_NUMBER=123-4-56789-0
BANK_NAME="ธนาคารกรุงเทพ"
BANK_BRANCH="สาขาสยาม"
ACCOUNT_HOLDER_NAME="บริษัท โซฟาคัฟเวอร์ จำกัด"
\`\`\`

## 🚚 การตั้งค่าการจัดส่ง

\`\`\`env
FREE_SHIPPING_THRESHOLD=2000
STANDARD_SHIPPING_RATE=100
EXPRESS_SHIPPING_RATE=200

# Thailand Post
THAILAND_POST_API_KEY=your_api_key
THAILAND_POST_CUSTOMER_CODE=your_customer_code

# Kerry Express
KERRY_API_KEY=your_api_key
KERRY_API_SECRET=your_api_secret
\`\`\`

## 🛠️ คำสั่งที่มีประโยชน์

\`\`\`bash
# Development
npm run dev                 # เริ่ม development server
npm run dev:mock           # เริ่มด้วย mock services
npm run dev:supabase       # เริ่มด้วย Supabase
npm run dev:validate       # ตรวจสอบการตั้งค่า

# Database
npm run db:setup           # ตั้งค่าฐานข้อมูล
npm run db:seed            # ใส่ข้อมูลตัวอย่าง
npm run db:reset           # รีเซ็ตฐานข้อมูล

# Build & Deploy
npm run build              # Build สำหรับ production
npm run build:production   # Build พร้อม Supabase
npm run start              # เริ่ม production server

# Testing & Validation
npm run test:env           # ตรวจสอบ environment variables
npm run lint               # ตรวจสอบ code quality
npm run type-check         # ตรวจสอบ TypeScript

# Maintenance
npm run clean              # ลบไฟล์ build
npm run clean:all          # ลบทุกอย่างรวม node_modules
\`\`\`

## 🔍 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Environment Variables ไม่ถูกต้อง
\`\`\`bash
# ตรวจสอบการตั้งค่า
npm run test:env

# แก้ไข: คัดลอกไฟล์ตัวอย่าง
cp .env.example .env.local
\`\`\`

#### 2. Database Connection ล้มเหลว
\`\`\`bash
# ตรวจสอบการเชื่อมต่อ
npm run dev:validate

# แก้ไข: ใช้ mock database
echo "NEXT_PUBLIC_USE_SUPABASE=false" >> .env.local
\`\`\`

#### 3. Build Error
\`\`\`bash
# ลบไฟล์ cache และ build ใหม่
npm run clean
npm run build
\`\`\`

#### 4. TypeScript Error
\`\`\`bash
# ตรวจสอบ TypeScript
npm run type-check

# แก้ไข type errors ตามที่แสดง
\`\`\`

### การตรวจสอบสถานะระบบ

\`\`\`bash
# ตรวจสอบทุกอย่าง
npm run dev:validate

# ตรวจสอบเฉพาะ environment
npm run test:env
\`\`\`

## 🚀 การ Deploy

### 1. Vercel (แนะนำ)
\`\`\`bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
vercel

# ตั้งค่า environment variables ใน Vercel Dashboard
\`\`\`

### 2. Environment Variables สำหรับ Production
\`\`\`env
NODE_ENV=production
NEXT_PUBLIC_USE_SUPABASE=true
QA_BYPASS_AUTH=0
ENABLE_MOCK_SERVICES=false
NEXT_PUBLIC_DEMO_MODE=false

# ตั้งค่าข้อมูลจริง
STORE_PHONE=your_real_phone
STORE_ADDRESS=your_real_address
ADMIN_EMAIL=your_real_email
\`\`\`

## 📞 การขอความช่วยเหลือ

1. **ตรวจสอบ logs ใน console**
2. **รัน validation:** `npm run dev:validate`
3. **ตรวจสอบ environment:** `npm run test:env`
4. **อ่าน documentation ใน `docs/` folder**
5. **ตรวจสอบ GitHub Issues**

## 🎯 สรุป

ระบบนี้ออกแบบมาให้ใช้งานง่าย:

1. **Development:** ใช้ Mock services ไม่ต้องตั้งค่าอะไร
2. **Production:** เชื่อมต่อ Supabase และ services จริง
3. **Validation:** มีระบบตรวจสอบการตั้งค่าอัตโนมัติ
4. **Flexibility:** ปรับแต่งได้ตามต้องการ

เริ่มต้นด้วย `npm run dev:setup` แล้วทุกอย่างจะพร้อมใช้งาน! 🎉
