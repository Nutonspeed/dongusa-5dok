-- Insert sample products
INSERT INTO products (
    name, name_en, description, description_en, category, type,
    price_range_min, price_range_max, images, colors, sizes, features, specifications,
    stock, status, rating, reviews_count, sold_count, bestseller, discount
) VALUES 
(
    'ผ้าคลุมโซฟากำมะหยี่พรีเมียม',
    'Premium Velvet Sofa Cover',
    'ผ้าคลุมโซฟากำมะหยี่พรีเมียมที่ให้ความนุ่มสบายและหรูหรา ทำจากเส้นใยคุณภาพสูง ทนทานต่อการใช้งาน ง่ายต่อการดูแลรักษา',
    'Premium velvet sofa cover that provides comfort and luxury. Made from high-quality fibers, durable and easy to maintain.',
    'covers', 'custom', 1500, 4500,
    '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500"]',
    '[{"name": "น้ำเงินเข้ม", "name_en": "Navy", "value": "#1e3a8a"}, {"name": "เทา", "name_en": "Gray", "value": "#6b7280"}, {"name": "เบจ", "name_en": "Beige", "value": "#d2b48c"}]',
    '[{"name": "1 ที่นั่ง", "name_en": "1-seat", "price": 2299}, {"name": "2 ที่นั่ง", "name_en": "2-seat", "price": 2799}, {"name": "3 ที่นั่ง", "name_en": "3-seat", "price": 3299}]',
    '{"th": ["ผ้ากำมะหยี่คุณภาพพรีเมียม", "ยืดหยุ่นได้ดี พอดีกับโซฟาทุกรูปทรง", "ป้องกันรอยขีดข่วนและคราบสกปรก", "ซักเครื่องได้ ง่ายต่อการดูแล", "สีไม่ตก ไม่ซีด"], "en": ["Premium quality velvet fabric", "Highly stretchable, fits all sofa shapes", "Protects against scratches and stains", "Machine washable, easy to care", "Colorfast, fade-resistant"]}',
    '{"material": {"th": "กำมะหยี่ 95% โพลีเอสเตอร์ 5% สแปนเด็กซ์", "en": "95% Polyester Velvet, 5% Spandex"}, "care": {"th": "ซักเครื่องน้ำเย็น ห้ามฟอกขาว", "en": "Machine wash cold, do not bleach"}, "origin": {"th": "ผลิตในประเทศไทย", "en": "Made in Thailand"}, "warranty": {"th": "รับประกัน 1 ปี", "en": "1 Year Warranty"}}',
    25, 'active', 4.8, 124, 89, true, 21
),
(
    'ผ้าคลุมโซฟากันน้ำยืดหยุ่น',
    'Waterproof Stretch Sofa Cover',
    'ผ้าคลุมโซฟากันน้ำที่ยืดหยุ่นได้ดี เหมาะสำหรับครอบครัวที่มีเด็กเล็กและสัตว์เลี้ยง ป้องกันน้ำและคราบสกปรกได้อย่างมีประสิทธิภาพ',
    'Waterproof stretch sofa cover perfect for families with children and pets. Effectively protects against water and stains.',
    'covers', 'custom', 1200, 3800,
    '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"]',
    '[{"name": "น้ำตาล", "name_en": "Brown", "value": "#8b4513"}, {"name": "ดำ", "name_en": "Black", "value": "#000000"}, {"name": "ครีม", "name_en": "Cream", "value": "#f5f5dc"}]',
    '[{"name": "1 ที่นั่ง", "name_en": "1-seat", "price": 1599}, {"name": "2 ที่นั่ง", "name_en": "2-seat", "price": 2199}, {"name": "3 ที่นั่ง", "name_en": "3-seat", "price": 2799}]',
    '{"th": ["ผ้ากันน้ำคุณภาพสูง", "ยืดหยุ่นได้ดีเยี่ยม", "ป้องกันคราบสกปรกและของเหลว", "ง่ายต่อการทำความสะอาด", "เหมาะสำหรับครอบครัวที่มีเด็กและสัตว์เลี้ยง"], "en": ["High-quality waterproof fabric", "Excellent stretchability", "Protects against stains and liquids", "Easy to clean", "Perfect for families with children and pets"]}',
    '{"material": {"th": "โพลีเอสเตอร์กันน้ำ 90% สแปนเด็กซ์ 10%", "en": "90% Waterproof Polyester, 10% Spandex"}, "care": {"th": "ซักเครื่องน้ำอุ่น ห้ามใช้ผงซักฟอก", "en": "Machine wash warm, no bleach"}, "origin": {"th": "ผลิตในประเทศไทย", "en": "Made in Thailand"}, "warranty": {"th": "รับประกัน 1 ปี", "en": "1 Year Warranty"}}',
    18, 'active', 4.6, 89, 67, false, 20
),
(
    'หมอนอิงลายเดียวกัน',
    'Matching Throw Pillows',
    'หมอนอิงที่ออกแบบให้เข้ากับผ้าคลุมโซฟา ช่วยเพิ่มความสวยงามและความสะดวกสบายให้กับห้องนั่งเล่นของคุณ',
    'Throw pillows designed to match your sofa covers, adding beauty and comfort to your living room.',
    'accessories', 'fixed', 350, null, null,
    '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"]',
    '[{"name": "หลากสี", "name_en": "Various Colors", "value": "#e5e7eb"}]',
    null,
    '{"th": ["ผ้าเดียวกับผ้าคลุมโซฟา", "ขนาดมาตรฐาน 45x45 ซม.", "ไส้หมอนคุณภาพดี", "ซิปถอดซักได้", "สีและลายหลากหลาย"], "en": ["Same fabric as sofa covers", "Standard size 45x45 cm", "High-quality pillow filling", "Removable zipper cover", "Various colors and patterns"]}',
    '{"material": {"th": "ผ้าเดียวกับผ้าคลุมโซฟาที่เลือก", "en": "Same fabric as selected sofa cover"}, "care": {"th": "ซักเครื่องตามคำแนะนำของผ้าคลุมโซฟา", "en": "Follow sofa cover care instructions"}, "origin": {"th": "ผลิตในประเทศไทย", "en": "Made in Thailand"}, "warranty": {"th": "รับประกัน 6 เดือน", "en": "6 Months Warranty"}}',
    5, 'low_stock', 4.4, 156, 234, false, 0
),
(
    'คลิปยึดผ้าคลุมโซฟา',
    'Sofa Cover Clips',
    'คลิปยึดผ้าคลุมโซฟาให้แน่นและเรียบร้อย ป้องกันผ้าคลุมเลื่อนหลุด ใช้งานง่าย ไม่ทำลายผ้า',
    'Clips to secure sofa covers firmly and neatly. Prevents cover slipping, easy to use, fabric-safe.',
    'accessories', 'fixed', 120, null, null,
    '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500"]',
    '[{"name": "ใส", "name_en": "Clear", "value": "#ffffff"}]',
    null,
    '{"th": ["ยึดผ้าคลุมให้แน่น", "ไม่ทำลายผ้า", "ใช้งานง่าย", "ขนาดเล็กกะทัดรัด", "แพ็ค 20 ชิ้น"], "en": ["Secures covers firmly", "Fabric-safe", "Easy to use", "Compact size", "Pack of 20 pieces"]}',
    '{"material": {"th": "พลาสติกคุณภาพสูง", "en": "High-quality plastic"}, "care": {"th": "เช็ดทำความสะอาดด้วยผ้าชื้น", "en": "Clean with damp cloth"}, "origin": {"th": "ผลิตในประเทศไทย", "en": "Made in Thailand"}, "warranty": {"th": "รับประกัน 3 เดือน", "en": "3 Months Warranty"}}',
    0, 'out_of_stock', 4.2, 203, 445, false, 0
),
(
    'น้ำยาทำความสะอาดผ้า',
    'Fabric Cleaner',
    'น้ำยาทำความสะอาดผ้าเฉพาะสำหรับผ้าคลุมโซฟา ขจัดคราบสกปรกได้อย่างมีประสิทธิภาพ ไม่ทำลายเนื้อผ้า',
    'Specialized fabric cleaner for sofa covers. Effectively removes stains without damaging fabric.',
    'accessories', 'fixed', 280, null, null,
    '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"]',
    '[{"name": "ใส", "name_en": "Clear", "value": "#ffffff"}]',
    null,
    '{"th": ["ขจัดคราบได้ดี", "ไม่ทำลายเนื้อผ้า", "กลิ่นหอมอ่อนๆ", "ขนาด 500ml", "ปลอดภัยต่อเด็กและสัตว์เลี้ยง"], "en": ["Effective stain removal", "Fabric-safe formula", "Light pleasant scent", "500ml bottle", "Safe for children and pets"]}',
    '{"material": {"th": "สารทำความสะอาดธรรมชาติ", "en": "Natural cleaning agents"}, "care": {"th": "เก็บในที่แห้งและเย็น", "en": "Store in cool, dry place"}, "origin": {"th": "ผลิตในประเทศไทย", "en": "Made in Thailand"}, "warranty": {"th": "รับประกันคุณภาพ", "en": "Quality guaranteed"}}',
    42, 'active', 4.3, 78, 156, false, 0
);

