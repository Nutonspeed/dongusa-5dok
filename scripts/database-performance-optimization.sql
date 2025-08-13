-- Database Performance Optimization for SofaCover Pro
-- This script creates indexes, functions, and optimizations for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_status ON products(category, status);
CREATE INDEX IF NOT EXISTS idx_products_status_created_at ON products(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(bestseller) WHERE bestseller = true;
CREATE INDEX IF NOT EXISTS idx_products_stock_low ON products(stock) WHERE stock <= 10;
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price_range_min, price_range_max);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_type_status ON customers(customer_type, status);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customers_last_order ON customers(last_order_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING gin(to_tsvector('english', name || ' ' || email));
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_month ON orders(date_trunc('month', created_at));
CREATE INDEX IF NOT EXISTS idx_orders_total ON orders(total DESC);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_date_range ON analytics(date) WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- Fabric collections indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_fabric_collections_category ON fabric_collections(category);
CREATE INDEX IF NOT EXISTS idx_fabrics_collection_id ON fabrics(collection_id);

-- =============================================
-- PERFORMANCE FUNCTIONS
-- =============================================

-- Function to get dashboard statistics efficiently
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    product_stats JSON;
    customer_stats JSON;
    order_stats JSON;
    recent_activity JSON;
BEGIN
    -- Get product statistics
    SELECT json_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'lowStock', COUNT(*) FILTER (WHERE stock <= 10),
        'outOfStock', COUNT(*) FILTER (WHERE stock = 0)
    ) INTO product_stats
    FROM products;

    -- Get customer statistics
    SELECT json_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'vip', COUNT(*) FILTER (WHERE customer_type = 'vip'),
        'totalRevenue', COALESCE(SUM(total_spent), 0)
    ) INTO customer_stats
    FROM customers;

    -- Get order statistics (last 30 days)
    SELECT json_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'monthlyRevenue', COALESCE(SUM(total), 0),
        'averageOrderValue', COALESCE(AVG(total), 0)
    ) INTO order_stats
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

    -- Get recent activity
    SELECT json_agg(
        json_build_object(
            'id', id,
            'type', 'order',
            'description', 'New order #' || id,
            'amount', total,
            'created_at', created_at
        )
    ) INTO recent_activity
    FROM (
        SELECT id, total, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 10
    ) recent_orders;

    -- Combine all statistics
    result := json_build_object(
        'products', product_stats,
        'customers', customer_stats,
        'orders', order_stats,
        'recentActivity', COALESCE(recent_activity, '[]'::json)
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function for efficient product search
CREATE OR REPLACE FUNCTION search_products(
    search_term TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    status_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    name_en TEXT,
    description TEXT,
    category TEXT,
    price DECIMAL,
    images JSONB,
    stock INTEGER,
    status TEXT,
    rating DECIMAL,
    bestseller BOOLEAN,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.name_en,
        p.description,
        p.category,
        p.price,
        p.images,
        p.stock,
        p.status,
        p.rating,
        p.bestseller,
        p.created_at
    FROM products p
    WHERE 
        (search_term IS NULL OR to_tsvector('english', p.name || ' ' || p.description) @@ plainto_tsquery('english', search_term))
        AND (category_filter IS NULL OR category_filter = 'all' OR p.category = category_filter)
        AND (status_filter IS NULL OR status_filter = 'all' OR p.status = status_filter)
    ORDER BY 
        CASE WHEN p.bestseller THEN 0 ELSE 1 END,
        p.rating DESC,
        p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function for customer analytics
CREATE OR REPLACE FUNCTION get_customer_analytics(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'newCustomers', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back),
        'activeCustomers', COUNT(*) FILTER (WHERE status = 'active'),
        'customersByType', json_object_agg(customer_type, type_count),
        'topCustomers', json_agg(
            json_build_object(
                'id', id,
                'name', name,
                'totalSpent', total_spent,
                'totalOrders', total_orders
            )
        )
    ) INTO result
    FROM (
        SELECT 
            id, name, total_spent, total_orders, customer_type, status, created_at,
            COUNT(*) OVER (PARTITION BY customer_type) as type_count
        FROM customers
        ORDER BY total_spent DESC
        LIMIT 10
    ) customer_data
    GROUP BY customer_type;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- =============================================

-- Materialized view for product statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_stats AS
SELECT 
    category,
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE status = 'active') as active_products,
    COUNT(*) FILTER (WHERE stock <= 10) as low_stock_products,
    AVG(rating) as average_rating,
    SUM(sold_count) as total_sold,
    MAX(created_at) as last_updated
FROM products
GROUP BY category;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS mv_product_stats_category_idx ON mv_product_stats(category);

-- Materialized view for customer segments
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_customer_segments AS
SELECT 
    customer_type,
    COUNT(*) as customer_count,
    AVG(total_spent) as avg_spent,
    AVG(total_orders) as avg_orders,
    SUM(total_spent) as total_revenue
FROM customers
WHERE status = 'active'
GROUP BY customer_type;

CREATE UNIQUE INDEX IF NOT EXISTS mv_customer_segments_type_idx ON mv_customer_segments(customer_type);

-- =============================================
-- TRIGGERS FOR CACHE INVALIDATION
-- =============================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh product stats when products change
    IF TG_TABLE_NAME = 'products' THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_stats;
    END IF;

    -- Refresh customer segments when customers change
    IF TG_TABLE_NAME = 'customers' THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_segments;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic refresh
DROP TRIGGER IF EXISTS trigger_refresh_product_stats ON products;
CREATE TRIGGER trigger_refresh_product_stats
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_materialized_views();

DROP TRIGGER IF EXISTS trigger_refresh_customer_segments ON customers;
CREATE TRIGGER trigger_refresh_customer_segments
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_materialized_views();

-- =============================================
-- PERFORMANCE MONITORING
-- =============================================

-- Table to track slow queries (optional)
CREATE TABLE IF NOT EXISTS query_performance_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_name TEXT NOT NULL,
    execution_time_ms DECIMAL NOT NULL,
    parameters JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance log
CREATE INDEX IF NOT EXISTS idx_query_performance_log_created_at ON query_performance_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_performance_log_slow ON query_performance_log(execution_time_ms DESC);

-- Function to log slow queries
CREATE OR REPLACE FUNCTION log_slow_query(
    query_name TEXT,
    execution_time_ms DECIMAL,
    parameters JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Only log queries slower than 100ms
    IF execution_time_ms > 100 THEN
        INSERT INTO query_performance_log (query_name, execution_time_ms, parameters)
        VALUES (query_name, execution_time_ms, parameters);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CLEANUP AND MAINTENANCE
-- =============================================

-- Function to clean old performance logs
CREATE OR REPLACE FUNCTION cleanup_performance_logs()
RETURNS VOID AS $$
BEGIN
    DELETE FROM query_performance_log 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-performance-logs', '0 2 * * *', 'SELECT cleanup_performance_logs();');

-- Initial refresh of materialized views
REFRESH MATERIALIZED VIEW mv_product_stats;
REFRESH MATERIALIZED VIEW mv_customer_segments;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION search_products(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_analytics(INTEGER) TO authenticated;
GRANT SELECT ON mv_product_stats TO authenticated;
GRANT SELECT ON mv_customer_segments TO authenticated;

-- Performance optimization complete
SELECT 'Database performance optimization completed successfully!' as status;
