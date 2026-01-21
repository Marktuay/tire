# GlobalTire — Professional Automotive Website

Modern, responsive website for GlobalTire automotive services with dark theme, smooth animations, and professional design.

**Live Demo (local):** Start a local server from this project folder.

- Recommended (supports `api-proxy.php`): `php -S localhost:8080`
- Then open: `http://localhost:8080/index.html`

Note: opening files via `file://` will prevent products from loading correctly due to CORS/Fetch restrictions.

---

## 🎨 Features

### Design & UX
- **Dark Theme** with premium color palette (deep blue background, yellow accents).
- **Smooth Animations** - Fade-in, slide-in, and hover effects on scroll.
- **Responsive Architecture** - Modular CSS approach with page-specific overrides.
- **Modern UI** - Clean typography, card-based layouts, and intuitive navigation.
- **Accessibility** - Semantic HTML, ARIA labels, and keyboard-friendly controls.
### Sections

1. **Hero Section**
   - High-impact headlines with dual call-to-action buttons.
   - Support for specialized sub-sections like "Specials" with financing badges.

2. **Products Catalog**
   - Headless integration with WooCommerce to display tires dynamically.
   - Features All-Season, OffRoad, and Performance variants with real-time data.

3. **Services**
   - Comprehensive grid of 8+ professional automotive services.
   - Includes Oil Changes, Brake Repair, Transmission, and specialized Tire Services.

4. **About Us**
   - Narrative of company history, values, and team expertise.
   - Timeline and stats blocks for highlighting tenure and customer satisfaction.

5. **Location & Maps**
   - Interactive Google Maps integration.
   - Quick-contact panel with address and direct-dial links.

6. **Footer (Advanced)**
   - **Modular Design**: Separated into dedicated HTML and CSS files for easy maintenance.
   - **Integrated Form**: Quick contact form with real-time JavaScript validation.
   - **Business Hours**: Clearly organized weekly schedule located in the primary column.
   - **5-Column Link Grid**: Organized by Menu, Account, Categories, Support, and Contact Info.
   - **Payment Trust Badges**: Stable Wikimedia icons for Visa, Mastercard, Amex, PayPal, and Apple Pay.

### 🔧 Technical Architecture

#### CSS Organization
The project has moved from a monolithic CSS structure to a **Modular System**:
- `css/style.css`: Global variables, typography, navigation, and shared components.
- `css/footer.css`: Dedicated styles for the dynamic footer, payment icons, and business hours.
- `css/about-styles.css`, `css/contact-styles.css`, etc.: Page-specific overrides to reduce global bloat.

#### Iconography
Successfully transitioned from complex manual SVGs to **Bootstrap Icons**:
- Improved loading performance and reduced HTML file size.
- Consistent styling across header, body sections, and footer links.
- Easy customization via standard CSS `font-size` and `color` properties.

#### WordPress / WooCommerce Simulation
- **Serverless API Discovery**: JavaScript detects the environment (Local vs. Production) and routes API calls through the appropriate PHP Proxy.
- **Dynamic Injection**: Components like the footer and shop categories are injected via `fetch`, allowing for site-wide updates by editing a single file.

---

## ⚠️ Critical Development Notes

### 1. CSS Syntax & Monoliths
Historically, `style.css` was very large. It has been cleaned and balanced. **Important**: Always verify brace `{ }` balance when adding new global rules. Media queries must be placed carefully at the bottom of the file to ensure correct inheritance.

### 2. Dynamic Component Versioning
Because the browser aggressively caches the injected `footer.html`, the `footer.js` script includes a timestamp or version string in the fetch call. When making UI changes, increment the version in the HTML link (e.g., `?v=1.2`) to force a client-side update.

### 3. Payment Icon Logic
Payment icons in the footer use stable Wikimedia SVG URLs. Ensure the `object-fit: contain` property is maintained in `footer.css` to prevent logo distortion on different devices.

---

## 📁 Project Structure

```
.
├── index.html              # Home page
├── about.html              # About page
├── automotive-services.html # Detailed Services
├── contact.html            # Contact page
├── shop.html               # Shop / E-commerce page
├── footer.html             # FOOTER FRAGMENT (Dynamic)
├── css/
│   ├── style.css           # Global core styles
│   ├── footer.css          # Dedicated footer component
│   ├── about-styles.css    # Page-specific
│   └── ...                 # Other page-specific CSS files
├── js/
│   ├── footer.js           # Dynamic injection & validation
│   ├── auth.js             # Session / Login logic
│   ├── main.js             # Global interactions
│   └── woocommerce.js      # API / Product logic
├── images/                 # Optimized assets & logos
└── api-proxy.php           # Secure WC API Bridge
```

---

## 🚀 Quick Start

1. **Serve the project**:
   ```bash
   php -S localhost:8000
   ```
2. **Access the site**: `http://localhost:8000`.
3. **Verify Header/Footer**: Ensure icons load (requires Bootstrap Icons CDN or local assets).

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

### 🔧 Backend & API Configuration (Secure Proxy)

This project uses a **PHP Proxy (`api-proxy.php`)** to communicate securely with the WooCommerce API. This prevents exposing your API keys (Consumer Key/Secret) in the frontend code.

#### 1. Server-Side Setup (Production)
The `api-proxy.php` file must be uploaded to the root of your public web server (e.g., `https://www.globaltireservices.com/api-proxy.php`).

This file contains your sensitive credentials:
```php
// api-proxy.php on the server
$consumerKey = 'ck_...';    // Your REAL Key
$consumerSecret = 'cs_...'; // Your REAL Secret
```

#### 2. Client-Side Setup (Local Development)
You can work on the frontend (`index.html`, `js/*.js`) locally on your machine. The Javascript files are configured to point to the **remote** proxy on the live server.

**`js/woocommerce.js` & `js/main.js` configuration:**
```javascript
const WC_CONFIG = {
    // Points to the live server proxy
    endpoint: 'https://www.globaltireservices.com/api-proxy.php',
    // ...
};
```

**Benefits:**
- **Security:** Keys are never sent to the browser.
- **CORS:** The proxy handles Cross-Origin headers, allowing local development against the live API.
- **Convenience:** No need to run a local PHP server; just open the HTML file.

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