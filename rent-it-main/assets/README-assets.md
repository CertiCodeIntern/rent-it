# 📁 Static Assets

> Images, icons, and other static media files.

## 📁 Structure

```
assets/
├── 📁 images/        # Image files (PNG, JPG, WebP, SVG)
└── 📁 icons/         # Icon files (SVG, ICO)
```

## 🎯 Purpose

Store all static media assets here:
- Logo files
- Background images
- User avatars (default)
- Product photos
- Marketing graphics
- Favicon files

## 📝 Usage

```html
<!-- Reference from any page -->
<img src="/assets/images/logo.png" alt="Logo">

<!-- In CSS -->
background-image: url('/assets/images/hero-bg.jpg');
```

## 📋 Naming Convention

```
images/
├── logo-light.svg       # Logo for light backgrounds
├── logo-dark.svg        # Logo for dark backgrounds
├── hero-bg.jpg          # Hero background
├── feature-1.png        # Feature images
└── avatar-default.png   # Default user avatar

icons/
├── favicon.ico          # Browser favicon
├── icon-192.png         # PWA icon
├── icon-512.png         # PWA icon large
└── social-*.svg         # Social media icons
```

## 🖼️ Image Guidelines

### Formats
- **SVG** - Logos, icons (scalable)
- **WebP** - Photos with transparency (modern)
- **JPG** - Photos without transparency
- **PNG** - Graphics with transparency

### Optimization
- Compress images before adding
- Use appropriate dimensions
- Consider lazy loading for large images

---

*See [/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) for full project structure*
