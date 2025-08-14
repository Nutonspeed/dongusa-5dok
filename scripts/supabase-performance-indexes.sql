-- สร้าง indexes เพิ่มเติมสำหรับ Supabase performance optimization
-- Advanced Supabase Performance Optimization Indexes
-- This script creates comprehensive indexes for optimal query performance

-- Products table performance indexes
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(category_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price) WHERE price > 0;
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_quantity) WHERE stock_quantity >= 0;
CREATE INDEX IF NOT EXISTS idx_products_search_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_search_description ON products USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_products_slug_unique ON products(slug) WHERE slug IS NOT NULL;

-- Orders table performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status, status);
CREATE INDEX IF NOT EXISTS idx_orders_date_range ON orders(created_at DESC, total_amount);
CREATE INDEX IF NOT EXISTS idx_orders_monthly_revenue ON orders(date_trunc('month', created_at), total_amount) WHERE payment_status = 'paid';

-- Order items performance indexes
CREATE INDEX IF NOT EXISTS idx_order_items_product_quantity ON order_items(product_id, quantity);
CREATE INDEX IF NOT EXISTS idx_order_items_order_total ON order_items(order_id, price, quantity);

-- Profiles table performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role_active ON profiles(role, created_at) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email) WHERE email IS NOT NULL;

-- Fabric collections performance indexes
CREATE INDEX IF NOT EXISTS idx_fabric_collections_featured ON fabric_collections(is_featured, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_fabric_collections_slug ON fabric_collections(slug) WHERE slug IS NOT NULL;

-- Fabrics table performance indexes
CREATE INDEX IF NOT EXISTS idx_fabrics_collection_active ON fabrics(collection_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_fabrics_price_range ON fabrics(price_per_meter) WHERE price_per_meter > 0;
CREATE INDEX IF NOT EXISTS idx_fabrics_material_color ON fabrics(material, color);

-- Categories performance indexes
CREATE INDEX IF NOT EXISTS idx_categories_active_slug ON categories(slug, is_active) WHERE is_active = true;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category_price_stock ON products(category_id, price, stock_quantity) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_date_status ON orders(user_id, created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_fabrics_collection_price_material ON fabrics(collection_id, price_per_meter, material) WHERE is_active = true;

-- Partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_products_bestsellers ON products(id, name, price) WHERE is_active = true AND stock_quantity > 0;
CREATE INDEX IF NOT EXISTS idx_orders_completed_revenue ON orders(created_at, total_amount) WHERE status = 'completed' AND payment_status = 'paid';
CREATE INDEX IF NOT EXISTS idx_fabrics_premium ON fabrics(id, name, price_per_meter) WHERE is_active = true AND price_per_meter > 500;

-- Performance optimization functions
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_products', (SELECT COUNT(*) FROM products WHERE is_active = true),
        'total_orders', (SELECT COUNT(*) FROM orders),
        'total_customers', (SELECT COUNT(*) FROM profiles WHERE role = 'customer'),
        'monthly_revenue', (
            SELECT COALESCE(SUM(total_amount), 0) 
            FROM orders 
            WHERE payment_status = 'paid' 
            AND created_at >= date_trunc('month', CURRENT_DATE)
        ),
        'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
        'low_stock_products', (SELECT COUNT(*) FROM products WHERE stock_quantity <= 10 AND is_active = true)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Optimized product search function
CREATE OR REPLACE FUNCTION search_products(
    search_term TEXT DEFAULT NULL,
    category_filter UUID DEFAULT NULL,
    min_price DECIMAL DEFAULT NULL,
    max_price DECIMAL DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    description TEXT,
    price NUMERIC,
    category_id UUID,
    images TEXT[],
    stock_quantity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category_id,
        p.images,
        p.stock_quantity,
        p.created_at
    FROM products p
    WHERE p.is_active = true
    AND (search_term IS NULL OR p.name ILIKE '%' || search_term || '%' OR p.description ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    ORDER BY 
        CASE WHEN search_term IS NOT NULL THEN
            ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', search_term))
        ELSE 0 END DESC,
        p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Optimized order history function
CREATE OR REPLACE FUNCTION get_user_orders(
    user_uuid UUID,
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    status TEXT,
    total_amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE,
    item_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.status::TEXT,
        o.total_amount,
        o.created_at,
        COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = user_uuid
    GROUP BY o.id, o.status, o.total_amount, o.created_at
    ORDER BY o.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring view
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE schemaname = 'public'
AND tablename IN ('products', 'orders', 'order_items', 'profiles', 'fabrics', 'fabric_collections', 'categories')
ORDER BY tablename, attname;

-- Query to analyze table sizes and index usage
CREATE OR REPLACE VIEW table_performance_stats AS
SELECT 
    t.tablename,
    pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
    pg_size_pretty(pg_relation_size(c.oid)) as table_size,
    pg_size_pretty(pg_total_relation_size(c.oid) - pg_relation_size(c.oid)) as index_size,
    (SELECT COUNT(*) FROM pg_stat_user_tables WHERE relname = t.tablename) as row_count
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size(c.oid) DESC;

-- Enable query performance tracking
ALTER SYSTEM SET track_activities = on;
ALTER SYSTEM SET track_counts = on;
ALTER SYSTEM SET track_io_timing = on;
ALTER SYSTEM SET track_functions = 'all';

-- Optimize PostgreSQL settings for better performance
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Update table statistics for better query planning
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE profiles;
ANALYZE fabrics;
ANALYZE fabric_collections;
ANALYZE categories;

COMMENT ON SCRIPT IS 'Comprehensive Supabase performance optimization with indexes, functions, and monitoring';
