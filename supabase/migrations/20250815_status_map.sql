-- Migrate Thai status strings to enum values and enforce enum constraint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
    CREATE TYPE order_status_enum AS ENUM (
      'PENDING', 'PENDING_PAYMENT', 'PAID', 'IN_PRODUCTION',
      'READY_TO_SHIP', 'SHIPPED', 'DONE', 'CANCELLED'
    );
  END IF;
END $$;

-- Convert existing Thai strings to enum values
UPDATE orders SET status = CASE status
  WHEN 'รอดำเนินการ' THEN 'PENDING'
  WHEN 'รอชำระเงิน' THEN 'PENDING_PAYMENT'
  WHEN 'ชำระแล้ว' THEN 'PAID'
  WHEN 'กำลังผลิต' THEN 'IN_PRODUCTION'
  WHEN 'พร้อมส่ง' THEN 'READY_TO_SHIP'
  WHEN 'จัดส่งแล้ว' THEN 'SHIPPED'
  WHEN 'เสร็จสิ้น' THEN 'DONE'
  WHEN 'ยกเลิก' THEN 'CANCELLED'
  ELSE UPPER(status)
END;

-- Alter column to use enum
ALTER TABLE orders
  ALTER COLUMN status TYPE order_status_enum
  USING UPPER(status)::order_status_enum;

-- Ensure status and created_at index
CREATE INDEX IF NOT EXISTS orders_status_created_at_idx
  ON orders (status, created_at);
