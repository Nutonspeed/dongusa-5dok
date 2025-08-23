# รายการไฟล์ที่ลบออกจาก scripts/ (24 ส.ค. 2025)

ไฟล์เหล่านี้เป็นสคริปต์ทดสอบ/ตรวจสอบ/แก้ไขเฉพาะกิจ ไม่ถูกเรียกใช้งานใน production หรือระบบหลัก:

- test-user-signup.ts
- test-login-system-comprehensive.ts
- test-core-business-functions.ts
- test-supabase-connection.ts
- validate-system-recovery.ts
- website-health-check.ts
- test-authentication-flow.ts
- test-complete-backend-functionality.ts
- verify-supabase-connection.ts
- verify-admin-backend-access.ts

**เหตุผล:**
- ไม่ถูก import หรือ require จากไฟล์อื่น
- ใช้สำหรับทดสอบหรือแก้ไขเฉพาะกิจเท่านั้น
- ลดความเสี่ยงระบบ production พังจากสคริปต์เก่า/ซ้ำซ้อน

หากต้องการนำกลับมาใช้ สามารถกู้คืนจาก git history ได้

---

ดำเนินการโดย GitHub Copilot (24 ส.ค. 2025)
