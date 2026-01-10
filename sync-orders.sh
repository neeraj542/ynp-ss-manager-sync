#!/bin/bash

# Order Screenshot Manager - GitHub Sync Script
# This script helps you sync your order screenshots to GitHub

echo "📦 Order Screenshot Manager - GitHub Sync"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "⚠️  Git repository not initialized in this directory."
    echo ""
    read -p "Would you like to initialize it now? (y/n): " init_choice
    
    if [ "$init_choice" = "y" ] || [ "$init_choice" = "Y" ]; then
        echo ""
        read -p "Enter your GitHub repository URL: " repo_url
        
        git init
        git remote add origin "$repo_url"
        
        echo "✅ Git repository initialized!"
        echo ""
    else
        echo "❌ Sync cancelled. Please initialize Git manually."
        exit 1
    fi
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to sync. Everything is up to date!"
    exit 0
fi

# Show status
echo "📋 Changes to be synced:"
echo ""
git status --short
echo ""

# Confirm sync
read -p "Do you want to sync these changes to GitHub? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Sync cancelled."
    exit 0
fi

# Add all files
echo ""
echo "📁 Adding files..."
git add .

# Commit with timestamp
commit_message="Order screenshots update - $(date '+%Y-%m-%d %H:%M:%S')"
echo "💾 Committing changes..."
git commit -m "$commit_message"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main 2>&1 || git push origin master 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Sync complete! Your screenshots are now on GitHub."
    echo "🕒 Last synced: $(date '+%Y-%m-%d %H:%M:%S')"
else
    echo ""
    echo "❌ Push failed. Please check your GitHub credentials and repository settings."
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Ensure you have push access to the repository"
    echo "2. Check if you need to authenticate with GitHub"
    echo "3. Try: git push -u origin main"
fi
