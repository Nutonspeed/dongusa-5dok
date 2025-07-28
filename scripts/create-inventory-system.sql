-- Enhanced Inventory Management System
-- This script creates the advanced inventory tables and functions

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory_alerts CASCADE;
DROP TABLE IF EXISTS inventory_advanced CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    payment_terms VARCHAR(100),
    lead_time_days INTEGER DEFAULT 7,
    minimum_order_quantity INTEGER DEFAULT 1,
    rating DECIMAL(3,2) DEFAULT 5.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Advanced inventory table
CREATE TABLE inventory_advanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID, -- For product variants (size, color combinations)
    supplier_id UUID REFERENCES suppliers(id),
    
    -- Quantity tracking
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_incoming INTEGER NOT NULL DEFAULT 0,
    
    -- Reorder management
    reorder_level INTEGER NOT NULL DEFAULT 10,
    reorder_quantity INTEGER NOT NULL DEFAULT 50,
    maximum_stock_level INTEGER NOT NULL DEFAULT 200,
    
    -- Cost and pricing
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    last_cost_price DECIMAL(10,2),
    average_cost DECIMAL(10,2),
    
    -- Location and storage
    warehouse_location VARCHAR(100),
    storage_conditions TEXT,
    
    -- Tracking dates
    last_restocked TIMESTAMP,
    last_sold TIMESTAMP,
    next_reorder_date DATE,
    
    -- Analytics data
    predicted_demand JSONB DEFAULT '{}',
    sales_velocity DECIMAL(10,2) DEFAULT 0.00, -- Units sold per day
    turnover_rate DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status and notes
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_quantities CHECK (
        quantity_available >= 0 AND 
        quantity_reserved >= 0 AND 
        quantity_incoming >= 0
    ),
    CONSTRAINT valid_reorder_levels CHECK (
        reorder_level >= 0 AND 
        reorder_quantity > 0 AND 
        maximum_stock_level > reorder_level
    )
);

-- Inventory transactions for audit trail
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory_advanced(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
        'purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer'
    )),
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_id UUID, -- Order ID, Purchase ID, etc.
    reference_type VARCHAR(50), -- 'order', 'purchase', 'adjustment', etc.
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reason TEXT,
    performed_by UUID, -- User ID who performed the transaction
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory alerts system
CREATE TABLE inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory_advanced(id),
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN (
        'low_stock', 'out_of_stock', 'overstock', 'reorder_needed', 'expired'
    )),
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    threshold_value INTEGER,
    current_value INTEGER,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_inventory_product_id ON inventory_advanced(product_id);
CREATE INDEX idx_inventory_quantity_available ON inventory_advanced(quantity_available);
CREATE INDEX idx_inventory_reorder_level ON inventory_advanced(reorder_level);
CREATE INDEX idx_inventory_status ON inventory_advanced(status);
CREATE INDEX idx_inventory_last_restocked ON inventory_advanced(last_restocked);

CREATE INDEX idx_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX idx_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON inventory_transactions(created_at);

CREATE INDEX idx_alerts_inventory_id ON inventory_alerts(inventory_id);
CREATE INDEX idx_alerts_type ON inventory_alerts(alert_type);
CREATE INDEX idx_alerts_resolved ON inventory_alerts(is_resolved);
CREATE INDEX idx_alerts_created_at ON inventory_alerts(created_at);

-- Functions for inventory management

