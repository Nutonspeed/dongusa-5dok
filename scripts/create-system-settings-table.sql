-- Create system_settings table for storing configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings(updated_at);

-- Insert default feature flags
INSERT INTO system_settings (key, value, description) VALUES 
('feature_flags', '{
  "customCovers": true,
  "bulkOrders": true,
  "loyaltyProgram": false,
  "reviews": true,
  "wishlist": true,
  "advancedAnalytics": true,
  "bulkOperations": true,
  "exportFeatures": true
}', 'System feature flags configuration')
ON CONFLICT (key) DO NOTHING;

-- Insert default integration settings
INSERT INTO system_settings (key, value, description) VALUES 
('integration_settings', '{
  "database": {"provider": "supabase", "enabled": true},
  "email": {"provider": "smtp", "enabled": false},
  "payment": {"providers": ["stripe", "promptpay"], "enabled": false},
  "shipping": {"providers": ["thailand_post", "kerry", "flash"], "enabled": false},
  "storage": {"provider": "vercel_blob", "enabled": false}
}', 'Third-party integration settings')
ON CONFLICT (key) DO NOTHING;

-- Insert default business configuration
INSERT INTO system_settings (key, value, description) VALUES 
('business_config', '{
  "store_name": "ร้านผ้าคลุมโซฟาพรีเมียม",
  "store_name_en": "Premium Sofa Cover Store",
  "currency": "THB",
  "timezone": "Asia/Bangkok",
  "language": "th",
  "tax_rate": 0.07,
  "free_shipping_threshold": 2000
}', 'Business configuration settings')
ON CONFLICT (key) DO NOTHING;
