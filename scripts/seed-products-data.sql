-- เพิ่มข้อมูลสินค้าและหมวดหมู่ตัวอย่างสำหรับเว็บไซต์
-- Seed data for ELF Sofa Cover Pro website

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, is_active, created_at) VALUES
('cat-001', 'ผ้าคลุมโซฟา', 'sofa-covers', 'ผ้าคลุมโซฟาคุณภาพสูง ทนทาน กันน้ำ', '/images/categories/sofa-covers.jpg', true, NOW()),
('cat-002', 'หมอนอิง', 'pillows', 'หมอนอิงสวยงาม เข้าชุดกับผ้าคลุมโซฟา', '/images/categories/pillows.jpg', true, NOW()),
('cat-003', 'ผ้าคลุมเก้าอี้', 'chair-covers', 'ผ้าคลุมเก้าอี้ ป้องกันความเสียหาย', '/images/categories/chair-covers.jpg', true, NOW()),
('cat-004', 'อุปกรณ์เสริม', 'accessories', 'อุปกรณ์เสริมสำหรับการดูแลเฟอร์นิเจอร์', '/images/categories/accessories.jpg', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Fabric Collections
INSERT INTO fabric_collections (id, name, slug, description, image_url, is_featured, is_active, created_at) VALUES
('col-001', 'Modern Minimalist', 'modern-minimalist', 'คอลเลกชันโมเดิร์นมินิมอล สีพื้นเรียบง่าย', '/images/collections/modern-minimalist.jpg', true, true, NOW()),
('col-002', 'Luxury Velvet', 'luxury-velvet', 'คอลเลกชันกำมะหยี่หรูหรา นุ่มสบาย', '/images/collections/luxury-velvet.jpg', true, true, NOW()),
('col-003', 'Japanese Zen', 'japanese-zen', 'คอลเลกชันสไตล์ญี่ปุ่น เรียบง่าย สงบ', '/images/collections/japanese-zen.jpg', true, true, NOW()),
('col-004', 'Vintage Romance', 'vintage-romance', 'คอลเลกชันวินเทจโรแมนติก ลายดอกไม้', '/images/collections/vintage-romance.jpg', false, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Fabrics
INSERT INTO fabrics (id, collection_id, name, color, pattern, material, price_per_meter, image_url, is_active, created_at) VALUES
('fab-001', 'col-001', 'Arctic White', 'ขาว', 'พื้นเรียบ', 'Cotton Blend', 450.00, '/images/fabrics/arctic-white.jpg', true, NOW()),
('fab-002', 'col-001', 'Charcoal Matte', 'เทาเข้ม', 'พื้นเรียบ', 'Cotton Blend', 450.00, '/images/fabrics/charcoal-matte.jpg', true, NOW()),
('fab-003', 'col-002', 'Burgundy Rich', 'แดงเบอร์กันดี', 'พื้นเรียบ', 'Velvet', 890.00, '/images/fabrics/burgundy-rich.jpg', true, NOW()),
('fab-004', 'col-002', 'Navy Elegance', 'น้ำเงินกรมท่า', 'พื้นเรียบ', 'Velvet', 890.00, '/images/fabrics/navy-elegance.jpg', true, NOW()),
('fab-005', 'col-003', 'Bamboo Whisper', 'เบจ', 'ลายไผ่', 'Linen Blend', 650.00, '/images/fabrics/bamboo-whisper.jpg', true, NOW()),
('fab-006', 'col-004', 'Rose Garden', 'ชมพูอ่อน', 'ลายดอกกุหลาบ', 'Cotton', 580.00, '/images/fabrics/rose-garden.jpg', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (id, category_id, name, slug, description, price, compare_at_price, images, stock_quantity, is_active, created_at, sku) VALUES
('prod-001', 'cat-001', 'ผ้าคลุมโซฟากำมะหยี่พรีเมียม', 'premium-velvet-sofa-cover', 'ผ้าคลุมโซฟาคุณภาพสูง ทำจากกำมะหยี่นุ่ม กันน้ำ กันคราบ เหมาะสำหรับโซฟา 2-3 ที่นั่ง', 2890.00, 3490.00, ARRAY['/images/products/premium-velvet-burgundy-1.jpg', '/images/products/premium-velvet-burgundy-2.jpg', '/images/products/premium-velvet-burgundy-3.jpg'], 25, true, NOW(), 'SFC-PV-001'),

('prod-002', 'cat-001', 'ผ้าคลุมโซฟากันน้ำ', 'waterproof-sofa-cover', 'ผ้าคลุมโซฟากันน้ำ 100% เหมาะสำหรับครอบครัวที่มีเด็กเล็ก ทำความสะอาดง่าย', 1950.00, NULL, ARRAY['/images/products/waterproof-charcoal-1.jpg', '/images/products/waterproof-charcoal-2.jpg'], 40, true, NOW(), 'SFC-WP-002'),

('prod-003', 'cat-002', 'หมอนอิงลายเดียวกัน', 'matching-throw-pillow', 'หมอนอิงที่เข้าชุดกับผ้าคลุมโซฟา ขนาด 45x45 ซม. ผ้าคุณภาพเดียวกัน', 350.00, NULL, ARRAY['/images/products/pillow-burgundy-1.jpg', '/images/products/pillow-burgundy-2.jpg'], 60, true, NOW(), 'PIL-MAT-003'),

('prod-004', 'cat-001', 'ผ้าคลุมโซฟาเซ็กชั่นแนล', 'sectional-sofa-cover', 'ผ้าคลุมโซฟาสำหรับโซฟาเซ็กชั่นแนล ขนาดใหญ่ ครอบคลุมได้ดี มีสายรัดกันเลื่อน', 4200.00, 4890.00, ARRAY['/images/products/sectional-navy-1.jpg', '/images/products/sectional-navy-2.jpg', '/images/products/sectional-navy-3.jpg'], 15, true, NOW(), 'SFC-SEC-004'),

('prod-005', 'cat-001', 'ผ้าคลุมโซฟาสไตล์ญี่ปุ่น', 'japanese-zen-sofa-cover', 'ผ้าคลุมโซฟาสไตล์ญี่ปุ่น ลายไผ่ สีเบจ เรียบง่าย สงบ เหมาะกับการตตกแต่งแบบมินิมอล', 2450.00, NULL, ARRAY['/images/products/japanese-zen-beige-1.jpg', '/images/products/japanese-zen-beige-2.jpg'], 30, true, NOW(), 'SFC-JZ-005'),

('prod-006', 'cat-002', 'หมอนอิงกำมะหยี่', 'velvet-throw-pillow', 'หมอนอิงกำมะหยี่หรูหรา ขนาด 50x50 ซม. สีแดงเบอร์กันดี เข้าชุดกับผ้าคลุมโซฟา', 450.00, 550.00, ARRAY['/images/products/velvet-pillow-burgundy-1.jpg'], 45, true, NOW(), 'PIL-VEL-006'),

('prod-007', 'cat-003', 'ผ้าคลุมเก้าอี้ทำงาน', 'office-chair-cover', 'ผ้าคลุมเก้าอี้ทำงาน ป้องกันความเสียหาย ใส่ง่าย ถอดง่าย ซักได้', 890.00, NULL, ARRAY['/images/products/office-chair-cover-1.jpg', '/images/products/office-chair-cover-2.jpg'], 35, true, NOW(), 'CHC-OFF-007'),

('prod-008', 'cat-001', 'ผ้าคลุมโซฟาวินเทจ', 'vintage-floral-sofa-cover', 'ผ้าคลุมโซฟาลายดอกไม้วินเทจ สีชมพูอ่อน โรแมนติก เหมาะกับการตกแต่งแบบคลาสสิก', 2650.00, 3200.00, ARRAY['/images/products/vintage-floral-pink-1.jpg', '/images/products/vintage-floral-pink-2.jpg'], 20, true, NOW(), 'SFC-VF-008')
ON CONFLICT (id) DO NOTHING;

-- Update products to be featured
UPDATE products SET 
  is_active = true
WHERE id IN ('prod-001', 'prod-002', 'prod-003', 'prod-004');

-- Insert some customer reviews for featured products
INSERT INTO customer_reviews (id, product_id, user_id, rating, title, comment, verified_purchase, helpful_count, created_at) VALUES
('rev-001', 'prod-001', 'user-001', 5, 'คุณภาพดีมาก!', 'ผ้านุ่มมาก สีสวย ใส่โซฟาแล้วดูหรูขึ้นเยอะ คุ้มค่าเงินที่จ่าย', true, 12, NOW() - INTERVAL '5 days'),
('rev-002', 'prod-001', 'user-002', 4, 'ใช้ดี แต่ราคาค่อนข้างแพง', 'คุณภาพดี แต่ราคาสูงไปหน่อย โดยรวมพอใจ', true, 8, NOW() - INTERVAL '3 days'),
('rev-003', 'prod-002', 'user-003', 5, 'กันน้ำได้จริง', 'ลูกหกน้ำใส่ เช็ดออกได้เลย ไม่ซึมเข้าโซฟา ดีมาก', true, 15, NOW() - INTERVAL '7 days'),
('rev-004', 'prod-003', 'user-004', 4, 'หมอนสวย เข้าชุดดี', 'สีเข้ากับผ้าคลุมโซฟาดี ขนาดพอดี นุ่มสบาย', true, 6, NOW() - INTERVAL '2 days'),
('rev-005', 'prod-004', 'user-005', 5, 'เหมาะกับโซฟาใหญ่', 'โซฟาเซ็กชั่นแนลใส่ได้พอดี มีสายรัดกันเลื่อน ดีมาก', true, 9, NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- Insert system settings for website configuration
INSERT INTO system_settings (id, key, value, description, created_at) VALUES
('set-001', 'featured_products_limit', '4', 'จำนวนสินค้าแนะนำที่แสดงในหน้าแรก', NOW()),
('set-002', 'free_shipping_threshold', '2000', 'ยอดขั้นต่ำสำหรับจัดส่งฟรี (บาท)', NOW()),
('set-003', 'currency_symbol', '฿', 'สัญลักษณ์สกุลเงิน', NOW()),
('set-004', 'store_name', 'ELF โซฟาคัฟเวอร์ โปร', 'ชื่อร้าน', NOW()),
('set-005', 'contact_phone', '+66 2 123 4567', 'เบอร์โทรติดต่อ', NOW()),
('set-006', 'contact_email', 'info@sofacoverpro.com', 'อีเมลติดต่อ', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some sample cart items and wishlists for testing
-- (These would normally be created by user interactions)
