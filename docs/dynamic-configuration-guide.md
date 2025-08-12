# 🔧 Dynamic Configuration System Guide

## 📖 Overview

ระบบ Dynamic Configuration ช่วยให้คุณสามารถเปลี่ยนแปลงการตั้งค่าต่างๆ ของเว็บไซต์ได้แบบเรียลไทม์ โดยไม่ต้องแก้ไขโค้ดหรือ Deploy ใหม่

The Dynamic Configuration System allows you to manage business parameters, technical settings, and other configurable values without code changes. This system provides:

- **Flexible Field Types**: Text, numbers, booleans, selects, dates, and more
- **Category Organization**: Group related settings together
- **Real-time Updates**: Changes apply immediately without deployment
- **Validation**: Ensure data integrity with built-in validation rules
- **API Access**: Programmatic access via REST API
- **Security**: Role-based access and API key authentication

## 🎯 Features

### ✅ ความยืดหยุ่น
- เพิ่ม/ลบ/แก้ไขการตั้งค่าได้ตลอดเวลา
- รองรับหลายประเภทข้อมูล (String, Number, Boolean, JSON, Array, Date)
- จัดกลุ่มตามหมวดหมู่
- Import/Export Configuration

Add new configuration fields anytime
Support for custom validation rules
Category-based organization
Version control and audit trails

### 🔒 ความปลอดภัย
- ระบบ Validation อัตโนมัติ
- Audit Trail สำหรับการเปลี่ยนแปลง
- Role-based Access Control
- Input Sanitization

API key authentication required
Rate limiting implemented
Input validation and sanitization
Audit logging for all changes

### ⚡ ประสิทธิภาพ
- Real-time Updates
- Client-side Caching
- Optimistic Updates
- Error Handling

Changes apply immediately without deployment
Strong typing for all configuration values
Runtime validation
Default value fallbacks
Error handling and recovery

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin UI      │    │  Config System   │    │  React Hooks    │
│                 │    │                  │    │                 │
│ - Add Config    │◄──►│ - Validation     │◄──►│ - useConfig     │
│ - Edit Config   │    │ - Storage        │    │ - useCategory   │
│ - Delete Config │    │ - Audit Trail    │    │ - useContext    │
│ - Import/Export │    │ - Subscription   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Local Storage  │
                    │   + API Sync     │
                    └──────────────────┘
