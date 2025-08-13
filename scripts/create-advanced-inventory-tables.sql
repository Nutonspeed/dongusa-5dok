-- Advanced Inventory Management Tables
-- This script creates additional tables for advanced inventory features

-- Inventory Batches for batch tracking and expiration management
CREATE TABLE IF NOT EXISTS inventory_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory_advanced(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    manufacturing_date DATE NOT NULL,
    expiration_date DATE,
    quantity INTEGER NOT NULL DEFAULT 0,
    quality_grade VARCHAR(20) DEFAULT 'A' CHECK (quality_grade IN ('A', 'B', 'C', 'D')),
    supplier_batch_ref VARCHAR(100),
    storage_location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'recalled', 'quarantine')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT positive_batch_quantity CHECK (quantity >= 0),
    CONSTRAINT valid_dates CHECK (expiration_date IS NULL OR expiration_date > manufacturing_date)
);

-- Auto-reorder rules for automated inventory management
CREATE TABLE IF NOT EXISTS auto_reorder_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory_advanced(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('stock_level', 'time_based', 'demand_forecast')),
    trigger_value INTEGER NOT NULL,
    order_quantity INTEGER NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    conditions JSONB DEFAULT '{}',
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT positive_values CHECK (trigger_value > 0 AND order_quantity > 0)
);

-- Supplier performance tracking
CREATE TABLE IF NOT EXISTS supplier_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    on_time_deliveries INTEGER DEFAULT 0,
    quality_issues INTEGER DEFAULT 0,
    cost_variance_percentage DECIMAL(5,2) DEFAULT 0.00,
    lead_time_accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    overall_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (overall_rating >= 0.00 AND overall_rating <= 5.00),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_period CHECK (evaluation_period_end >= evaluation_period_start),
    CONSTRAINT valid_counts CHECK (on_time_deliveries <= total_orders AND quality_issues >= 0)
);

-- Inventory forecasting data
CREATE TABLE IF NOT EXISTS inventory_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory_advanced(id) ON DELETE CASCADE,
    forecast_period_start DATE NOT NULL,
    forecast_period_end DATE NOT NULL,
    predicted_demand INTEGER NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    seasonal_factor DECIMAL(5,2) DEFAULT 1.00,
    trend_factor DECIMAL(5,2) DEFAULT 1.00,
    external_factors JSONB DEFAULT '{}',
    actual_demand INTEGER, -- Filled after the period ends
    accuracy_score DECIMAL(3,2), -- Calculated after actual demand is known
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_forecast_period CHECK (forecast_period_end > forecast_period_start),
    CONSTRAINT positive_demand CHECK (predicted_demand >= 0)
);

-- Cost optimization tracking
CREATE TABLE IF NOT EXISTS cost_optimization_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    current_cost DECIMAL(12,2) NOT NULL,
    potential_saving DECIMAL(12,2) NOT NULL,
    implementation_effort VARCHAR(10) CHECK (implementation_effort IN ('low', 'medium', 'high')),
    priority_score INTEGER DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
    status VARCHAR(20) DEFAULT 'identified' CHECK (status IN ('identified', 'in_progress', 'implemented', 'rejected')),
    assigned_to UUID,
    target_completion_date DATE,
    actual_saving DECIMAL(12,2),
    implementation_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT positive_costs CHECK (current_cost >= 0 AND potential_saving >= 0)
);