-- Insert sample customers
INSERT INTO customers (
    name, email, phone, address, total_orders, total_spent, average_order_value,
    last_order_date, status, customer_type, favorite_category, notes
) VALUES 
(
    'คุณสมชาย ใจดี',
    'somchai@email.com',
    '081-234-5678',
    '123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110',
    5, 12450, 2490, '2024-01-25', 'active', 'vip', 'covers',
    'ลูกค้า VIP ชอบสั่งผ้าคลุมโซฟาพรีเมียม'
),
(
    'คุณสมหญิง รักสวย',
    'somying@email.com',
    '082-345-6789',
    '456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    3, 5670, 1890, '2024-01-24', 'active', 'regular', 'accessories', ''
),
(
    'คุณสมศักดิ์ มีเงิน',
    'somsak@email.com',
    '083-456-7890',
    '789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    2, 8400, 4200, '2024-01-23', 'active', 'premium', 'covers',
    'ชอบสินค้าราคาสูง คุณภาพดี'
),
(
    'คุณสมปอง ชอบช้อป',
    'sompong@email.com',
    '084-567-8901',
    '321 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    8, 3240, 405, '2024-01-22', 'active', 'frequent', 'accessories',
    'ชอบซื้อของเสริมเล็กๆ บ่อยๆ'
),
(
    'คุณสมใจ รอสินค้า',
    'somjai@email.com',
    '085-678-9012',
    '654 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400',
    1, 1890, 1890, '2024-01-21', 'inactive', 'new', 'covers',
    'ลูกค้าใหม่ ยกเลิกคำสั่งซื้อแรก'
),
(
    'คุณสมศรี ซื้อเยอะ',
    'somsri@email.com',
    '086-789-0123',
    '987 ถนนลาดพร้าว แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพฯ 10230',
    12, 18900, 1575, '2024-01-20', 'active', 'vip', 'covers',
    'ลูกค้าประจำ ซื้อเป็นประจำทุกเดือน'
);