\`\`\`

## 📋 Configuration Categories

### 💰 Pricing (ราคาและค่าบริการ)
- `pricing.delivery_fee` - ค่าจัดส่ง
- `pricing.minimum_order` - ยอดสั่งซื้อขั้นต่ำ
- `pricing.tax_rate` - อัตราภาษี
- `pricing.discount_threshold` - ยอดที่ได้รับส่วนลด
- `pricing.discount_rate` - อัตราส่วนลด

### 🏢 Business (ข้อมูลธุรกิจ)
- `business.company_name` - ชื่อบริษัท
- `business.phone` - เบอร์โทรศัพท์
- `business.email` - อีเมล
- `business.address` - ที่อยู่
- `business.working_hours` - เวลาทำการ
- `business.social_media` - โซเชียลมีเดีย

### Business Information
- Company details
- Contact information
- Legal requirements
- Branding elements

### 💰 Pricing & Costs
- Base prices
- Material costs
- Discount rates
- Tax settings

### 🚙️ Features (ฟีเจอร์และการทำงาน)
- `features.enable_online_payment` - เปิดการชำระเงินออนไลน์
- `features.enable_custom_orders` - เปิดการสั่งทำพิเศษ
- `features.enable_inventory_tracking` - เปิดการติดตามสต็อก
- `features.maintenance_mode` - โหมดปิดปรุงระบบ

### Technical Settings
- API rate limits
- Cache durations
- Feature flags
- Integration settings

### 🎨 UI (หน้าตาและการแสดงผล)
- `ui.theme_color` - สีหลักของเว็บไซต์
- `ui.logo_url` - URL โลโก้
- `ui.banner_message` - ข้อความแบนเนอร์
- `ui.show_promotions` - แสดงโปรโมชั่น

### User-Friendly Interface
- Intuitive admin dashboard
- Real-time preview of changes
- Bulk import/export capabilities
- Search and filtering

### 🔔 Notifications (การแจ้งเตือน)
- `notifications.email_enabled` - เปิดการส่งอีเมล
- `notifications.sms_enabled` - เปิดการส่ง SMS
- `notifications.order_confirmation` - แจ้งเตือนยืนยันคำสั่งซื้อ
- `notifications.payment_reminder` - แจ้งเตือนชำระเงิน
- `notifications.delivery_update` - แจ้งเตือนสถานะจัดส่ง

## 🚀 Quick Start

### 1. Basic Usage

\`\`\`tsx
import { useConfig } from '@/lib/dynamic-config-system';

function PricingComponent() {
  const { value: deliveryFee, updateConfig } = useConfig('pricing.delivery_fee', 50);
  
  return (
    <div>
      <p>ค่าจัดส่ง: {deliveryFee} บาท</p>
      <button onClick={() => updateConfig(60)}>
        เปลี่ยนเป็น 60 บาท
      </button>
    </div>
  );
}
\`\`\`

### 2. Using Convenience Hooks

\`\`\`tsx
import { usePricingConfig } from '@/components/ConfigProvider';

function CheckoutSummary() {
  const pricing = usePricingConfig();
  
  const subtotal = 1000;
  const tax = subtotal * pricing.taxRate;
  const total = subtotal + tax + pricing.deliveryFee;
  
  return (
    <div>
      <p>ยอดรวม: {subtotal} บาท</p>
      <p>ภาษี ({pricing.taxRate * 100}%): {tax} บาท</p>
      <p>ค่าจัดส่ง: {pricing.deliveryFee} บาท</p>
      <p><strong>รวมทั้งสิ้น: {total} บาท</strong></p>
    </div>
  );
}
\`\`\`

### 3. Admin Configuration

\`\`\`tsx
// ใช้ Admin Dashboard ที่ /admin/dynamic-config
// หรือใช้ API โดยตรง

const response = await fetch('/api/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'pricing.delivery_fee',
    value: 60,
    category: 'pricing',
    description: 'ค่าจัดส่งสินค้าทั่วไป',
    validation: {
      required: true,
      min: 0,
      max: 500
    }
  })
});
\`\`\`

## 📝 Configuration Types

### String (ข้อความ)
\`\`\`json
{
  "key": "business.company_name",
  "value": "ดงอุษา โซฟา",
  "type": "string",
  "validation": {
    "required": true,
    "min": 1,
    "max": 100
  }
}
\`\`\`

### Number (ตัวเลข)
\`\`\`json
{
  "key": "pricing.delivery_fee",
  "value": 50,
  "type": "number",
  "validation": {
    "required": true,
    "min": 0,
    "max": 1000
  }
}
\`\`\`

### Boolean (จริง/เท็จ)
\`\`\`json
{
  "key": "features.maintenance_mode",
  "value": false,
  "type": "boolean"
}
\`\`\`

### JSON (ข้อมูลซับซ้อน)
\`\`\`json
{
  "key": "business.social_media",
  "value": {
    "facebook": "https://facebook.com/dongusa",
    "line": "@dongusa",
    "instagram": "dongusa_sofa"
  },
  "type": "json"
}
\`\`\`

### Array (รายการ)
\`\`\`json
{
  "key": "ui.featured_categories",
  "value": ["โซฟา", "เก้าอี้", "โต๊ะ", "ตู้"],
  "type": "array"
}
\`\`\`

## 🔧 API Reference

### GET /api/config
ดึงข้อมูลการตั้งค่า

**Parameters:**
- `category` (optional) - หมวดหมู่
- `key` (optional) - คีย์เฉพาะ

**Response:**
\`\`\`json
{
  "configs": [...],
  "categories": [...],
  "total": 25
}
\`\`\`

### POST /api/config
สร้างการตั้งค่าใหม่

**Body:**
\`\`\`json
{
  "key": "pricing.new_fee",
  "value": 100,
  "category": "pricing",
  "description": "ค่าธรรมเนียมใหม่",
  "validation": {
    "required": true,
    "min": 0
  },
  "userId": "admin"
}
\`\`\`

### PUT /api/config
อัปเดตการตั้งค่า

**Body:**
\`\`\`json
{
  "key": "pricing.delivery_fee",
  "value": 60,
  "userId": "admin"
}
\`\`\`

### DELETE /api/config
ลบการตั้งค่า

**Parameters:**
- `key` - คีย์ที่ต้องการลบ
- `userId` - ผู้ใช้ที่ทำการลบ

## 🛡️ Security & Validation

### Input Validation
\`\`\`typescript
const validation = {
  required: true,        // จำเป็นต้องมีค่า
  min: 0,               // ค่าต่ำสุด (สำหรับ string = ความยาว, number = ค่า)
  max: 1000,            // ค่าสูงสุด
  pattern: "^[0-9]+$",  // Regular Expression
  enum: ["A", "B", "C"] // ค่าที่อนุญาต
};
\`\`\`

### Access Control
\`\`\`typescript
const category = {
  id: 'pricing',
  name: 'ราคาและค่าบริการ',
  permissions: ['admin', 'pricing_manager'] // บทบาทที่สามารถแก้ไขได้
};
\`\`\`

### Audit Trail
ระบบจะบันทึกการเปลี่ยนแปลงทั้งหมด:
- ใครเปลี่ยน (userId)
- เปลี่ยนเมื่อไหร่ (timestamp)
- เปลี่ยนจากอะไรเป็นอะไร (oldValue → newValue)
- เหตุผล (reason)

## 📊 Best Practices

### 1. Naming Convention
\`\`\`
category.subcategory.setting_name
\`\`\`

**ตัวอย่าง:**
- `pricing.delivery.standard_fee`
- `ui.theme.primary_color`
- `features.payment.enable_promptpay`

### 2. Default Values
กำหนดค่าเริ่มต้นเสมอ:
\`\`\`tsx
const deliveryFee = useConfig('pricing.delivery_fee', 50); // 50 เป็นค่าเริ่มต้น
\`\`\`

### 3. Validation Rules
ตั้งกฎการตรวจสอบที่เหมาะสม:
\`\`\`typescript
{
  key: 'pricing.discount_rate',
  validation: {
    required: true,
    min: 0,
    max: 1, // 0-100%
    pattern: '^0\\.\\d+$' // ทศนิยม 0.xx
  }
}
\`\`\`

### 4. Performance
- ใช้ `useConfig` สำหรับค่าเดี่ยว
- ใช้ `useConfigCategory` สำหรับหลายค่าในหมวดเดียว
- ใช้ Convenience Hooks สำหรับกลุ่มที่ใช้บ่อย

## 🚨 Troubleshooting

### ปัญหาที่พบบ่อย

**1. Configuration ไม่อัปเดต**
- ตรวจสอบ Network Tab ใน Browser
- ดู Console สำหรับ Error Messages
- ลองรีเฟรชหน้าเว็บ

**2. Validation Error**
- ตรวจสอบประเภทข้อมูล (type)
- ตรวจสอบกฎ validation
- ใช้ `/api/config/validate` เพื่อทดสอบ

**3. Permission Denied**
- ตรวจสอบสิทธิ์ผู้ใช้
- ตรวจสอบ Category Permissions
- ตรวจสอบ Authentication

### Debug Mode
เปิด Debug Mode ใน Console:
\`\`\`javascript
localStorage.setItem('config-debug', 'true');
\`\`\`

## 📈 Roadmap

### Phase 1 (ปัจจุบัน)
- ✅ Basic Configuration System
- ✅ Admin UI
- ✅ React Hooks
- ✅ Local Storage

### Phase 2 (ถัดไป)
- 🔄 Database Integration (Supabase)
- 🔄 Real-time Sync
- 🔄 Multi-user Support
- 🔄 Configuration History

### Phase 3 (อนาคต)
- 📋 A/B Testing Integration
- 📋 Configuration Templates
- 📋 Bulk Operations
- 📋 Configuration Scheduling

---

**📅 Last Updated**: 2024-01-13  
**🔄 Version**: 1.0.0  
**📖 Documentation**: [GitHub Wiki](https://github.com/dongusa/docs)
