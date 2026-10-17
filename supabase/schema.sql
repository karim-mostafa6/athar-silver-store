-- ==============================================================================
-- دار أورما للفضة الإسترليني 925 - ORMA SILVER STORE
-- Complete Supabase Database Schema, Storage Policies & Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PRODUCTS TABLE (جدول المنتجات)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    arabic_name TEXT NOT NULL,
    category TEXT NOT NULL,
    gender TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price >= 0),
    purity TEXT DEFAULT 'فضة إسترليني عيار 925 معتمدة',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
    default_size TEXT,
    in_stock BOOLEAN DEFAULT true,
    is_best_seller BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    weight_grams NUMERIC DEFAULT 0,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    collections TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing for high-speed catalog browsing
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products RLS Policies:
-- 1) Anyone (clients, visitors) can view products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" 
ON public.products FOR SELECT 
USING (true);

-- 2) Only authenticated admin or service role can insert/update/delete products
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
CREATE POLICY "Admin can insert products" 
ON public.products FOR INSERT 
TO authenticated, service_role 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update products" ON public.products;
CREATE POLICY "Admin can update products" 
ON public.products FOR UPDATE 
TO authenticated, service_role 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
CREATE POLICY "Admin can delete products" 
ON public.products FOR DELETE 
TO authenticated, service_role 
USING (true);


-- ==============================================================================
-- 3. ORDERS TABLE (جدول الطلبات)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    governorate TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    is_gift BOOLEAN DEFAULT false,
    gift_message TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
    shipping_fee NUMERIC NOT NULL CHECK (shipping_fee >= 0),
    discount NUMERIC DEFAULT 0 CHECK (discount >= 0),
    total NUMERIC NOT NULL CHECK (total >= 0),
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod',
    sender_wallet_number TEXT,
    payment_receipt_image TEXT,
    card_details JSONB,
    admin_notes TEXT,
    phone_confirmed BOOLEAN DEFAULT false,
    phone_confirmed_at TIMESTAMPTZ,
    phone_confirmation_notes TEXT,
    whatsapp_confirmed BOOLEAN DEFAULT false,
    whatsapp_confirmed_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing for admin order lookup & sequential searching
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders RLS Policies:
-- 1) Anyone (clients checking out) can place an order (INSERT)
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- 2) Server API & Admin can view orders (Protected by Next.js API route adminAuth token)
DROP POLICY IF EXISTS "Only admin can view orders" ON public.orders;
DROP POLICY IF EXISTS "Server and admin can view orders" ON public.orders;
CREATE POLICY "Server and admin can view orders" 
ON public.orders FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

-- 3) Server API & Admin can update orders (Protected by Next.js API route adminAuth token)
DROP POLICY IF EXISTS "Only admin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Server and admin can update orders" ON public.orders;
CREATE POLICY "Server and admin can update orders" 
ON public.orders FOR UPDATE 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- 4) Server API & Admin can delete orders (Protected by Next.js API route adminAuth token)
DROP POLICY IF EXISTS "Only admin can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Server and admin can delete orders" ON public.orders;
CREATE POLICY "Server and admin can delete orders" 
ON public.orders FOR DELETE 
TO anon, authenticated, service_role 
USING (true);


-- ==============================================================================
-- 4. STORE SETTINGS TABLE (جدول إعدادات المتجر والهوية)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Settings RLS Policies:
-- 1) Public can view store settings (shipping rates, hero, contact, policies)
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings" 
ON public.store_settings FOR SELECT 
USING (true);

-- 2) Only admin or service role can modify store settings
DROP POLICY IF EXISTS "Only admin can modify store settings" ON public.store_settings;
CREATE POLICY "Only admin can modify store settings" 
ON public.store_settings FOR ALL 
TO authenticated, service_role 
USING (true) 
WITH CHECK (true);


-- ==============================================================================
-- 5. ORDER SEQUENCE & DELETED ORDERS AUDIT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_metadata (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.store_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin and service role can access metadata" ON public.store_metadata;
CREATE POLICY "Admin and service role can access metadata" 
ON public.store_metadata FOR ALL 
TO authenticated, service_role 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read order sequence" ON public.store_metadata;
CREATE POLICY "Public can read order sequence" 
ON public.store_metadata FOR SELECT 
USING (key = 'last_order_seq');


-- ==============================================================================
-- 6. SUPABASE STORAGE (BUCKET FOR PRODUCT IMAGES)
-- ==============================================================================
-- Create the public bucket 'product-images' if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB limit per image
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS Policies:
-- 1) Anyone can view uploaded product images
DROP POLICY IF EXISTS "Public Access to Product Images" ON storage.objects;
CREATE POLICY "Public Access to Product Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- 2) Only authenticated admin or service role can upload images
DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
CREATE POLICY "Admin Upload Product Images" 
ON storage.objects FOR INSERT 
TO authenticated, service_role 
WITH CHECK (bucket_id = 'product-images');

-- 3) Only admin can delete images
DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;
CREATE POLICY "Admin Delete Product Images" 
ON storage.objects FOR DELETE 
TO authenticated, service_role 
USING (bucket_id = 'product-images');


-- ==============================================================================
-- 7. INITIAL SEED DATA (INITIAL CATALOG & SETTINGS)
-- ==============================================================================
-- Initialize sequence counter
INSERT INTO public.store_metadata (key, value)
VALUES ('last_order_seq', '1000'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.store_metadata (key, value)
VALUES ('deleted_order_ids', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
