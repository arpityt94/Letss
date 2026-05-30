-- Let's Success 2.0 MySQL Database Schema
-- Production Ready Schema for Affiliate Learning Platform
-- Admin Contact: marpit792@gmail.com

CREATE DATABASE IF NOT EXISTS lets_success_db;
USE lets_success_db;

-- 1. PACKAGES TABLE
CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    courses_count INT DEFAULT 0,
    color VARCHAR(20) DEFAULT 'cyan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    referred_by VARCHAR(50) DEFAULT NULL, -- Foreign referral code
    balance DECIMAL(10, 2) DEFAULT 0.00,
    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10, 2) DEFAULT 0.00,
    active_package_id VARCHAR(50) DEFAULT NULL,
    upi_id VARCHAR(100) DEFAULT NULL,
    bank_name VARCHAR(100) DEFAULT NULL,
    bank_account VARCHAR(100) DEFAULT NULL,
    bank_ifsc VARCHAR(50) DEFAULT NULL,
    bank_holder_name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (active_package_id) REFERENCES packages(id) ON DELETE SET NULL
);

-- Create index on referral_code for fast joins
CREATE INDEX idx_referral_code ON users(referral_code);
CREATE INDEX idx_referred_by ON users(referred_by);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    package_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(255),
    video_url VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    lessons_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- 4. PAYMENTS TABLE (Manual payment upload verified by admin)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    package_id VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    screenshot_url TEXT NOT NULL,
    utr VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- 5. COMMISSIONS TABLE (80% direct referral commission)
CREATE TABLE IF NOT EXISTS commissions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL, -- The referrer getting paid
    referred_user_id VARCHAR(50) NOT NULL, -- The buyer
    package_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, -- Always 80%
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- 6. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(20) NOT NULL, -- 'upi', 'bank'
    upi_id VARCHAR(100) DEFAULT NULL,
    bank_name VARCHAR(100) DEFAULT NULL,
    bank_account VARCHAR(100) DEFAULT NULL,
    bank_ifsc VARCHAR(50) DEFAULT NULL,
    bank_holder_name VARCHAR(100) DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) DEFAULT 'all', -- 'all' or specific user ID
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. BANNER_NOTICES TABLE
CREATE TABLE IF NOT EXISTS banner_notices (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA
INSERT INTO packages (id, name, price, color, courses_count) VALUES
('startup', 'Startup Package', 1499.00, 'cyan', 3),
('foundation', 'Foundation Package', 2499.00, 'gold', 3),
('branding', 'Branding Mastery Package', 4499.00, 'emerald', 4),
('affiliate', 'Affiliate Package', 6999.00, 'rose', 3),
('finance', 'Finance Premium Package', 9999.00, 'violet', 2);

-- Insert Default Courses
INSERT INTO courses (id, package_id, title, description, thumbnail_url, video_url, duration, lessons_count) VALUES
('c1', 'startup', 'Instagram Mastery', 'Learn how to grow your personal brand and generate business leads through Instagram.', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '4h 30m', 12),
('c2', 'startup', 'Video Editing Mastery', 'Master VN, CapCut, and Premiere Pro for stunning mobile & desktop reels.', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '5h 15m', 15),
('c3', 'startup', 'Beginner To Pro Training', 'Everything about affiliate marketing foundations & mindsets.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '3h 40m', 10),

('c4', 'foundation', 'Spoken English & Communication', 'Learn powerful English communication and public speaker secrets.', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '6h 10m', 18),
('c5', 'foundation', 'Lead Generation Formula', 'Advanced techniques to get highly qualified organic leads every day.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '4h 50m', 14),

('c6', 'branding', 'Facebook Ads Mastery', 'Target and run high-converting Facebook and Instagram ad campaigns.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '8h 25m', 22),
('c7', 'branding', 'YouTube Mastermind', 'A-to-Z of starting, editing, and indexing views to monetize YouTube channel.', 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '7h 10m', 20),

('c8', 'affiliate', 'Website Designing with AI', 'Build premium responsive blogs and business sites in hours.', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '9h 15m', 24),
('c9', 'affiliate', 'Freelancing Fundamentals', 'How to write proposals, find clients on Fiverr/Upwork and get paid.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '5h 45m', 16),

('c10', 'finance', 'Stock Market Foundations', 'Ultimate roadmap for long-term investments & asset classes.', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '10h 00m', 30),
('c11', 'finance', 'Advanced Option & Intraday Trading', 'Technical analysis tools, candlestick charts, and risk strategies.', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '11h 20m', 35);

-- Insert Default Admin
-- Default Admin credentials:
-- Email: marpit792@gmail.com
-- Password: adminpassword (hashed: $2a$10$tZ8QvS29pQ2L/L95S7D.nOO3Q4qgXb1Z47Xj7gM6Oq.SBeG8Ea39q - we will configure this in local DB also)
INSERT INTO users (id, name, email, password_hash, role, referral_code, balance, total_earnings, total_withdrawn) VALUES
('admin-root', 'Marpit Admin', 'marpit792@gmail.com', '$2a$10$w3G.ZJ7Yp6j1Tj1B1M0bceDk8m7XbYtKOfG3SFeXv4SBeG8Ea39q', 'admin', 'SUCCESSADMIN', 0.00, 0.00, 0.00);
