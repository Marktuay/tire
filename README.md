# GlobalTire — Professional Automotive Website

Modern, responsive website for GlobalTire automotive services with dark theme, smooth animations, and professional design.

**Live Demo (local):** Start a local server from this project folder.

- Recommended (supports `api-proxy.php`): `php -S localhost:8080`
- Then open: `http://localhost:8080/index.html`

Note: opening files via `file://` will prevent products from loading.

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
   - **Modern 5-column layout**: Menu, Account, Categories, Support, and Get in Touch.
   - Contact information with business hours
   - **Social media & Payment Trust Badges**: Integration with Bootstrap Icons and payment method logos.

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

### 🔧 Technical Architecture & WordPress Simulation

The project implements a **Headless Commerce Simulation** to replicate the behavior of a WordPress/WooCommerce backend within a static environment.

- **Mock REST API Integration**: Utilizes asynchronous JavaScript (`js/woocommerce.js`) to mimic WordPress REST API endpoints. This enables retrieval of product data (JSON objects) via `fetch` requests without a live server.
- **Client-Side Dynamic Rendering**:
  - **Tire Finder Engine**: A custom filtering logic (`js/main.js`) that queries local datasets to return search results dynamically within a modal interface, emulating server-side query processing.
  - **Related Products Algorithm**: Automates cross-selling by dynamically filtering and injecting product variants into the DOM based on current view context.
- **Scalable Component Logic**: Key interface elements (like the Footer and Navigation) are standardized to facilitate future template conversion into PHP/WordPress themes.

---

## ⚠️ Critical Development Notes & Pitfalls (For AI Agents & Developers)

This section documents technical challenges and architectural decisions made to resolve specific environment issues. **Read this before modifying core logic.**

### 1. Environment-Aware API Endpoints
**Inconvenience**: Local development environments like VS Code "Live Server" (ports 5500/5501) do not execute PHP.
**Solution**: `js/woocommerce.js` and `js/auth.js` use a ternary operator to detect the environment. 
- If port is `5500` or `5501`, they bypass the local `api-proxy.php` and connect directly to the production proxy at `https://www.globaltireservices.com/api-proxy.php`.
- **Pitfall**: If the remote server updates its CORS policy or proxy location, local development will break.

### 2. Authentication & Session Management
**Inconvenience**: `auth.js` was historically missing from several top-level HTML files, causing login/register failures on specific pages.
**Solution**: Ensure `<script src="js/auth.js"></script>` is present in ALL template files.
- **Pitfall**: Since this is a static site pretending to be dynamic, user state must be checked manually on DOM load across all pages.

### 3. Dynamic Footer & Caching
**Inconvenience**: The footer is injected via `js/footer.js` using `fetch('footer.html')`. Browsers aggressively cache this file, making UI changes invisible to users.
**Solution**: 
- The fetch call uses a timestamp: `fetch('footer.html?v=' + Date.now())`.
- CSS and JS links in HTML files use versioning (e.g., `css/style.css?v=1.1`) to force refreshes.
- **Pitfall**: When adding new columns to the footer, ensure `css/footer.css` is updated *and* old footer styles in the monolithic `css/style.css` are removed to avoid layout breakage.

### 4. CSS Monolithic Conflicts
**Inconvenience**: `css/style.css` contains nearly 4000 lines and often includes legacy/redundant footer styles that override the modular `css/footer.css`.
**Solution**: New footer logic relies on `display: grid` with 5 columns. Ensure media queries in `style.css` do not force `flex-direction: column` or `grid-template-columns: 1fr` prematurely on desktop.
- **Pitfall**: Always check for `!important` or high-specificity selectors in `style.css` before styling new components.

### 5. WooCommerce Secure Proxy
**Inconvenience**: Native WooCommerce REST API requires OAuth or Basic Auth headers which cannot be safely stored in frontend JS.
**Solution**: All requests MUST go through `api-proxy.php` (Server) or the remote equivalent (Local Dev). Do not attempt to add `consumer_key` to fetch calls directly.

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
│   ├── footer.js           # Footer injection + footer form validation
│   ├── main.js             # Global UI (menu, modals, etc.)
│   └── woocommerce.js      # Product fetch + rendering (Home/Shop/Product pages)
├── images/                 # Logos, product/service images, favicon
├── api-proxy.php           # Local/dev WooCommerce proxy (PHP)
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