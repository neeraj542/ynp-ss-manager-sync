# 📦 Order Screenshot Manager

A simple yet powerful tool to manage screenshots for your WhatsApp group order reviews. This tool helps you organize, store, and sync your order screenshots both locally and to GitHub.

## 🎯 Features

- ✅ **Easy Screenshot Upload**: Upload 5 types of screenshots per order (Ordered, Delivered, Rating, Review, Return Window)
- 📁 **Organized Storage**: Automatically names files as `{type}_ss_{order-id}.{ext}`
- 🔍 **Search Functionality**: Quickly find orders by ID, product name, or platform
- 📊 **Statistics Dashboard**: Track total orders and screenshots
- 💾 **Local Storage**: All data stored in your browser's localStorage
- 📤 **Export to GitHub**: Easy sync with GitHub repository
- 🌙 **Beautiful Dark UI**: Modern, premium design with smooth animations

## 🚀 Getting Started

### 1. Open the Application

Simply open `index.html` in your web browser:

```bash
cd /Users/51xneeraj/.gemini/antigravity/scratch/order-screenshot-manager
open index.html
```

### 2. Add Your First Order

1. Fill in the **Order ID** (required)
2. Add optional details: Product Name, Order Date, Platform
3. Upload screenshots for each stage
4. Click **Save Order**

### 3. Download Screenshots

After saving an order, you can:
- **Download Individual Screenshots**: Click on any thumbnail to view full size, then right-click to save
- **Download All**: Click the "Download All" button on any order to download all screenshots at once

## 📂 Recommended Folder Structure

Create this folder structure on your computer to organize screenshots:

```
~/Documents/OrderScreenshots/
├── Amazon/
│   ├── AMZ123456789/
│   │   ├── ordered_ss_AMZ123456789.png
│   │   ├── delivered_ss_AMZ123456789.png
│   │   ├── rating_ss_AMZ123456789.png
│   │   ├── review_ss_AMZ123456789.png
│   │   └── returnWindow_ss_AMZ123456789.png
│   └── AMZ987654321/
├── Flipkart/
├── Meesho/
└── Other/
```

## 🔄 Syncing with GitHub

### Initial Setup

1. **Create a GitHub Repository**:
   ```bash
   # On GitHub, create a new private repository named "order-screenshots"
   ```

2. **Initialize Local Git Repository**:
   ```bash
   cd ~/Documents/OrderScreenshots
   git init
   git remote add origin https://github.com/YOUR_USERNAME/order-screenshots.git
   ```

3. **Create a .gitignore** (to exclude large files if needed):
   ```bash
   echo "*.mp4" > .gitignore
   echo "*.mov" >> .gitignore
   ```

### Syncing Process

1. **Export Data from Web App**:
   - Click the "🔄 Sync to GitHub" button
   - This downloads an `orders-export-{date}.json` file

2. **Download Screenshots**:
   - Use the "Download All" button for each order
   - Organize them in your local folder structure

3. **Commit and Push to GitHub**:
   ```bash
   cd ~/Documents/OrderScreenshots
   
   # Add all files
   git add .
   
   # Commit with a meaningful message
   git commit -m "Added orders from $(date +%Y-%m-%d)"
   
   # Push to GitHub
   git push origin main
   ```

### Automated Sync Script

Create a script to automate the sync process:

```bash
#!/bin/bash
# save as: sync-orders.sh

cd ~/Documents/OrderScreenshots

# Add all new files
git add .

# Commit with timestamp
git commit -m "Order screenshots update - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
git push origin main

echo "✅ Sync complete!"
```

Make it executable:
```bash
chmod +x sync-orders.sh
```

Run it whenever you want to sync:
```bash
./sync-orders.sh
```

## 📱 Usage Workflow

### Daily Workflow:

1. **Receive Order Details** from WhatsApp group
2. **Take Screenshots** as you complete each step
3. **Open the Web App** (`index.html`)
4. **Add New Order** with all details
5. **Upload Screenshots** for all 5 stages
6. **Download All** screenshots to your local folder
7. **Organize** in appropriate platform folder
8. **Sync to GitHub** when ready

### Weekly Sync:

```bash
# Navigate to your screenshots folder
cd ~/Documents/OrderScreenshots

# Run the sync script
./sync-orders.sh
```

## 🎨 Screenshot Types

| Type | Icon | Description |
|------|------|-------------|
| **Ordered** | 📸 | Screenshot of order confirmation |
| **Delivered** | 📦 | Screenshot showing delivery status |
| **Rating** | ⭐ | Screenshot of product rating |
| **Review** | ✍️ | Screenshot of written review |
| **Return Window** | 🔄 | Screenshot of return/replacement window |

## 💡 Tips

1. **Consistent Naming**: Always use the exact Order ID from the platform
2. **Backup Regularly**: Sync to GitHub at least weekly
3. **Export Data**: Use the export feature to backup your order metadata
4. **Browser Storage**: Data is stored in localStorage - don't clear browser data
5. **Multiple Devices**: Export/import JSON files to transfer between devices

## 🔒 Privacy & Security

- All data is stored **locally** in your browser
- Screenshots are **never uploaded** to any server
- GitHub repository should be set to **private**
- Consider using **Git LFS** for large files

## 🛠️ Troubleshooting

### Screenshots not saving?
- Check browser console for errors
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Try a smaller image size

### Lost data?
- Check if you cleared browser data
- Restore from GitHub if you've synced before
- Import from exported JSON file

### Can't sync to GitHub?
- Ensure Git is installed: `git --version`
- Check your GitHub credentials
- Verify repository URL is correct

## 📞 Support

For issues or questions, refer to this README or check the browser console for error messages.

---

**Happy Organizing! 📦✨**