-- Function to update inventory quantity
CREATE OR REPLACE FUNCTION update_inventory_quantity(
    p_inventory_id UUID,
    p_quantity_change INTEGER,
    p_transaction_type VARCHAR(20),
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_cost_per_unit DECIMAL(10,2) DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_performed_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_quantity INTEGER;
    v_new_quantity INTEGER;
    v_reorder_level INTEGER;
    v_product_name VARCHAR(255);
BEGIN
    -- Get current quantity and reorder level
    SELECT quantity_available, reorder_level 
    INTO v_current_quantity, v_reorder_level
    FROM inventory_advanced 
    WHERE id = p_inventory_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item not found';
    END IF;
    
    -- Calculate new quantity
    v_new_quantity := v_current_quantity + p_quantity_change;
    
    -- Check for negative quantity
    IF v_new_quantity < 0 THEN
        RAISE EXCEPTION 'Insufficient inventory. Available: %, Requested: %', 
            v_current_quantity, ABS(p_quantity_change);
    END IF;
    
    -- Update inventory
    UPDATE inventory_advanced 
    SET 
        quantity_available = v_new_quantity,
        last_sold = CASE WHEN p_transaction_type = 'sale' THEN NOW() ELSE last_sold END,
        updated_at = NOW()
    WHERE id = p_inventory_id;
    
    -- Record transaction
    INSERT INTO inventory_transactions (
        inventory_id, transaction_type, quantity_change, 
        quantity_before, quantity_after, reference_id, reference_type,
        cost_per_unit, total_cost, reason, performed_by
    ) VALUES (
        p_inventory_id, p_transaction_type, p_quantity_change,
        v_current_quantity, v_new_quantity, p_reference_id, p_reference_type,
        p_cost_per_unit, p_cost_per_unit * ABS(p_quantity_change), p_reason, p_performed_by
    );
    
    -- Check for low stock alert
    IF v_new_quantity <= v_reorder_level AND v_current_quantity > v_reorder_level THEN
        -- Get product name for alert
        SELECT name INTO v_product_name FROM products p
        JOIN inventory_advanced i ON p.id = i.product_id
        WHERE i.id = p_inventory_id;
        
        INSERT INTO inventory_alerts (
            inventory_id, alert_type, severity, message, 
            threshold_value, current_value
        ) VALUES (
            p_inventory_id, 'low_stock', 'high',
            'Low stock alert for ' || COALESCE(v_product_name, 'Unknown Product') || 
            '. Current quantity: ' || v_new_quantity || ', Reorder level: ' || v_reorder_level,
            v_reorder_level, v_new_quantity
        );
    END IF;
    
    -- Check for out of stock alert
    IF v_new_quantity = 0 AND v_current_quantity > 0 THEN
        INSERT INTO inventory_alerts (
            inventory_id, alert_type, severity, message,
            threshold_value, current_value
        ) VALUES (
            p_inventory_id, 'out_of_stock', 'critical',
            'Product is now out of stock: ' || COALESCE(v_product_name, 'Unknown Product'),
            0, 0
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate sales velocity
CREATE OR REPLACE FUNCTION calculate_sales_velocity(p_inventory_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_total_sold INTEGER;
    v_velocity DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(ABS(quantity_change)), 0)
    INTO v_total_sold
    FROM inventory_transactions
    WHERE inventory_id = p_inventory_id
    AND transaction_type = 'sale'
    AND created_at >= NOW() - INTERVAL '1 day' * p_days;
    
    v_velocity := v_total_sold::DECIMAL / p_days;
    
    -- Update the inventory record
    UPDATE inventory_advanced
    SET sales_velocity = v_velocity, updated_at = NOW()
    WHERE id = p_inventory_id;
    
    RETURN v_velocity;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory_advanced
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, payment_terms, lead_time_days) VALUES
('Premium Fabrics Co.', 'John Smith', 'john@premiumfabrics.com', '+66-2-123-4567', '123 Fabric Street, Bangkok', 'Net 30', 14),
('Thai Textile Ltd.', 'Somchai Jaidee', 'somchai@thaitextile.co.th', '+66-2-234-5678', '456 Textile Road, Bangkok', 'Net 15', 7),
('Global Materials Inc.', 'Sarah Johnson', 'sarah@globalmaterials.com', '+1-555-123-4567', '789 Material Ave, USA', 'Net 45', 21);

-- Create a view for inventory dashboard
CREATE OR REPLACE VIEW inventory_dashboard AS
SELECT 
    i.id,
    i.product_id,
    p.name as product_name,
    p.name_en as product_name_en,
    i.variant_id,
    i.quantity_available,
    i.quantity_reserved,
    i.quantity_incoming,
    i.reorder_level,
    i.reorder_quantity,
    i.cost_price,
    i.sales_velocity,
    i.last_restocked,
    i.last_sold,
    s.name as supplier_name,
    s.lead_time_days,
    CASE 
        WHEN i.quantity_available = 0 THEN 'out_of_stock'
        WHEN i.quantity_available <= i.reorder_level THEN 'low_stock'
        WHEN i.quantity_available > i.maximum_stock_level THEN 'overstock'
        ELSE 'normal'
    END as stock_status,
    -- Calculate days until stockout based on sales velocity
    CASE 
        WHEN i.sales_velocity > 0 THEN 
            ROUND(i.quantity_available / i.sales_velocity, 1)
        ELSE NULL
    END as days_until_stockout,
    -- Calculate suggested reorder date
    CASE 
        WHEN i.sales_velocity > 0 THEN 
            CURRENT_DATE + INTERVAL '1 day' * 
            GREATEST(0, (i.quantity_available - i.reorder_level) / i.sales_velocity - s.lead_time_days)
        ELSE NULL
    END as suggested_reorder_date
FROM inventory_advanced i
JOIN products p ON i.product_id = p.id
LEFT JOIN suppliers s ON i.supplier_id = s.id
WHERE i.status = 'active';

COMMENT ON VIEW inventory_dashboard IS 'Comprehensive inventory view for dashboard and reporting';
