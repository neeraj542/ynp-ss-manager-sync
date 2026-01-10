# 🎯 Quick Reference - Order Screenshot Manager

## Common Commands

### Add Order (Web)
1. Open `index.html`
2. Fill form + upload screenshots
3. Click "Save Order"
4. Move downloads to `orders/ORDER_ID/`
5. Run: `python3 order-manager.py sync`

### Add Order (CLI)
```bash
python3 order-manager.py add ORDER_ID --product "Product Name" --platform "Amazon"
# Copy screenshots to orders/ORDER_ID/
python3 order-manager.py sync
```

### Search Order
```bash
./search-orders.sh ORDER_ID
```

### List All
```bash
python3 order-manager.py list
```

### Sync to GitHub
```bash
python3 order-manager.py sync
```

## File Structure
```
orders/ORDER_ID/
├── order.json
├── ordered.png
├── delivered.png
├── rating.png
├── review.png
└── returnWindow.png
```

## Screenshot Names
- `ordered.png` - Order confirmation
- `delivered.png` - Delivery status
- `rating.png` - Product rating
- `review.png` - Written review
- `returnWindow.png` - Return window

---

**That's it! Simple and permanent storage.** 🚀
