# Entity Relationship Diagram (ERD)

## Overview

This document provides the comprehensive database schema and relationships for Architect Prime platform.

## Database Schema

### Users Table

```
┌─────────────────┬──────────────────────┬──────────────┐
│ Column          │ Type                 │ Constraints  │
├─────────────────┼──────────────────────┼──────────────┤
│ id              │ UUID                 │ PK           │
│ name            │ VARCHAR(100)         │ NOT NULL     │
│ email           │ VARCHAR(255)         │ UNIQUE, NOT  │
│ password_hash   │ VARCHAR(255)         │ NOT NULL     │
│ phone           │ VARCHAR(20)          │ NULLABLE     │
│ date_of_birth   │ DATE                 │ NULLABLE     │
│ role            │ ENUM                 │ DEFAULT user │
│ status          │ ENUM                 │ DEFAULT act. │
│ email_verified  │ BOOLEAN              │ DEFAULT false│
│ avatar          │ VARCHAR(500)         │ NULLABLE     │
│ metadata        │ JSONB                │ DEFAULT {}   │
│ created_at      │ TIMESTAMP            │ NOT NULL     │
│ updated_at      │ TIMESTAMP            │ NOT NULL     │
└─────────────────┴──────────────────────┴──────────────┘
```

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`
- `idx_users_status` on `status`
- `idx_users_created_at` on `created_at`

**Relationships:**
- 1:N with `orders` (via customer_id)
- 1:N with `payments` (via user_id)
- 1:N with `notifications` (via user_id)
- 1:1 with `user_profiles` (via user_id)

### Orders Table

```
┌─────────────────┬──────────────────────┬──────────────┐
│ Column          │ Type                 │ Constraints  │
├─────────────────┼──────────────────────┼──────────────┤
│ id              │ UUID                 │ PK           │
│ customer_id     │ UUID                 │ FK → users   │
│ status          │ ENUM                 │ NOT NULL     │
│ total_amount    │ DECIMAL(12,2)        │ NOT NULL     │
│ currency        │ VARCHAR(3)           │ DEFAULT IDR  │
│ payment_method  │ VARCHAR(50)          │ NULLABLE     │
│ payment_status  │ ENUM                 │ DEFAULT pen. │
│ shipping_addr   │ JSONB                │ NOT NULL     │
│ billing_addr    │ JSONB                │ NULLABLE     │
│ notes           │ TEXT                 │ NULLABLE     │
│ metadata        │ JSONB                │ DEFAULT {}   │
│ created_at      │ TIMESTAMP            │ NOT NULL     │
│ updated_at      │ TIMESTAMP            │ NOT NULL     │
└─────────────────┴──────────────────────┴──────────────┘
```

**Indexes:**
- `idx_orders_customer_id` on `customer_id`
- `idx_orders_status` on `status`
- `idx_orders_payment_status` on `payment_status`
- `idx_orders_created_at` on `created_at`

**Relationships:**
- N:1 with `users` (via customer_id)
- 1:N with `order_items` (via order_id)
- 1:1 with `payments` (via order_id)

### Order Items Table

```
┌─────────────────┬──────────────────────┬──────────────┐
│ Column          │ Type                 │ Constraints  │
├─────────────────┼──────────────────────┼──────────────┤
│ id              │ UUID                 │ PK           │
│ order_id        │ UUID                 │ FK → orders  │
│ product_id      │ UUID                 │ FK → products│
│ name            │ VARCHAR(255)         │ NOT NULL     │
│ price           │ DECIMAL(10,2)        │ NOT NULL     │
│ quantity        │ INTEGER              │ NOT NULL     │
│ discount        │ DECIMAL(10,2)        │ DEFAULT 0    │
│ subtotal        │ DECIMAL(12,2)        │ NOT NULL     │
│ created_at      │ TIMESTAMP            │ NOT NULL     │
└─────────────────┴──────────────────────┴──────────────┘
```

**Indexes:**
- `idx_order_items_order_id` on `order_id`
- `idx_order_items_product_id` on `product_id`

**Relationships:**
- N:1 with `orders` (via order_id)
- N:1 with `products` (via product_id)

### Products Table

```
┌─────────────────┬──────────────────────┬──────────────┐
│ Column          │ Type                 │ Constraints  │
├─────────────────┼──────────────────────┼──────────────┤
│ id              │ UUID                 │ PK           │
│ name            │ VARCHAR(255)         │ NOT NULL     │
│ description     │ TEXT                 │ NULLABLE     │
│ category        │ VARCHAR(100)         │ NOT NULL     │
│ price           │ DECIMAL(10,2)        │ NOT NULL     │
│ stock           │ INTEGER              │ DEFAULT 0    │
│ sku             │ VARCHAR(50)          │ UNIQUE       │
│ image_url       │ VARCHAR(500)         │ NULLABLE     │
│ is_active       │ BOOLEAN              │ DEFAULT true │
│ metadata        │ JSONB                │ DEFAULT {}   │
│ created_at      │ TIMESTAMP            │ NOT NULL     │
│ updated_at      │ TIMESTAMP            │ NOT NULL     │
└─────────────────┴──────────────────────┴──────────────┘
```

**Indexes:**
- `idx_products_category` on `category`
- `idx_products_sku` on `sku`
- `idx_products_is_active` on `is_active`

### Payments Table

```
┌─────────────────┬──────────────────────┬──────────────┐
│ Column          │ Type                 │ Constraints  │
├─────────────────┼──────────────────────┼──────────────┤
│ id              │ UUID                 │ PK           │
│ order_id        │ UUID                 │ FK → orders  │
│ user_id         │ UUID                 │ FK → users   │
│ amount          │ DECIMAL(12,2)        │ NOT NULL     │
│ currency        │ VARCHAR(3)           │ DEFAULT IDR  │
│ method          │ VARCHAR(50)          │ NOT NULL     │
│ provider        │ VARCHAR(50)          │ NULLABLE     │
│ provider_ref    │ VARCHAR(255)         │ NULLABLE     │
│ status          │ ENUM                 │ DEFAULT pen. │
│ metadata        │ JSONB                │ DEFAULT {}   │
│ created_at      │ TIMESTAMP            │ NOT NULL     │
│ updated_at      │ TIMESTAMP            │ NOT NULL     │
│ completed_at    │ TIMESTAMP            │ NULLABLE     │
│ failed_at       │ TIMESTAMP            │ NULLABLE     │
│ refunded_at     │ TIMESTAMP            │ NULLABLE     │
└─────────────────┴──────────────────────┴──────────────┘
```

**Indexes:**
- `idx_payments_order_id` on `order_id`
- `idx_payments_user_id` on `user_id`
- `idx_payments_status` on `status`
- `idx_payments_provider` on `provider`

**Relationships:**
- N:1 with `orders` (via order_id)
- N:1 with `users` (via user_id)

### Notifications Table

```
┌─────────────────┬──────────────────────┬──────────────┐
│ Column          │ Type                 │ Constraints  │
├─────────────────┼──────────────────────┼──────────────┤
│ id              │ UUID                 │ PK           │
│ user_id         │ UUID                 │ FK → users   │
│ channel         │ ENUM                 │ NOT NULL     │
│ template        │ VARCHAR(100)         │ NOT NULL     │
│ subject         │ VARCHAR(255)         │ NULLABLE     │
│ body            │ TEXT                 │ NOT NULL     │
│ status          │ ENUM                 │ DEFAULT pen. │
│ sent_at         │ TIMESTAMP            │ NULLABLE     │
│ read_at         │ TIMESTAMP            │ NULLABLE     │
│ metadata        │ JSONB                │ DEFAULT {}   │
│ created_at      │ TIMESTAMP            │ NOT NULL     │
└─────────────────┴──────────────────────┴──────────────┘
```

**Indexes:**
- `idx_notifications_user_id` on `user_id`
- `idx_notifications_status` on `status`
- `idx_notifications_created_at` on `created_at`

## Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ role            │
│ status          │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     ORDERS      │
├─────────────────┤
│ id (PK)         │
│ customer_id(FK) │
│ status          │
│ total_amount    │
│ payment_status  │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│   ORDER_ITEMS   │
├─────────────────┤
│ id (PK)         │
│ order_id (FK)   │
│ product_id (FK) │
│ price           │
│ quantity        │
└────────┬────────┘
         │
         │ N:1
         ▼
┌─────────────────┐
│    PRODUCTS     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ category        │
│ price           │
│ stock           │
└─────────────────┘

┌─────────────────┐     1:1     ┌─────────────────┐
│     ORDERS      │─────────────│    PAYMENTS     │
├─────────────────┤             ├─────────────────┤
│ id (PK)         │             │ id (PK)         │
│ customer_id(FK) │             │ order_id (FK)   │
└─────────────────┘             │ amount          │
                                │ status          │
┌─────────────────┐             └─────────────────┘
│     USERS       │────────────────────────────┐
├─────────────────┤                            │
│ id (PK)         │         1:N                │
│ email (UNIQUE)  │                            │
└─────────────────┘                            ▼
                                ┌─────────────────┐
                                │ NOTIFICATIONS   │
                                ├─────────────────┤
                                │ id (PK)         │
                                │ user_id (FK)    │
                                │ channel         │
                                │ status          │
                                └─────────────────┘
```

## Database Migrations

### Migration 001: Create Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    avatar VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### Migration 002: Create Products Table

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    sku VARCHAR(50) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
```

### Migration 003: Create Orders Table

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
```

## Relationships Summary

| Parent Table  | Child Table    | Type | Description                    |
|---------------|----------------|------|--------------------------------|
| users         | orders         | 1:N  | Customer's orders              |
| users         | payments       | 1:N  | User's payment transactions    |
| users         | notifications  | 1:N  | User's notifications           |
| orders        | order_items    | 1:N  | Order's line items             |
| orders        | payments       | 1:1  | Single payment per order       |
| products      | order_items    | 1:N  | Product appears in orders      |