-- Insert sample orders
INSERT INTO orders (
    id, customer_id, items, total, status, payment_status, payment_method,
    shipping_address, estimated_delivery, notes
) VALUES 
(
    'ORD-001',
    (SELECT id FROM customers WHERE email = 'somchai@email.com'),
    '[{"product_id": "1", "name": "ผ้าคลุมโซฟากำมะหยี่พรีเมียม", "quantity": 1, "price": 2890, "specifications": "โซฟา 3 ที่นั่ง, สีน้ำเงินเข้ม"}]',
    2890, 'pending', 'paid', 'bank_transfer',
    '123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110',
    '2024-02-05',
    'ลูกค้าขอให้รีบ เพราะมีงานเลี้ยงที่บ้าน'
),
(
    'ORD-002',
    (SELECT id FROM customers WHERE email = 'somying@email.com'),
    '[{"product_id": "2", "name": "ผ้าคลุมโซฟากันน้ำ", "quantity": 1, "price": 1650, "specifications": "โซฟา 2 ที่นั่ง, สีเทา"}, {"product_id": "3", "name": "หมอนอิงลายเดียวกัน", "quantity": 2, "price": 350, "specifications": "ขนาด 45x45 ซม."}]',
    2350, 'production', 'paid', 'promptpay',
    '456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    '2024-02-08', ''
),
(
    'ORD-003',
    (SELECT id FROM customers WHERE email = 'somsak@email.com'),
    '[{"product_id": "1", "name": "ผ้าคลุมโซฟาเซ็กชั่นแนล", "quantity": 1, "price": 4200, "specifications": "โซฟา L-Shape, สีครีม"}]',
    4200, 'shipped', 'paid', 'bank_transfer',
    '789 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    '2024-01-26', ''
),
(
    'ORD-004',
    (SELECT id FROM customers WHERE email = 'sompong@email.com'),
    '[{"product_id": "5", "name": "น้ำยาทำความสะอาดผ้า", "quantity": 2, "price": 280, "specifications": "ขนาด 500ml"}]',
    560, 'completed', 'paid', 'cod',
    '321 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    '2024-01-24', ''
),
(
    'ORD-005',
    (SELECT id FROM customers WHERE email = 'somjai@email.com'),
    '[{"product_id": "2", "name": "ผ้าคลุมโซฟาแบบยืดหยุ่น", "quantity": 1, "price": 1890, "specifications": "โซฟา 3 ที่นั่ง, สีน้ำตาล"}]',
    1890, 'cancelled', 'refunded', 'bank_transfer',
    '654 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400',
    null, 'ลูกค้ายกเลิกเพราะเปลี่ยนใจ'
);

