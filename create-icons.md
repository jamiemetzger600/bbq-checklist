# Creating App Icons for BBQ Checklist

Since we need proper app icons for PWA and native apps, here are your options:

## 🎨 Quick Icon Creation Options

### Option 1: Canva (Perfect for your workflow!)
1. Create **512x512** design in Canva
2. Use BBQ theme: 🔥 flame icon on brown (#8B4513) background
3. Export as PNG
4. Use online tool to resize to different sizes:
   - **192x192** (PWA minimum)
   - **512x512** (PWA recommended)
   - **1024x1024** (App store requirement)

### Option 2: Free Online Icon Generators
- **PWABuilder**: https://www.pwabuilder.com/imageGenerator
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **App Icon Generator**: https://appicon.co/

### Option 3: Simple DIY
Create a simple design with:
- **Background**: BBQ brown (#8B4513)
- **Icon**: White flame or grill symbol
- **Text**: "BBQ" in bold white letters

## 📱 Required Sizes

### PWA Icons
```json
"icons": [
  { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```

### iOS App Store (if using Capacitor)
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)

### Android (if using Capacitor)
- 512x512 (Play Store)
- Various densities (xxxhdpi, xxhdpi, xhdpi, hdpi, mdpi)

## 🔥 Design Suggestions

### Color Palette
- **Primary**: #8B4513 (Saddle Brown)
- **Accent**: #FF6347 (Tomato/Fire)
- **Text**: #FFFFFF (White)

### Icon Ideas
1. **Flame + Timer**: 🔥⏰ combining your two key features
2. **BBQ Grill**: Simple grill grate with flame underneath
3. **Checkmark + Meat**: ✅🥩 representing the checklist aspect
4. **Clock + Flame**: Emphasizing the timing feature

Would you like me to help you create the icon using Canva, or should we continue with placeholder icons for now? 