-- Demand planning data
CREATE TABLE IF NOT EXISTS demand_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'quarterly', 'yearly')),
    plan_period DATE NOT NULL,
    base_demand INTEGER NOT NULL,
    seasonal_adjustment DECIMAL(5,2) DEFAULT 1.00,
    promotional_impact DECIMAL(5,2) DEFAULT 1.00,
    market_trend_impact DECIMAL(5,2) DEFAULT 1.00,
    final_demand_forecast INTEGER NOT NULL,
    confidence_level DECIMAL(3,2) NOT NULL CHECK (confidence_level >= 0.00 AND confidence_level <= 1.00),
    assumptions TEXT,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT positive_demand_values CHECK (base_demand >= 0 AND final_demand_forecast >= 0)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_inventory_batches_inventory_id ON inventory_batches(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_expiration ON inventory_batches(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_batches_status ON inventory_batches(status);

CREATE INDEX IF NOT EXISTS idx_auto_reorder_rules_inventory_id ON auto_reorder_rules(inventory_id);
CREATE INDEX IF NOT EXISTS idx_auto_reorder_rules_enabled ON auto_reorder_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_auto_reorder_rules_priority ON auto_reorder_rules(priority);

CREATE INDEX IF NOT EXISTS idx_supplier_performance_supplier_id ON supplier_performance_metrics(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_period ON supplier_performance_metrics(evaluation_period_start, evaluation_period_end);

CREATE INDEX IF NOT EXISTS idx_inventory_forecasts_inventory_id ON inventory_forecasts(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_forecasts_period ON inventory_forecasts(forecast_period_start, forecast_period_end);

CREATE INDEX IF NOT EXISTS idx_cost_optimization_status ON cost_optimization_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_cost_optimization_priority ON cost_optimization_opportunities(priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_demand_plans_product_id ON demand_plans(product_id);
CREATE INDEX IF NOT EXISTS idx_demand_plans_period ON demand_plans(plan_period);

-- Functions for advanced inventory management

-- Function to check for expiring batches
CREATE OR REPLACE FUNCTION check_expiring_batches(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
    batch_id UUID,
    inventory_id UUID,
    product_name VARCHAR,
    batch_number VARCHAR,
    expiration_date DATE,
    days_until_expiry INTEGER,
    quantity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.inventory_id,
        p.name,
        b.batch_number,
        b.expiration_date,
        (b.expiration_date - CURRENT_DATE)::INTEGER,
        b.quantity
    FROM inventory_batches b
    JOIN inventory_advanced i ON b.inventory_id = i.id
    JOIN products p ON i.product_id = p.id
    WHERE b.status = 'active'
    AND b.expiration_date IS NOT NULL
    AND b.expiration_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    ORDER BY b.expiration_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate supplier performance score
CREATE OR REPLACE FUNCTION calculate_supplier_performance(p_supplier_id UUID, p_period_months INTEGER DEFAULT 12)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    v_total_orders INTEGER;
    v_on_time_deliveries INTEGER;
    v_quality_issues INTEGER;
    v_performance_score DECIMAL(3,2);
BEGIN
    -- Get performance metrics for the specified period
    SELECT 
        COALESCE(SUM(total_orders), 0),
        COALESCE(SUM(on_time_deliveries), 0),
        COALESCE(SUM(quality_issues), 0)
    INTO v_total_orders, v_on_time_deliveries, v_quality_issues
    FROM supplier_performance_metrics
    WHERE supplier_id = p_supplier_id
    AND evaluation_period_start >= CURRENT_DATE - INTERVAL '1 month' * p_period_months;
    
    -- Calculate performance score (0-5 scale)
    IF v_total_orders = 0 THEN
        v_performance_score := 0.00;
    ELSE
        v_performance_score := (
            (v_on_time_deliveries::DECIMAL / v_total_orders * 2.5) + -- 50% weight for on-time delivery
            ((v_total_orders - v_quality_issues)::DECIMAL / v_total_orders * 2.5) -- 50% weight for quality
        );
    END IF;
    
    RETURN LEAST(v_performance_score, 5.00);
END;
$$ LANGUAGE plpgsql;

-- Function to generate auto-reorder recommendations
CREATE OR REPLACE FUNCTION generate_reorder_recommendations()
RETURNS TABLE(
    inventory_id UUID,
    product_name VARCHAR,
    current_stock INTEGER,
    reorder_level INTEGER,
    recommended_quantity INTEGER,
    supplier_name VARCHAR,
    urgency_level VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        p.name,
        i.quantity_available,
        i.reorder_level,
        GREATEST(i.reorder_quantity, CEIL(i.sales_velocity * 30))::INTEGER, -- At least 30 days of stock
        s.name,
        CASE 
            WHEN i.quantity_available <= i.reorder_level * 0.5 THEN 'critical'
            WHEN i.quantity_available <= i.reorder_level THEN 'high'
            WHEN i.quantity_available <= i.reorder_level * 1.5 THEN 'medium'
            ELSE 'low'
        END
    FROM inventory_advanced i
    JOIN products p ON i.product_id = p.id
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    WHERE i.status = 'active'
    AND i.quantity_available <= i.reorder_level * 1.5
    ORDER BY 
        CASE 
            WHEN i.quantity_available <= i.reorder_level * 0.5 THEN 1
            WHEN i.quantity_available <= i.reorder_level THEN 2
            WHEN i.quantity_available <= i.reorder_level * 1.5 THEN 3
            ELSE 4
        END,
        i.sales_velocity DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update batch status when expired
CREATE OR REPLACE FUNCTION update_expired_batches()
RETURNS TRIGGER AS $$
BEGIN
    -- Update expired batches daily
    UPDATE inventory_batches 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND expiration_date IS NOT NULL 
    AND expiration_date < CURRENT_DATE;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily batch expiration check
-- Note: In production, this should be handled by a scheduled job
CREATE OR REPLACE FUNCTION daily_batch_check()
RETURNS void AS $$
BEGIN
    PERFORM update_expired_batches();
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO inventory_batches (inventory_id, batch_number, manufacturing_date, expiration_date, quantity, quality_grade, storage_location) 
SELECT 
    i.id,
    'BATCH-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((ROW_NUMBER() OVER())::TEXT, 3, '0'),
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '365 days',
    FLOOR(RANDOM() * 50) + 10,
    (ARRAY['A', 'B', 'C'])[FLOOR(RANDOM() * 3) + 1],
    'WAREHOUSE-' || (FLOOR(RANDOM() * 3) + 1)::TEXT
FROM inventory_advanced i
LIMIT 10;

-- Insert sample auto-reorder rules
INSERT INTO auto_reorder_rules (inventory_id, trigger_type, trigger_value, order_quantity, priority)
SELECT 
    i.id,
    'stock_level',
    i.reorder_level,
    i.reorder_quantity,
    (ARRAY['low', 'medium', 'high'])[FLOOR(RANDOM() * 3) + 1]
FROM inventory_advanced i
WHERE i.status = 'active'
LIMIT 5;

COMMENT ON TABLE inventory_batches IS 'Tracks individual batches of inventory items with expiration dates and quality grades';
COMMENT ON TABLE auto_reorder_rules IS 'Defines automated reordering rules based on various triggers';
COMMENT ON TABLE supplier_performance_metrics IS 'Stores historical performance data for suppliers';
COMMENT ON TABLE inventory_forecasts IS 'Contains demand forecasting data for inventory planning';
COMMENT ON TABLE cost_optimization_opportunities IS 'Tracks identified cost reduction opportunities';
COMMENT ON TABLE demand_plans IS 'Stores demand planning data for products';
