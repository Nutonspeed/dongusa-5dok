-- Adding database indexes for better query performance
-- Performance optimization indexes for frequently queried columns

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Cart items table indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Fabric collections table indexes
CREATE INDEX IF NOT EXISTS idx_fabric_collections_name ON fabric_collections(name);

-- Reviews table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews');
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews');
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating) WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews');

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Adding composite indexes for common query patterns
-- Composite index for product filtering (category + price range)
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category_id, price);

-- Composite index for order history queries (user + date)
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders(user_id, created_at DESC);

-- Composite index for cart queries (user + product)
CREATE INDEX IF NOT EXISTS idx_cart_user_product ON cart_items(user_id, product_id);

-- Adding partial indexes for better performance on filtered queries
-- Index only active products
CREATE INDEX IF NOT EXISTS idx_products_active ON products(id) WHERE status = 'active';

-- Index only completed orders
CREATE INDEX IF NOT EXISTS idx_orders_completed ON orders(id, created_at) WHERE status = 'completed';

-- Optimizing existing queries with better indexes
-- Full-text search index for product descriptions
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));

-- Index for product sorting by popularity (assuming we track views/sales)
CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(id) WHERE price > 0;

-- Adding database maintenance functions
-- Function to analyze table statistics for better query planning
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE products;
    ANALYZE orders;
    ANALYZE order_items;
    ANALYZE cart_items;
    ANALYZE categories;
    ANALYZE fabric_collections;
    ANALYZE profiles;
END;
$$ LANGUAGE plpgsql;

-- Adding query optimization settings
-- Enable better query planning
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '4MB';

-- Reload configuration (requires superuser privileges)
-- SELECT pg_reload_conf();

COMMENT ON SCRIPT IS 'Database performance optimization with indexes and query improvements';
