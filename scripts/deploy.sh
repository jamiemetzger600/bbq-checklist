#!/bin/bash

# BBQ Checklist - Easy Deploy Script
# Run this whenever you want to update your live app

echo "🔥 BBQ Checklist - Deploy Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if there are changes to commit
if [[ -z $(git status -s) ]]; then
    echo "❌ No changes to deploy"
    exit 1
fi

# Show what will be committed
echo "📝 Changes to deploy:"
git status -s

# Prompt for commit message
echo ""
read -p "📝 Commit message (or press Enter for default): " commit_msg

if [[ -z "$commit_msg" ]]; then
    commit_msg="Update BBQ Checklist app"
fi

# Commit and push
echo ""
echo "🚀 Deploying changes..."
git add .
git commit -m "$commit_msg"
git push origin main

echo ""
echo "✅ Deploy complete!"
echo "🌐 Your app will update at: https://jamiemetzger600.github.io/bbq-checklist/"
echo "⏱️  Updates typically go live within 2-5 minutes" 