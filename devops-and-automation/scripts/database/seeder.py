#!/usr/bin/env python3
"""
Database Seeder Script
Automatically seeds the database with demo data for presentations
"""

import os
import sys
import random
from datetime import datetime, timedelta

# Demo data
FIRST_NAMES = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi']
LAST_NAMES = ['Santoso', 'Wijaya', 'Kusuma', 'Permana', 'Nugroho', 'Saputra', 'Pratama', 'Wibowo']
PRODUCTS = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headset', 'Webcam', 'USB Hub', 'Charger']
STATUSES = ['pending', 'processing', 'shipped', 'delivered']

def generate_users(count=50):
    """Generate demo user data."""
    users = []
    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        users.append({
            'name': f'{first} {last}',
            'email': f'{first.lower()}.{last.lower()}{i}@example.com',
            'created_at': datetime.now() - timedelta(days=random.randint(1, 365))
        })
    return users

def generate_orders(count=100):
    """Generate demo order data."""
    orders = []
    for i in range(count):
        orders.append({
            'order_number': f'ORD-{i+1:05d}',
            'amount': round(random.uniform(100000, 5000000), 2),
            'status': random.choice(STATUSES),
            'created_at': datetime.now() - timedelta(days=random.randint(1, 90))
        })
    return orders

def generate_products():
    """Generate demo product data."""
    return [
        {'name': p, 'price': round(random.uniform(100000, 5000000), 2), 'stock': random.randint(0, 100)}
        for p in PRODUCTS
    ]

def main():
    print("🏗️ Database Seeder")
    print("=" * 50)
    
    users = generate_users(50)
    orders = generate_orders(100)
    products = generate_products()
    
    print(f"\nGenerated:")
    print(f"  - {len(users)} users")
    print(f"  - {len(orders)} orders")
    print(f"  - {len(products)} products")
    
    # In production, you would insert this into the database
    # Example for PostgreSQL:
    # import psycopg2
    # conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    # cursor = conn.cursor()
    # cursor.executemany("INSERT INTO users...", users)
    
    print("\n✅ Demo data generated successfully!")
    print("\n⚠️  Note: Connect to actual database to insert data.")

if __name__ == '__main__':
    main()
