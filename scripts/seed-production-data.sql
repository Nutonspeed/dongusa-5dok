-- Create production-ready seed data for Supabase
-- Insert fabric collections
INSERT INTO fabric_collections (id, name, description, slug, image_url, is_featured, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Modern Minimalist', 'Clean lines and neutral tones perfect for contemporary spaces', 'modern-minimalist', '/modern-minimalist-fabric-pattern-1.png', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'Classic Elegant', 'Timeless patterns and rich textures for sophisticated interiors', 'classic-elegant', '/classic-elegant-fabric-pattern-1.png', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'Bohemian Chic', 'Vibrant colors and artistic designs for eclectic spaces', 'bohemian-chic', '/bohemian-chic-fabric-pattern-1.png', false, true),
('550e8400-e29b-41d4-a716-446655440004', 'Luxury Premium', 'High-end materials and exclusive designs', 'luxury-premium', '/modern-minimalist-fabric-pattern-2.png', true, true);

-- Insert categories
INSERT INTO categories (id, name, description, slug, image_url, is_active) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Sofa Covers', 'Premium sofa covers for all sizes', 'sofa-covers', '/sofa-covers-category.png', true),
('660e8400-e29b-41d4-a716-446655440002', 'Custom Covers', 'Made-to-measure furniture covers', 'custom-covers', '/custom-covers-category.png', true),
('660e8400-e29b-41d4-a716-446655440003', 'Accessories', 'Cushions, pillows and matching accessories', 'accessories', '/accessories-category.png', true);

-- Insert products
INSERT INTO products (id, name, description, price, compare_at_price, sku, category_id, stock_quantity, images, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Premium Velvet Sofa Cover', 'Luxurious velvet sofa cover with perfect fit guarantee', 2890.00, 3490.00, 'SOF-VEL-001', '660e8400-e29b-41d4-a716-446655440001', 25, ARRAY['/modern-living-room-sofa-covers.png'], true),
('770e8400-e29b-41d4-a716-446655440002', 'Waterproof Sofa Protector', 'Durable waterproof cover perfect for families with pets', 1950.00, 2290.00, 'SOF-WP-002', '660e8400-e29b-41d4-a716-446655440001', 40, ARRAY['/waterproof-sofa-cover.png'], true),
('770e8400-e29b-41d4-a716-446655440003', 'Custom Sectional Cover', 'Made-to-measure sectional sofa cover', 4200.00, 4990.00, 'SOF-SEC-003', '660e8400-e29b-41d4-a716-446655440002', 15, ARRAY['/sectional-sofa-cover.png'], true);

-- Insert fabrics
INSERT INTO fabrics (id, name, material, color, pattern, price_per_meter, collection_id, image_url, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Arctic White', 'Cotton Blend', 'White', 'Solid', 890.00, '550e8400-e29b-41d4-a716-446655440001', '/arctic-white-fabric.png', true),
('880e8400-e29b-41d4-a716-446655440002', 'Stone Gray', 'Linen Blend', 'Gray', 'Textured', 1190.00, '550e8400-e29b-41d4-a716-446655440001', '/stone-gray-fabric.png', true),
('880e8400-e29b-41d4-a716-446655440003', 'Royal Navy Damask', 'Jacquard', 'Navy', 'Damask', 1590.00, '550e8400-e29b-41d4-a716-446655440002', '/royal-navy-damask.png', true);

-- Added comprehensive sample data for customers, orders, and analytics
-- Insert sample customers
INSERT INTO customers (id, first_name, last_name, email, phone, address, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'สมชาย', 'ใจดี', 'somchai@email.com', '081-234-5678', '123 ถนนสุขุมวิท กรุงเทพฯ 10110', NOW() - INTERVAL '30 days'),
('990e8400-e29b-41d4-a716-446655440002', 'สมหญิง', 'รักดี', 'somying@email.com', '082-345-6789', '456 ถนนพหลโยธิน กรุงเทพฯ 10400', NOW() - INTERVAL '25 days'),
('990e8400-e29b-41d4-a716-446655440003', 'วิชัย', 'มั่งมี', 'wichai@email.com', '083-456-7890', '789 ถนนรัชดาภิเษก กรุงเทพฯ 10320', NOW() - INTERVAL '20 days');

-- Insert sample orders
INSERT INTO orders (id, customer_id, customer_name, customer_phone, customer_email, total_amount, status, channel, shipping_address, notes, created_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'สมชาย ใจดี', '081-234-5678', 'somchai@email.com', 2890.00, 'delivered', 'website', '123 ถนนสุขุมวิท กรุงเทพฯ 10110', 'ลูกค้าต้องการสีเทาอ่อน', NOW() - INTERVAL '15 days'),
('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 'สมหญิง รักดี', '082-345-6789', 'somying@email.com', 1950.00, 'production', 'facebook', '456 ถนนพหลโยธิน กรุงเทพฯ 10400', 'รีบใช้ภายใน 1 สัปดาห์', NOW() - INTERVAL '10 days'),
('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', 'วิชัย มั่งมี', '083-456-7890', 'wichai@email.com', 4200.00, 'pending', 'line', '789 ถนนรัชดาภิเษก กรุงเทพฯ 10320', 'โซฟา L-Shape ขนาดใหญ่', NOW() - INTERVAL '5 days'),
('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', 'สมชาย ใจดี', '081-234-5678', 'somchai@email.com', 3200.00, 'confirmed', 'phone', '123 ถนนสุขุมวิท กรุงเทพฯ 10110', 'ออร์เดอร์ที่ 2 ของลูกค้า', NOW() - INTERVAL '3 days'),
('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440002', 'สมหญิง รักดี', '082-345-6789', 'somying@email.com', 1590.00, 'ready', 'website', '456 ถนนพหลโยธิน กรุงเทพฯ 10400', 'พร้อมจัดส่ง', NOW() - INTERVAL '2 days');

-- Insert order items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Premium Velvet Sofa Cover', 1, 2890.00, 2890.00),
('bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Waterproof Sofa Protector', 1, 1950.00, 1950.00),
('bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Custom Sectional Cover', 1, 4200.00, 4200.00);

-- Insert analytics data
INSERT INTO analytics (id, metric_name, metric_value, date_recorded, metadata) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'daily_revenue', 12340.00, CURRENT_DATE - INTERVAL '1 day', '{"orders_count": 5, "avg_order_value": 2468}'),
('cc0e8400-e29b-41d4-a716-446655440002', 'daily_orders', 5, CURRENT_DATE - INTERVAL '1 day', '{"new_customers": 2, "returning_customers": 3}'),
('cc0e8400-e29b-41d4-a716-446655440003', 'monthly_revenue', 156780.00, DATE_TRUNC('month', CURRENT_DATE), '{"growth_rate": 15.5, "target": 180000}'),
('cc0e8400-e29b-41d4-a716-446655440004', 'customer_satisfaction', 4.8, CURRENT_DATE, '{"total_reviews": 124, "five_star": 89}');

-- Update product stock and sales data
UPDATE products SET 
  stock_quantity = CASE 
    WHEN id = '770e8400-e29b-41d4-a716-446655440001' THEN 23  -- Sold 2
    WHEN id = '770e8400-e29b-41d4-a716-446655440002' THEN 39  -- Sold 1
    WHEN id = '770e8400-e29b-41d4-a716-446655440003' THEN 14  -- Sold 1
    ELSE stock_quantity
  END,
  metadata = CASE
    WHEN id = '770e8400-e29b-41d4-a716-446655440001' THEN '{"sold_count": 67, "rating": 4.8, "reviews": 45}'
    WHEN id = '770e8400-e29b-41d4-a716-446655440002' THEN '{"sold_count": 89, "rating": 4.6, "reviews": 32}'
    WHEN id = '770e8400-e29b-41d4-a716-446655440003' THEN '{"sold_count": 23, "rating": 4.9, "reviews": 18}'
    ELSE metadata
  END;
