-- Promotion and Discount Management System
-- This script creates comprehensive promotion management tables

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    description_en TEXT,
    promotion_type TEXT NOT NULL CHECK (promotion_type IN (
        'percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping', 'bundle'
    )),
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10,2),
    
    -- Targeting
    target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN (
        'all', 'new_customers', 'returning_customers', 'vip_customers', 'specific_products', 'categories'
    )),
    target_criteria JSONB DEFAULT '{}'::jsonb,
    
    -- Usage limits
    usage_limit INTEGER, -- Total usage limit
    usage_limit_per_customer INTEGER DEFAULT 1,
    current_usage_count INTEGER DEFAULT 0,
    
    -- Date constraints
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Status and settings
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'expired', 'cancelled')),
    auto_apply BOOLEAN DEFAULT FALSE,
    stackable BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES admin_users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupon codes table
CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promotion usage tracking table
CREATE TABLE IF NOT EXISTS promotion_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    coupon_code_id UUID REFERENCES coupon_codes(id),
    order_id TEXT NOT NULL REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasonal campaigns table
CREATE TABLE IF NOT EXISTS seasonal_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN (
        'new_year', 'valentines', 'mothers_day', 'fathers_day', 'songkran', 'mid_year', 'back_to_school', 'halloween', 'christmas', 'year_end', 'custom'
    )),
    banner_image TEXT,
    banner_text JSONB DEFAULT '{}'::jsonb,
    promotion_ids UUID[] DEFAULT '{}',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer loyalty points table
CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    lifetime_points_earned INTEGER DEFAULT 0,
    lifetime_points_redeemed INTEGER DEFAULT 0,
    tier_level TEXT DEFAULT 'bronze' CHECK (tier_level IN ('bronze', 'silver', 'gold', 'platinum')),
    tier_benefits JSONB DEFAULT '{}'::jsonb,
    next_tier_threshold INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Create loyalty transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus', 'adjustment')),
    points_change INTEGER NOT NULL,
    points_balance_after INTEGER NOT NULL,
    reference_id TEXT, -- Order ID or other reference
    reference_type TEXT, -- 'order', 'bonus', 'manual', etc.
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(promotion_type);
CREATE INDEX IF NOT EXISTS idx_promotions_target_type ON promotions(target_type);

CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_promotion_id ON coupon_codes(promotion_id);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_status ON coupon_codes(status);