-- Insert sample analytics data
INSERT INTO analytics (date, revenue, orders_count, customers_count,
    'ลูกค้ายกเลิกเพราะเปลี่ยนใจ'
);

-- Insert sample analytics data
INSERT INTO analytics (date, revenue, orders_count, customers_count, new_customers, product_sales, category_sales, payment_methods, shipping_areas) VALUES 
('2024-01-01', 45230, 23, 18, 3, '{"1": 12, "2": 8, "3": 15, "4": 25, "5": 10}', '{"covers": 65, "accessories": 35}', '{"bank_transfer": 15, "promptpay": 6, "cod": 2}', '{"กรุงเทพฯ": 12, "ปริมณฑล": 8, "ต่างจังหวัด": 3}'),
('2024-01-02', 52100, 28, 22, 4, '{"1": 15, "2": 10, "3": 18, "4": 20, "5": 12}', '{"covers": 70, "accessories": 30}', '{"bank_transfer": 18, "promptpay": 8, "cod": 2}', '{"กรุงเทพฯ": 15, "ปริมณฑล": 10, "ต่างจังหวัด": 3}'),
('2024-01-03', 48900, 25, 20, 2, '{"1": 13, "2": 9, "3": 16, "4": 22, "5": 11}', '{"covers": 68, "accessories": 32}', '{"bank_transfer": 16, "promptpay": 7, "cod": 2}', '{"กรุงเทพฯ": 13, "ปริมณฑล": 9, "ต่างจังหวัด": 3}'),
('2024-01-04', 61200, 32, 26, 5, '{"1": 18, "2": 12, "3": 20, "4": 28, "5": 14}', '{"covers": 72, "accessories": 28}', '{"bank_transfer": 20, "promptpay": 10, "cod": 2}', '{"กรุงเทพฯ": 18, "ปริมณฑล": 12, "ต่างจังหวัด": 2}'),
('2024-01-05', 58700, 30, 24, 3, '{"1": 16, "2": 11, "3": 19, "4": 26, "5": 13}', '{"covers": 69, "accessories": 31}', '{"bank_transfer": 19, "promptpay": 9, "cod": 2}', '{"กรุงเทพฯ": 16, "ปริมณฑล": 11, "ต่างจังหวัด": 3}');

-- Insert admin users
INSERT INTO admin_users (name, email, password_hash, role, status) VALUES 
('ผู้ดูแลระบบหลัก', 'admin@sofacover.com', '$2b$10$example_hash_for_admin_password', 'admin', 'active'),
('พนักงานขาย', 'sales@sofacover.com', '$2b$10$example_hash_for_staff_password', 'staff', 'active');

-- Insert default settings
INSERT INTO settings (category, key, value) VALUES 
('store', 'name', '"ร้านผ้าคลุมโซฟาพรีเมียม"'),
('store', 'description', '"ผ้าคลุมโซฟาคุณภาพสูง ออกแบบเฉพาะตัว"'),
('store', 'email', '"info@sofacover.com"'),
('store', 'phone', '"02-123-4567"'),
('store', 'address', '"123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110"'),
('store', 'currency', '"THB"'),
('store', 'timezone', '"Asia/Bangkok"'),
('store', 'language', '"th"'),
('payment', 'bank_transfer', 'true'),
('payment', 'promptpay', 'true'),
('payment', 'cod', 'true'),
('payment', 'credit_card', 'false'),
('payment', 'bank_account', '"123-456-7890"'),
('payment', 'bank_name', '"ธนาคารกสิกรไทย"'),
('payment', 'promptpay_id', '"0812345678"'),
('payment', 'cod_fee', '30'),
('shipping', 'free_shipping_threshold', '1000'),
('shipping', 'standard_shipping_fee', '50'),
('shipping', 'express_shipping_fee', '100'),
('shipping', 'processing_days', '3'),
('shipping', 'standard_delivery_days', '5'),
('shipping', 'express_delivery_days', '2'),
('notifications', 'email_new_order', 'true'),
('notifications', 'email_low_stock', 'true'),
('notifications', 'email_customer_message', 'true'),
('notifications', 'sms_new_order', 'false'),
('notifications', 'sms_low_stock', 'true'),
('notifications', 'line_notify', 'true'),
('security', 'two_factor_auth', 'false'),
('security', 'session_timeout', '60'),
('security', 'password_policy', '"strong"'),
('security', 'login_attempts', '5');
