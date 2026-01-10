#!/usr/bin/env python3
"""
Order Screenshot Manager - CLI Tool
Manages order screenshots with file-based storage
"""

import os
import json
import sys
import shutil
from datetime import datetime
from pathlib import Path
import argparse

# Base directory for orders
ORDERS_DIR = Path(__file__).parent / "orders"

class OrderManager:
    def __init__(self):
        self.orders_dir = ORDERS_DIR
        self.orders_dir.mkdir(exist_ok=True)
    
    def add_order(self, order_id, product_name=None, order_date=None, platform=None):
        """Add a new order"""
        order_path = self.orders_dir / order_id
        
        if order_path.exists():
            print(f"⚠️  Order {order_id} already exists!")
            response = input("Do you want to update it? (y/n): ")
            if response.lower() != 'y':
                return False
        
        order_path.mkdir(exist_ok=True)
        
        # Create order metadata
        metadata = {
            "id": order_id,
            "productName": product_name or "",
            "orderDate": order_date or "",
            "platform": platform or "Other",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat(),
            "screenshots": []
        }
        
        # Save metadata
        with open(order_path / "order.json", "w") as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Order {order_id} created at: {order_path}")
        print(f"\nNext steps:")
        print(f"1. Copy your screenshots to: {order_path}/")
        print(f"2. Name them: ordered.png, delivered.png, rating.png, review.png, returnWindow.png")
        print(f"3. Run: python3 order-manager.py sync")
        
        return True
    
    def search_order(self, order_id):
        """Search for an order by ID"""
        order_path = self.orders_dir / order_id
        
        if not order_path.exists():
            print(f"❌ Order {order_id} not found!")
            return None
        
        # Load metadata
        with open(order_path / "order.json", "r") as f:
            metadata = json.load(f)
        
        # List screenshots
        screenshots = []
        for img_type in ["ordered", "delivered", "rating", "review", "returnWindow"]:
            for ext in [".png", ".jpg", ".jpeg"]:
                img_path = order_path / f"{img_type}{ext}"
                if img_path.exists():
                    screenshots.append(str(img_path))
                    break
        
        metadata["screenshots"] = screenshots
        
        return metadata
    
    def display_order(self, order_id):
        """Display order details"""
        order = self.search_order(order_id)
        
        if not order:
            return
        
        print(f"\n{'='*60}")
        print(f"📦 Order: {order['id']}")
        print(f"{'='*60}")
        print(f"Product: {order.get('productName', 'N/A')}")
        print(f"Platform: {order.get('platform', 'N/A')}")
        print(f"Order Date: {order.get('orderDate', 'N/A')}")
        print(f"Created: {order.get('createdAt', 'N/A')}")
        print(f"\n📸 Screenshots ({len(order['screenshots'])}):")
        for screenshot in order['screenshots']:
            print(f"  - {Path(screenshot).name}")
        print(f"\n📁 Location: {self.orders_dir / order_id}")
        print(f"{'='*60}\n")
    
    def list_orders(self):
        """List all orders"""
        orders = []
        
        for order_dir in self.orders_dir.iterdir():
            if order_dir.is_dir() and (order_dir / "order.json").exists():
                with open(order_dir / "order.json", "r") as f:
                    metadata = json.load(f)
                    orders.append(metadata)
        
        if not orders:
            print("📭 No orders found. Add your first order!")
            return
        
        # Sort by creation date
        orders.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
        
        print(f"\n{'='*80}")
        print(f"📋 All Orders ({len(orders)} total)")
        print(f"{'='*80}")
        print(f"{'Order ID':<20} {'Platform':<15} {'Product':<30} {'Date':<15}")
        print(f"{'-'*80}")
        
        for order in orders:
            order_id = order['id'][:20]
            platform = order.get('platform', 'N/A')[:15]
            product = order.get('productName', 'N/A')[:30]
            date = order.get('orderDate', 'N/A')[:15]
            print(f"{order_id:<20} {platform:<15} {product:<30} {date:<15}")
        
        print(f"{'='*80}\n")
    
    def open_order(self, order_id):
        """Open order folder in Finder"""
        order_path = self.orders_dir / order_id
        
        if not order_path.exists():
            print(f"❌ Order {order_id} not found!")
            return
        
        os.system(f"open '{order_path}'")
        print(f"✅ Opened {order_id} in Finder")
    
    def delete_order(self, order_id):
        """Delete an order"""
        order_path = self.orders_dir / order_id
        
        if not order_path.exists():
            print(f"❌ Order {order_id} not found!")
            return
        
        print(f"⚠️  WARNING: This will permanently delete order {order_id}")
        response = input("Are you sure? (yes/no): ")
        
        if response.lower() == 'yes':
            shutil.rmtree(order_path)
            print(f"✅ Order {order_id} deleted")
        else:
            print("❌ Deletion cancelled")
    
    def sync_to_git(self):
        """Sync orders to Git"""
        repo_path = self.orders_dir.parent
        
        print("🔄 Syncing to Git...")
        
        # Check if git is initialized
        if not (repo_path / ".git").exists():
            print("⚠️  Git not initialized. Run: git init")
            return
        
        os.chdir(repo_path)
        
        # Add all changes
        os.system("git add orders/")
        
        # Commit
        commit_msg = f"Update orders - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        os.system(f'git commit -m "{commit_msg}"')
        
        # Push
        os.system("git push origin main 2>&1 || git push origin master 2>&1")
        
        print("✅ Sync complete!")

def main():
    parser = argparse.ArgumentParser(description="Order Screenshot Manager")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Add order
    add_parser = subparsers.add_parser("add", help="Add a new order")
    add_parser.add_argument("order_id", help="Order ID")
    add_parser.add_argument("-p", "--product", help="Product name")
    add_parser.add_argument("-d", "--date", help="Order date (YYYY-MM-DD)")
    add_parser.add_argument("-pl", "--platform", help="Platform (Amazon, Flipkart, etc.)")
    
    # Search order
    search_parser = subparsers.add_parser("search", help="Search for an order")
    search_parser.add_argument("order_id", help="Order ID to search")
    
    # List orders
    subparsers.add_parser("list", help="List all orders")
    
    # Open order
    open_parser = subparsers.add_parser("open", help="Open order folder")
    open_parser.add_argument("order_id", help="Order ID to open")
    
    # Delete order
    delete_parser = subparsers.add_parser("delete", help="Delete an order")
    delete_parser.add_argument("order_id", help="Order ID to delete")
    
    # Sync to git
    subparsers.add_parser("sync", help="Sync orders to Git")
    
    args = parser.parse_args()
    
    manager = OrderManager()
    
    if args.command == "add":
        manager.add_order(args.order_id, args.product, args.date, args.platform)
    elif args.command == "search":
        manager.display_order(args.order_id)
    elif args.command == "list":
        manager.list_orders()
    elif args.command == "open":
        manager.open_order(args.order_id)
    elif args.command == "delete":
        manager.delete_order(args.order_id)
    elif args.command == "sync":
        manager.sync_to_git()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