CREATE INDEX IF NOT EXISTS idx_promotion_usage_promotion_id ON promotion_usage(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_customer_id ON promotion_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_order_id ON promotion_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_used_at ON promotion_usage(used_at);

CREATE INDEX IF NOT EXISTS idx_seasonal_campaigns_dates ON seasonal_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_campaigns_status ON seasonal_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_seasonal_campaigns_type ON seasonal_campaigns(campaign_type);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier_level ON loyalty_points(tier_level);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupon_codes_updated_at BEFORE UPDATE ON coupon_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_campaigns_updated_at BEFORE UPDATE ON seasonal_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON loyalty_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate promotion discount
CREATE OR REPLACE FUNCTION calculate_promotion_discount(
    p_promotion_id UUID,
    p_order_amount DECIMAL(10,2),
    p_customer_id UUID,
    p_items JSONB
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_promotion RECORD;
    v_discount_amount DECIMAL(10,2) := 0;
    v_customer_usage_count INTEGER;
BEGIN
    -- Get promotion details
    SELECT * INTO v_promotion FROM promotions WHERE id = p_promotion_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Check if promotion is within date range
    IF NOW() < v_promotion.start_date OR NOW() > v_promotion.end_date THEN
        RETURN 0;
    END IF;
    
    -- Check minimum order amount
    IF p_order_amount < v_promotion.minimum_order_amount THEN
        RETURN 0;
    END IF;
    
    -- Check usage limits
    IF v_promotion.usage_limit IS NOT NULL AND v_promotion.current_usage_count >= v_promotion.usage_limit THEN
        RETURN 0;
    END IF;
    
    -- Check per-customer usage limit
    SELECT COUNT(*) INTO v_customer_usage_count 
    FROM promotion_usage 
    WHERE promotion_id = p_promotion_id AND customer_id = p_customer_id;
    
    IF v_customer_usage_count >= v_promotion.usage_limit_per_customer THEN
        RETURN 0;
    END IF;
    
    -- Calculate discount based on promotion type
    CASE v_promotion.promotion_type
        WHEN 'percentage' THEN
            v_discount_amount := p_order_amount * (v_promotion.discount_value / 100);
        WHEN 'fixed_amount' THEN
            v_discount_amount := v_promotion.discount_value;
        WHEN 'free_shipping' THEN
            v_discount_amount := 50; -- Assume standard shipping cost
        ELSE
            v_discount_amount := 0;
    END CASE;
    
    -- Apply maximum discount limit
    IF v_promotion.maximum_discount_amount IS NOT NULL THEN
        v_discount_amount := LEAST(v_discount_amount, v_promotion.maximum_discount_amount);
    END IF;
    
    -- Ensure discount doesn't exceed order amount
    v_discount_amount := LEAST(v_discount_amount, p_order_amount);
    
    RETURN v_discount_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to apply promotion to order
CREATE OR REPLACE FUNCTION apply_promotion_to_order(
    p_order_id TEXT,
    p_promotion_id UUID,
    p_coupon_code TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_order RECORD;
    v_discount_amount DECIMAL(10,2);
    v_coupon_code_id UUID;
BEGIN
    -- Get order details
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;
    
    -- Calculate discount
    v_discount_amount := calculate_promotion_discount(
        p_promotion_id, 
        v_order.total, 
        v_order.customer_id, 
        v_order.items
    );
    
    IF v_discount_amount <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Get coupon code ID if provided
    IF p_coupon_code IS NOT NULL THEN
        SELECT id INTO v_coupon_code_id FROM coupon_codes 
        WHERE code = p_coupon_code AND promotion_id = p_promotion_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid coupon code';
        END IF;
        
        -- Update coupon usage
        UPDATE coupon_codes SET usage_count = usage_count + 1 WHERE id = v_coupon_code_id;
    END IF;
    
    -- Record promotion usage
    INSERT INTO promotion_usage (
        promotion_id, coupon_code_id, order_id, customer_id,
        discount_amount, original_amount, final_amount
    ) VALUES (
        p_promotion_id, v_coupon_code_id, p_order_id, v_order.customer_id,
        v_discount_amount, v_order.total, v_order.total - v_discount_amount
    );
    
    -- Update promotion usage count
    UPDATE promotions SET current_usage_count = current_usage_count + 1 WHERE id = p_promotion_id;
    
    -- Update order total
    UPDATE orders SET total = total - v_discount_amount WHERE id = p_order_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to manage loyalty points
CREATE OR REPLACE FUNCTION update_loyalty_points(
    p_customer_id UUID,
    p_points_change INTEGER,
    p_transaction_type TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_tier_level TEXT;
BEGIN
    -- Get or create loyalty points record
    INSERT INTO loyalty_points (customer_id, points_balance)
    VALUES (p_customer_id, 0)
    ON CONFLICT (customer_id) DO NOTHING;
    
    -- Get current balance
    SELECT points_balance INTO v_current_balance 
    FROM loyalty_points WHERE customer_id = p_customer_id;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_points_change;
    
    -- Ensure balance doesn't go negative
    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient loyalty points';
    END IF;
    
    -- Determine tier level based on lifetime points
    SELECT CASE 
        WHEN lifetime_points_earned + GREATEST(p_points_change, 0) >= 10000 THEN 'platinum'
        WHEN lifetime_points_earned + GREATEST(p_points_change, 0) >= 5000 THEN 'gold'
        WHEN lifetime_points_earned + GREATEST(p_points_change, 0) >= 2000 THEN 'silver'
        ELSE 'bronze'
    END INTO v_tier_level
    FROM loyalty_points WHERE customer_id = p_customer_id;
    
    -- Update loyalty points
    UPDATE loyalty_points SET
        points_balance = v_new_balance,
        lifetime_points_earned = CASE 
            WHEN p_transaction_type = 'earned' THEN lifetime_points_earned + p_points_change
            ELSE lifetime_points_earned
        END,
        lifetime_points_redeemed = CASE 
            WHEN p_transaction_type = 'redeemed' THEN lifetime_points_redeemed + ABS(p_points_change)
            ELSE lifetime_points_redeemed
        END,
        tier_level = v_tier_level,
        updated_at = NOW()
    WHERE customer_id = p_customer_id;
    
    -- Record transaction
    INSERT INTO loyalty_transactions (
        customer_id, transaction_type, points_change, points_balance_after,
        reference_id, reference_type, description
    ) VALUES (
        p_customer_id, p_transaction_type, p_points_change, v_new_balance,
        p_reference_id, p_reference_type, p_description
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert sample promotions
INSERT INTO promotions (
    name, name_en, description, description_en, promotion_type, discount_value,
    minimum_order_amount, target_type, start_date, end_date, status, auto_apply
) VALUES 
(
    'ส่วนลดลูกค้าใหม่ 15%', 'New Customer 15% Off',
    'ส่วนลดพิเศษ 15% สำหรับลูกค้าใหม่', 'Special 15% discount for new customers',
    'percentage', 15.00, 1000.00, 'new_customers',
    NOW(), NOW() + INTERVAL '30 days', 'active', true
),
(
    'ซื้อครบ 3000 ลด 300', 'Spend 3000 Save 300',
    'ซื้อสินค้าครบ 3000 บาท ลดทันที 300 บาท', 'Spend 3000 THB and save 300 THB instantly',
    'fixed_amount', 300.00, 3000.00, 'all',
    NOW(), NOW() + INTERVAL '60 days', 'active', true
),
(
    'ส่งฟรีทุกออเดอร์', 'Free Shipping All Orders',
    'ส่งฟรีไม่มีขั้นต่ำ', 'Free shipping on all orders',
    'free_shipping', 50.00, 0.00, 'all',
    NOW(), NOW() + INTERVAL '90 days', 'active', true
);

-- Insert sample coupon codes
INSERT INTO coupon_codes (promotion_id, code) VALUES 
((SELECT id FROM promotions WHERE name = 'ส่วนลดลูกค้าใหม่ 15%'), 'WELCOME15'),
((SELECT id FROM promotions WHERE name = 'ซื้อครบ 3000 ลด 300'), 'SAVE300'),
((SELECT id FROM promotions WHERE name = 'ส่งฟรีทุกออเดอร์'), 'FREESHIP');

-- Insert sample seasonal campaign
INSERT INTO seasonal_campaigns (
    name, name_en, campaign_type, banner_text, start_date, end_date, status
) VALUES (
    'โปรโมชั่นปีใหม่ 2024', 'New Year 2024 Promotion', 'new_year',
    '{"th": "ต้อนรับปีใหม่ด้วยส่วนลดพิเศษ", "en": "Welcome New Year with Special Discounts"}',
    '2024-12-25', '2024-01-15', 'active'
);
