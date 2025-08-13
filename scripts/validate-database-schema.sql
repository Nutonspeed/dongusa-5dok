-- Database Schema Validation Script
-- This script validates the current database schema against expected structure

-- Check if all required tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    expected_tables TEXT[] := ARRAY[
        'profiles', 'categories', 'products', 'orders', 'order_items',
        'fabric_collections', 'fabrics'
    ];
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All required tables exist';
    END IF;
END $$;

-- Check if all required columns exist in key tables
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check profiles table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        missing_columns := array_append(missing_columns, 'profiles.role');
    END IF;
    
    -- Check products table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
        missing_columns := array_append(missing_columns, 'products.stock_quantity');
    END IF;
    
    -- Check orders table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        missing_columns := array_append(missing_columns, 'orders.payment_status');
    END IF;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All required columns exist';
    END IF;
END $$;

-- Check RLS policies
DO $$
DECLARE
    missing_policies TEXT[] := ARRAY[]::TEXT[];
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles' 
        AND policyname LIKE '%own profile%'
    ) THEN
        missing_policies := array_append(missing_policies, 'profiles RLS policies');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'orders' 
        AND policyname LIKE '%own orders%'
    ) THEN
        missing_policies := array_append(missing_policies, 'orders RLS policies');
    END IF;
    
    IF array_length(missing_policies, 1) > 0 THEN
        RAISE NOTICE 'Missing RLS policies: %', array_to_string(missing_policies, ', ');
    ELSE
        RAISE NOTICE 'All required RLS policies exist';
    END IF;
END $$;

-- Validate data integrity
SELECT 
    'Data Validation Results' as check_type,
    (SELECT COUNT(*) FROM categories WHERE is_active = true) as active_categories,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
    (SELECT COUNT(*) FROM fabric_collections WHERE is_active = true) as active_collections,
    (SELECT COUNT(*) FROM fabrics WHERE is_active = true) as active_fabrics;

-- Check for orphaned records
SELECT 
    'Orphaned Records Check' as check_type,
    (SELECT COUNT(*) FROM products WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM categories)) as orphaned_products,
    (SELECT COUNT(*) FROM fabrics WHERE collection_id IS NOT NULL AND collection_id NOT IN (SELECT id FROM fabric_collections)) as orphaned_fabrics,
    (SELECT COUNT(*) FROM order_items WHERE product_id IS NOT NULL AND product_id NOT IN (SELECT id FROM products)) as orphaned_order_items;

-- Performance check - ensure indexes exist
DO $$
DECLARE
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'products' AND indexname LIKE '%category%') THEN
        missing_indexes := array_append(missing_indexes, 'products.category_id index');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'orders' AND indexname LIKE '%user%') THEN
        missing_indexes := array_append(missing_indexes, 'orders.user_id index');
    END IF;
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE NOTICE 'Missing indexes: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE 'All required indexes exist';
    END IF;
END $$;

RAISE NOTICE 'Database schema validation completed';
