#!/bin/bash

# BBQ Checklist - Capacitor Setup Script
# Run this when ready to create native iOS/Android apps

echo "📱 BBQ Checklist - Capacitor Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed"
    echo "   Install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "🔧 Setting up Capacitor..."

# Initialize npm if not already done
if [ ! -f "package.json" ]; then
    echo "📦 Initializing npm..."
    npm init -y
fi

# Install Capacitor
echo "📱 Installing Capacitor..."
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
echo "⚙️  Initializing Capacitor..."
npx cap init "BBQ Checklist" "com.bbqchecklist.app"

# Add platforms (optional prompts)
echo ""
read -p "📱 Add iOS platform? (requires macOS + Xcode) [y/N]: " add_ios
if [[ $add_ios =~ ^[Yy]$ ]]; then
    npm install @capacitor/ios
    npx cap add ios
    echo "✅ iOS platform added"
fi

echo ""
read -p "🤖 Add Android platform? [y/N]: " add_android
if [[ $add_android =~ ^[Yy]$ ]]; then
    npm install @capacitor/android
    npx cap add android
    echo "✅ Android platform added"
fi

# Copy web assets
echo ""
echo "📂 Copying web assets to native projects..."
npx cap copy

echo ""
echo "🎉 Capacitor setup complete!"
echo ""
echo "📱 Next steps:"
echo "   - iOS: npx cap open ios (opens Xcode)"
echo "   - Android: npx cap open android (opens Android Studio)"
echo ""
echo "📚 Useful commands:"
echo "   - npx cap copy    (copy web changes to native apps)"
echo "   - npx cap sync    (copy + update native dependencies)"
echo "   - npx cap run ios (build and run on iOS simulator)"
echo "   - npx cap run android (build and run on Android)" 