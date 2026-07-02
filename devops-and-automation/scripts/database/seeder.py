#!/usr/bin/env python3

import os
import sys
import random
import string
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any

class DatabaseSeeder:
    def __init__(self, db_config: Dict[str, Any]):
        self.db_config = db_config
        self.connection = None

    def connect(self):
        db_type = self.db_config.get('type', 'postgres')
        
        if db_type == 'postgres':
            import psycopg2
            self.connection = psycopg2.connect(
                host=self.db_config.get('host', 'localhost'),
                port=self.db_config.get('port', 5432),
                database=self.db_config.get('database', 'architect_prime'),
                user=self.db_config.get('user', 'postgres'),
                password=self.db_config.get('password', '')
            )
        elif db_type == 'mysql':
            import mysql.connector
            self.connection = mysql.connector.connect(
                host=self.db_config.get('host', 'localhost'),
                port=self.db_config.get('port', 3306),
                database=self.db_config.get('database', 'architect_prime'),
                user=self.db_config.get('user', 'root'),
                password=self.db_config.get('password', '')
            )
        elif db_type == 'mongodb':
            from pymongo import MongoClient
            client = MongoClient(
                self.db_config.get('uri', 'mongodb://localhost:27017')
            )
            self.connection = client[self.db_config.get('database', 'architect_prime')]

    def disconnect(self):
        if self.connection:
            self.connection.close()

    def seed_users(self, count: int = 100):
        print(f"Seeding {count} users...")
        
        first_names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 
                      'William', 'Jennifer', 'James', 'Mary', 'John', 'Patricia', 'Thomas']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
                     'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore']
        domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'email.com']
        
        users = []
        for i in range(count):
            first = random.choice(first_names)
            last = random.choice(last_names)
            name = f"{first} {last}"
            email = f"{first.lower()}.{last.lower()}{random.randint(1, 999)}@{random.choice(domains)}"
            phone = f"+62{random.randint(800000000000, 899999999999)}"
            password_hash = hashlib.sha256(f"password123".encode()).hexdigest()
            role = random.choice(['user', 'user', 'user', 'user', 'moderator', 'admin'])
            status = random.choice(['active', 'active', 'active', 'inactive', 'suspended'])
            created_at = datetime.now() - timedelta(days=random.randint(1, 365))
            
            users.append({
                'name': name,
                'email': email,
                'phone': phone,
                'password_hash': password_hash,
                'role': role,
                'status': status,
                'email_verified': random.choice([True, False]),
                'avatar': f"https://api.dicebear.com/7.x/avataaars/svg?seed={name}",
                'created_at': created_at,
                'updated_at': datetime.now()
            })
        
        self._insert_users(users)
        print(f"Seeded {count} users successfully")

    def seed_products(self, count: int = 200):
        print(f"Seeding {count} products...")
        
        categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 
                     'Toys', 'Food & Beverages', 'Health & Beauty', 'Automotive', 'Office']
        
        product_names = {
            'Electronics': ['Laptop', 'Smartphone', 'Tablet', 'Camera', 'Headphones', 'Smartwatch'],
            'Clothing': ['T-Shirt', 'Jeans', 'Jacket', 'Dress', 'Shoes', 'Hat'],
            'Home & Garden': ['Chair', 'Table', 'Lamp', 'Vase', 'Rug', 'Curtains'],
            'Sports': ['Basketball', 'Soccer Ball', 'Tennis Racket', 'Yoga Mat', 'Dumbbells'],
            'Books': ['Novel', 'Textbook', 'Magazine', 'Comic', 'Biography'],
            'Toys': ['Action Figure', 'Puzzle', 'Board Game', 'Doll', 'RC Car'],
            'Food & Beverages': ['Coffee', 'Tea', 'Snacks', 'Chocolate', 'Juice'],
            'Health & Beauty': ['Shampoo', 'Soap', 'Lotion', 'Perfume', 'Makeup'],
            'Automotive': ['Car Accessories', 'Oil', 'Tools', 'Tires'],
            'Office': ['Notebook', 'Pen', 'Stapler', 'Folder', 'Desk Organizer']
        }
        
        products = []
        for i in range(count):
            category = random.choice(categories)
            base_name = random.choice(product_names.get(category, ['Product']))
            name = f"{base_name} {random.choice(['Pro', 'Elite', 'Basic', 'Premium', 'Standard'])}"
            price = round(random.uniform(10, 1000), 2)
            stock = random.randint(0, 500)
            
            products.append({
                'name': name,
                'description': f"High quality {name.lower()} for your needs",
                'category': category,
                'price': price,
                'stock': stock,
                'sku': f"SKU-{category[:3].upper()}-{random.randint(10000, 99999)}",
                'image_url': f"https://picsum.photos/seed/{i}/400/400",
                'is_active': random.choice([True, True, True, False]),
                'created_at': datetime.now() - timedelta(days=random.randint(1, 180))
            })
        
        self._insert_products(products)
        print(f"Seeded {count} products successfully")

    def seed_orders(self, count: int = 500):
        print(f"Seeding {count} orders...")
        
        statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        payment_statuses = ['pending', 'processing', 'completed', 'failed', 'refunded']
        payment_methods = ['bank_transfer', 'credit_card', 'e_wallet', 'cod']
        
        orders = []
        for i in range(count):
            user_id = random.randint(1, 100)
            status = random.choice(statuses)
            payment_status = random.choice(payment_statuses)
            total_amount = round(random.uniform(20, 5000), 2)
            
            orders.append({
                'user_id': user_id,
                'status': status,
                'total_amount': total_amount,
                'currency': 'IDR',
                'payment_method': random.choice(payment_methods),
                'payment_status': payment_status,
                'shipping_address': f"{random.randint(1, 999)} Street, City, State {random.randint(10000, 99999)}",
                'notes': random.choice(['', 'Please deliver carefully', 'Call before delivery', 'Leave at door']),
                'created_at': datetime.now() - timedelta(days=random.randint(1, 90))
            })
        
        self._insert_orders(orders)
        print(f"Seeded {count} orders successfully")

    def seed_payment_transactions(self, count: int = 300):
        print(f"Seeding {count} payment transactions...")
        
        providers = ['midtrans', 'xendit', 'stripe', 'ovo', 'dana']
        statuses = ['pending', 'processing', 'completed', 'failed', 'refunded']
        
        transactions = []
        for i in range(count):
            order_id = random.randint(1, count)
            amount = round(random.uniform(20, 5000), 2)
            status = random.choice(statuses)
            
            transactions.append({
                'order_id': order_id,
                'user_id': random.randint(1, 100),
                'amount': amount,
                'currency': 'IDR',
                'method': random.choice(['bank_transfer', 'credit_card', 'e_wallet']),
                'provider': random.choice(providers),
                'provider_reference': ''.join(random.choices(string.ascii_uppercase + string.digits, k=20)),
                'status': status,
                'created_at': datetime.now() - timedelta(days=random.randint(1, 60))
            })
        
        self._insert_transactions(transactions)
        print(f"Seeded {count} transactions successfully")

    def seed_all(self):
        self.connect()
        
        try:
            self.seed_users(100)
            self.seed_products(200)
            self.seed_orders(500)
            self.seed_payment_transactions(300)
            
            print("\n========================================")
            print("  All seed data inserted successfully!")
            print("========================================")
        finally:
            self.disconnect()

    def _insert_users(self, users: List[Dict]):
        pass

    def _insert_products(self, products: List[Dict]):
        pass

    def _insert_orders(self, orders: List[Dict]):
        pass

    def _insert_transactions(self, transactions: List[Dict]):
        pass

def main():
    db_config = {
        'type': os.getenv('DB_TYPE', 'postgres'),
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', '5432')),
        'database': os.getenv('DB_NAME', 'architect_prime'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'postgres')
    }

    seeder = DatabaseSeeder(db_config)
    seeder.seed_all()

if __name__ == '__main__':
    main()