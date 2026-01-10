# 📦 Order Screenshot Manager - File-Based Storage

A powerful tool to manage order screenshots with **permanent GitHub storage**. All data is stored as files in your repository, making it searchable, portable, and always backed up.

## 🎯 Key Features

- ✅ **Permanent Storage**: All data stored as files in GitHub
- 🔍 **Search by Order ID**: Instantly find any order
- 📁 **Organized Structure**: Each order in its own folder
- 🔄 **Auto-Sync**: One command to backup to GitHub
- 🌐 **Web Interface**: Easy upload and download
- 💻 **CLI Tool**: Powerful command-line management

---

## 🚀 Quick Start

### 1. Open Web Interface

```bash
open index.html
```

### 2. Add an Order

1. Enter Order ID (e.g., `AMZ123456789`)
2. Fill in product details
3. Upload 5 screenshots
4. Click "Save Order"
5. Files auto-download: `order.json` + 5 screenshots

### 3. Organize Files

```bash
# Create order folder
mkdir -p orders/AMZ123456789

# Move downloaded files there
mv ~/Downloads/order_AMZ123456789.json orders/AMZ123456789/order.json
mv ~/Downloads/ordered.png orders/AMZ123456789/
mv ~/Downloads/delivered.png orders/AMZ123456789/
# ... repeat for all screenshots
```

### 4. Sync to GitHub

```bash
python3 order-manager.py sync
```

---

## 📂 Folder Structure

```
order-screenshot-manager/
├── orders/
│   ├── AMZ123456789/
│   │   ├── order.json          # Order metadata
│   │   ├── ordered.png         # Order confirmation screenshot
│   │   ├── delivered.png       # Delivery screenshot
│   │   ├── rating.png          # Rating screenshot
│   │   ├── review.png          # Review screenshot
│   │   └── returnWindow.png    # Return window screenshot
│   └── FLP987654321/
│       └── ...
├── order-manager.py            # CLI tool
├── search-orders.sh            # Quick search script
├── sync-orders.sh              # Git sync script
└── index.html                  # Web interface
```

---

## 💻 CLI Commands

### Add Order
```bash
python3 order-manager.py add AMZ123456789 \
  --product "Wireless Headphones" \
  --date "2026-01-10" \
  --platform "Amazon"
```

### Search Order
```bash
python3 order-manager.py search AMZ123456789
# or use the quick script:
./search-orders.sh AMZ123456789
```

### List All Orders
```bash
python3 order-manager.py list
```

### Open Order Folder
```bash
python3 order-manager.py open AMZ123456789
```

### Delete Order
```bash
python3 order-manager.py delete AMZ123456789
```

### Sync to GitHub
```bash
python3 order-manager.py sync
```

---

## 🔄 Complete Workflow

### Method 1: Web Interface (Recommended)

1. **Open app**: `open index.html`
2. **Add order**: Fill form + upload screenshots
3. **Auto-download**: order.json + screenshots download
4. **Organize**: Move files to `orders/ORDER_ID/`
5. **Sync**: `python3 order-manager.py sync`

### Method 2: CLI Only

1. **Create order**: `python3 order-manager.py add ORDER_ID`
2. **Add screenshots**: Copy 5 screenshots to `orders/ORDER_ID/`
3. **Name them**: `ordered.png`, `delivered.png`, etc.
4. **Sync**: `python3 order-manager.py sync`

---

## 🔍 Searching Orders

### By Order ID
```bash
./search-orders.sh AMZ123456789
```

Output:
```
============================================================
📦 Order: AMZ123456789
============================================================
Product: Wireless Headphones
Platform: Amazon
Order Date: 2026-01-10
Created: 2026-01-10T22:30:00

📸 Screenshots (5):
  - ordered.png
  - delivered.png
  - rating.png
  - review.png
  - returnWindow.png

📁 Location: orders/AMZ123456789
============================================================
```

### List All Orders
```bash
python3 order-manager.py list
```

---

## 🔄 GitHub Sync Setup

### One-Time Setup

```bash
# Initialize git (if not already done)
git init
git remote add origin https://github.com/YOUR_USERNAME/order-screenshot-manager.git
git branch -M main

# First commit
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Daily Sync

```bash
python3 order-manager.py sync
```

This automatically:
- Adds all new orders
- Commits with timestamp
- Pushes to GitHub

---

## 📸 Screenshot Naming

The system expects these exact filenames:

| Filename | Description |
|----------|-------------|
| `ordered.png` | Order confirmation |
| `delivered.png` | Delivery status |
| `rating.png` | Product rating |
| `review.png` | Written review |
| `returnWindow.png` | Return/replacement window |

**Supported formats**: `.png`, `.jpg`, `.jpeg`

---

## 💡 Pro Tips

### Quick Search Alias
Add to your `~/.zshrc`:
```bash
alias search-order='~/Desktop/order-screenshot-manager/search-orders.sh'
```

Then use:
```bash
search-order AMZ123456789
```

### Auto-Organize Downloads
Create a script to auto-move downloads:
```bash
#!/bin/bash
ORDER_ID="$1"
mkdir -p orders/$ORDER_ID
mv ~/Downloads/order_$ORDER_ID.json orders/$ORDER_ID/order.json
mv ~/Downloads/*.png orders/$ORDER_ID/
```

### Backup Strategy
- **Local**: Files in repository folder
- **GitHub**: Automatic with `sync` command
- **Export**: Use web interface "Sync to GitHub" button

---

## 🛠️ Troubleshooting

### "Order not found"
- Check spelling of Order ID
- Run `python3 order-manager.py list` to see all orders

### Screenshots not showing
- Ensure filenames match exactly: `ordered.png`, `delivered.png`, etc.
- Check file extensions (`.png`, `.jpg`, `.jpeg`)

### Sync fails
- Check Git credentials
- Ensure remote is set: `git remote -v`
- Try manual push: `git push origin main`

### Web interface not downloading
- Check browser download settings
- Allow pop-ups for the page
- Try different browser

---

## 📊 Data Format

### order.json Structure
```json
{
  "id": "AMZ123456789",
  "productName": "Wireless Headphones",
  "orderDate": "2026-01-10",
  "platform": "Amazon",
  "createdAt": "2026-01-10T22:30:00",
  "updatedAt": "2026-01-10T22:30:00",
  "screenshots": [
    "ordered.png",
    "delivered.png",
    "rating.png",
    "review.png",
    "returnWindow.png"
  ]
}
```

---

## 🎯 Next Steps

1. ✅ Add your first order via web interface
2. ✅ Organize files in `orders/` folder
3. ✅ Sync to GitHub
4. ✅ Try searching with CLI
5. ✅ Set up search alias for convenience

---

**Your order screenshots are now permanently stored and searchable! 🎉**
