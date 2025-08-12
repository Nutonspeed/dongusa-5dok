# DEV_MASTER_PLAN

## Overview
ร้านผ้าคลุม, เสาหลัก: Bills, Orders, Collections, Profiles

## Data Modes
Dual-mode `USE_SUPABASE` (mock↔supabase), QA_BYPASS_AUTH

## Money
ใช้ `lib/money.ts` ทุกหน้าที่แสดงเงิน

## Auth
AppUser (full_name), Signup/Login toast + email confirm

## Edge/Node
Node-only routes → `runtime='nodejs'`

## Repo Safety
Husky กันลบ `app/**, components/**, styles/**, public/**`

## Status ล่าสุด
typecheck/build ผ่าน, bills live, export CSV ok, เหลือ QA บาง flow

## Next Steps
QA smoke, RC tag, Deploy

## Known Issues
- None
