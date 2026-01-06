# GlobalTire — Professional Automotive Website

Modern, responsive website for GlobalTire automotive services with dark theme, smooth animations, and professional design.

**Live Demo:** Start a local server with `python3 -m http.server 8000` from this project folder.

---

## 🎨 Features

### Design & UX
- **Dark Theme** with premium color palette (deep blue background, yellow accents)
- **Smooth Animations** - Fade-in, slide-in effects on scroll
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Modern UI** - Glassmorphism effects, rounded corners, subtle shadows
- **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation

### Sections

1. **Hero Section**
   - Eye-catching headline with call-to-action buttons
   - Professional tire image
   - Smooth scroll navigation

2. **Products Catalog** (4 Premium Tires)
   - All-Season X1
   - OffRoad Pro
   - EcoDrive
   - Performance R
   - Each with image, description, price, and "View" button

3. **Services** (8 Professional Services)
   - Oil Changes
   - Batteries
   - Brake Repair
   - Engine Diagnostics
   - Tire Services
   - Preventative Maintenance
   - Transmission Services
   - Belts & Hoses
   - Each service includes professional image and description

4. **About Us**
   - Company commitment and values
   - "Why Choose Us" section with 5 key differentiators
   - Professional team image
   - Highlights: Certified technicians, top-quality brands (Goodyear, Dunlop, Kelly), competitive pricing

5. **Benefits Section**
   - Expert installation
   - Premium brands
   - Guaranteed fitment
   - Professional mechanic image

6. **Location Section**
   - Google Maps integration (3/4 width)
   - Contact information panel (1/4 width)
     - Address: 831 Harrison Avenue, New Jersey, 07032
     - Phone: +201 991 1200
     - Email: globalautocenterinc@gmail.com
   - Icons for each contact method

7. **Footer**
   - Contact form with validation
   - Useful links with SVG icons
   - Contact information with business hours
   - Social media links

### Interactive Features

- **Form Validation** - Real-time validation for contact form
  - Required fields: Name, Last Name, Email, Message
  - Email format validation
  - Phone number validation (optional)
  - Visual error feedback
  - Success message on submission

- **Smooth Scrolling** - Internal anchor links scroll smoothly
- **Mobile Menu** - Responsive hamburger menu with overlay
- **Hover Effects** - Cards, buttons, and links have smooth transitions
- **Footer Icons** - All footer links include relevant SVG icons with hover animations

---

## 📁 Project Structure

```
.
├── index.html              # Home page
├── about.html              # About page
├── services.html           # Main Services page
├── automotive-services.html # Detailed Automotive Services
├── shop.html               # Shop page
├── product.html            # Product Details page
├── contact.html            # Contact page
├── css/
│   ├── style.css           # Shared styles (dark theme, animations, responsive)
│   ├── about-styles.css
│   ├── contact-styles.css
│   ├── services-styles.css
│   └── shop-styles.css
├── js/
│   └── main.js             # Mobile menu, smooth scroll, footer form validation
├── images/                 # Logos, product/service images, favicon
├── scripts/
│   ├── download_and_optimize_images.sh
│   └── generate_variants.sh
└── README.md               # This file
```

---

## 🚀 Quick Start

### Local Testing

1. Navigate to the project folder:
```bash
cd /path/to/this/project
```

2. Start a local server:
```bash
python3 -m http.server 8000
```

3. Open in browser:
```
http://localhost:8000
```

### What to Test

- ✅ Scroll through all sections to see animations
- ✅ Hover over product cards and buttons
- ✅ Click navigation links (smooth scroll)
- ✅ Try the contact form (with/without valid data)
- ✅ Hover over footer links to see icon animations
- ✅ Test on mobile (resize browser or use dev tools)
- ✅ Check the Google Maps integration

---

## 🎯 Key Improvements Made

### Images
- Generated 13 professional images:
  - 1 hero image
  - 4 product images
  - 1 benefits image
  - 1 about us team image
  - 7 service images
  - 1 favicon
- All images optimized for web

### CSS Enhancements
- Added smooth scroll behavior
- Implemented fade-in/slide-in animations
- Enhanced card hover effects (lift + shadow)
- Improved button transitions with scale effects
- Added footer icon styles with hover animations
- Created responsive grid layouts for services and location
- Implemented 3/4 + 1/4 layout for map section

### JavaScript Features
- Form validation with real-time feedback
- Email and phone pattern validation
- Smooth scroll for internal links
- Mobile menu functionality
- Error message clearing on input

### New Sections
- **Services Grid**: 8 services in 4-column responsive grid
- **About Us**: Company information with mission and values
- **Location**: Google Maps + contact info panel

---

## 🎨 Design System

### Colors
- **Background**: `#020617` (Deep blue-black)
- **Surface**: `#0f172a` (Dark blue)
- **Accent**: `#ffcc26` (Yellow)
- **Text**: `#ffffff` (White)
- **Muted**: `rgba(255, 255, 255, 0.72)` (Light gray)

### Typography
- **Font**: Montserrat (Google Fonts) with system fallbacks
- **Headings**: Bold, large sizes
- **Body**: 16px base, 1.6 line-height

### Spacing
- **Sections**: 64px padding (top/bottom)
- **Grid gaps**: 24-32px
- **Card padding**: 20-24px

---

## 📱 Responsive Breakpoints

- **Desktop**: > 1100px (4-column grids)
- **Tablet**: 680px - 1100px (2-column grids)
- **Mobile**: < 680px (1-column, stacked layout)

---

## 🔧 Image Optimization (Optional)

If you want to generate WebP/AVIF variants for better performance:

### Using the provided scripts:

```bash
# Generate variants from *-original.png files
bash scripts/generate_variants.sh
```

### Manual optimization:

```bash
# Install tools (macOS)
brew install webp imagemagick libavif

# Convert to WebP
cwebp -q 80 images/hero-original.png -o images/hero.webp

# Convert to AVIF
magick images/hero-original.png -resize 1600x tmp.jpg
avifenc --min 30 --max 40 tmp.jpg images/hero.avif
rm tmp.jpg
```

---

## � WooCommerce Integration

This project is configured to fetch products from a WordPress/WooCommerce site.

### Configuration

1.  Open `js/woocommerce.js`.
2.  Locate `WC_CONFIG` at the top of the file.
3.  Update `consumerKey` and `consumerSecret` with your WooCommerce API credentials.

```javascript
const WC_CONFIG = {
    url: 'https://www.globaltireservices.com',
    consumerKey: 'ck_YOUR_CONSUMER_KEY',     // REPLACE THIS
    consumerSecret: 'cs_YOUR_CONSUMER_SECRET', // REPLACE THIS
    endpoint: '/wp-json/wc/v3/products',
    perPage: 4
};
```

**Note:** For security reasons, do not commit your real API keys to a public repository. In a production environment, you should use a backend proxy to handle API requests.

---

## �📝 Notes

- All images are currently PNG format for simplicity
- Form submission is client-side only (no backend)
- Google Maps uses embedded iframe (requires internet connection)
- All icons are inline SVG for performance
- No JS/CSS framework dependencies (vanilla JS/CSS). Uses Google Fonts.

---

## 🌟 Credits

- **Design Inspiration**: Modern automotive websites
- **Color Scheme**: Dark theme with yellow accents
- **Icons**: Custom SVG icons
- **Images**: AI-generated professional automotive images

---

## 📄 License

This is a mockup/demo project for GlobalTire.

---

**Last Updated**: January 2026