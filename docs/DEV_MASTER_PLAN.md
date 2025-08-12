# 📋 DEV MASTER PLAN - ดงอุษา โซฟา เว็บไซต์

## 🎯 Project Goals

### หลัก (Core Objectives)
- **ระบบจัดการบิล**: ระบบครบวงจรสำหรับการสร้าง ติดตาม และจัดการใบเสนอราคา/ใบแจ้งหนี้
- **ระบบแอดมิน**: Dashboard สำหรับจัดการสินค้า ลูกค้า คำสั่งซื้อ และรายงาน
- **ระบบ Mock → Supabase**: การเปลี่ยนผ่านจาก Mock Database ไปสู่ Supabase แบบไม่กระทบการทำงาน
- **Dynamic Configuration**: ระบบตั้งค่าแบบเรียลไทม์ที่ไม่ต้องแก้โค้ด

### รอง (Secondary Objectives)
- ระบบ Authentication ที่ปลอดภัย
- ระบบ Payment Integration (PromptPay)
- ระบบ Email แบบจริง (Resend)
- ระบบ File Upload

## 🏗️ Core Features

### ✅ พร้อมใช้งาน (Production Ready)
- **Frontend Architecture**: Next.js 14 + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui ครบชุด
- **Bill Management**: สร้าง แก้ไข ติดตาม สถานะบิล
- **Admin Dashboard**: จัดการข้อมูลทั้งหมด
- **Performance Monitoring**: Web Vitals, Error Tracking
- **Security Features**: Input Sanitization, CSP Headers
- **Testing Suite**: Unit, Integration, API Tests
- **Dynamic Config System**: ระบบตั้งค่าแบบไดนามิก

### 🚧 กำลังพัฒนา (In Development)
- **Database Migration**: Mock → Supabase
- **Authentication System**: NextAuth.js + Supabase Auth
- **Payment Integration**: PromptPay QR Code
- **Email System**: Resend Integration
- **File Upload**: Vercel Blob Storage

### 📋 รอดำเนินการ (Backlog)
- Advanced Analytics Dashboard
- Multi-language Support (i18n)
- Mobile App (React Native)
- Inventory Management System
- Customer Portal

## 📊 Current Status

### Database Status
- **Mock Database**: ✅ ใช้งานได้เต็มรูปแบบ
- **Supabase Setup**: 🔄 กำลังตั้งค่า Schema
- **Migration Scripts**: 📝 เตรียมไว้แล้ว

### Authentication Status
- **Mock Auth**: ✅ ใช้งานได้ (Admin Login)
- **NextAuth.js**: 🔄 กำลังติดตั้ง
- **Supabase Auth**: ⏳ รอ Database เสร็จ

### Payment Status
- **Mock Payment**: ✅ ใช้งานได้
- **PromptPay**: 📋 วางแผนไว้แล้ว
- **QR Code Generation**: 📋 เตรียมไว้แล้ว

## 🚨 Known Issues

### Edge Runtime Warnings
\`\`\`
Warning: Detected multiple renderers concurrently rendering the same context provider
\`\`\`
- **สาเหตุ**: การใช้ Context Provider หลายตัวใน Edge Runtime
- **ผลกระทบ**: ไม่กระทบการทำงาน แต่มี Warning ใน Console
- **แก้ไข**: ปรับ Context Architecture ใน Phase 2

### Authentication Notes
- ปัจจุบันใช้ Mock Authentication
- Admin Login: `admin@dongusa.com` / `admin123`
- จะเปลี่ยนเป็น NextAuth.js + Supabase ใน Phase 2

### Mock Services
- Email: จำลองการส่งอีเมล (แสดงใน Console)
- Upload: จำลองการอัปโหลดไฟล์
- Payment: จำลองการชำระเงิน

## 🛡️ Non-Destructive Rules

### 🚫 ห้ามลบไฟล์เหล่านี้
- `app/**` - หน้าเว็บไซต์หลัก
- `components/**` - UI Components
- `lib/**` - ฟังก์ชันหลัก
- `styles/**` - CSS และ Styling
- `public/**` - รูปภาพและ Assets

### ✅ อนุญาตให้แก้ไข
- เพิ่มไฟล์ใหม่ใน `app/`, `components/`, `lib/`
- แก้ไขเนื้อหาในไฟล์ที่มีอยู่
- เพิ่ม Dependencies ใหม่ใน `package.json`
- อัปเดต Configuration Files

### 🔒 ต้องระวัง
- `middleware.ts` - ระบบ Security
- `next.config.mjs` - การตั้งค่า Next.js
- Database Schema Files
- Environment Variables

## 📈 Next Steps

### Phase 1: Database Migration (สัปดาห์ที่ 1-2)
1. ✅ สร้าง Supabase Project
2. 🔄 รัน Database Schema Scripts
3. ⏳ ทดสอบ Connection
4. ⏳ Migrate Mock Data
5. ⏳ Update API Endpoints

### Phase 2: Authentication (สัปดาห์ที่ 3)
1. ติดตั้ง NextAuth.js
2. ตั้งค่า Supabase Auth Provider
3. สร้าง Login/Register Pages
4. อัปเดต Admin Dashboard
5. ทดสอบ Security

### Phase 3: Payment Integration (สัปดาห์ที่ 4)
1. ติดตั้ง PromptPay Library
2. สร้าง QR Code Generator
3. ทดสอบ Payment Flow
4. เพิ่ม Payment Status Tracking

### Phase 4: Email & Upload (สัปดาห์ที่ 5)
1. ตั้งค่า Resend
2. สร้าง Email Templates
3. ติดตั้ง Vercel Blob
4. ทดสอบ File Upload

## 🔧 Development Guidelines

### Code Standards
- TypeScript Strict Mode
- ESLint + Prettier
- Conventional Commits
- Component Documentation

### Testing Requirements
- Unit Tests สำหรับ Utilities
- Integration Tests สำหรับ API
- E2E Tests สำหรับ Critical Flows
- Performance Tests

### Security Checklist
- Input Validation ทุก API
- SQL Injection Prevention
- XSS Protection
- CSRF Protection
- Rate Limiting

## 📞 Support & Contact

### Development Team
- **Lead Developer**: v0.app
- **Project Owner**: ดงอุษา โซฟา
- **Repository**: GitHub (Protected Main Branch)

### Emergency Contacts
- หากระบบล่ม: ตรวจสอบ `/api/health`
- หาก Database ปัญหา: ใช้ Mock Database ชั่วคราว
- หาก Build ล้มเหลว: ตรวจสอบ TypeScript Errors

---

**📅 Last Updated**: 2024-01-13  
**🔄 Next Review**: 2024-01-20  
**📋 Status**: Active Development
