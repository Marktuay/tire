/**
 * WooCommerce API Connector
 * Connects to GlobalTire Services WordPress API to fetch products
 */

const WC_CONFIG = {
    url: 'https://www.globaltireservices.com',
    consumerKey: 'ck_958c162b7c6421798c910b8ee4dcaa18649f718f',     // REPLACE WITH REAL KEY
    consumerSecret: 'cs_d9c3c63344a66c596b913a773d44ac69a9668a40', // REPLACE WITH REAL SECRET
    endpoint: '/wp-json/wc/v3/products',
    perPage: 4
};

document.addEventListener('DOMContentLoaded', () => {
    initWooCommerceFetch();
});

async function initWooCommerceFetch() {
    // Check if we are on the single product details page
    const detailContainer = document.getElementById('product-detail-container');
    if (detailContainer) {
        console.log('WooCommerce: Detected Single Product Page');
        await initProductPage(detailContainer);
        return;
    }

    // Determine which page we are on and select the appropriate container
    const homeContainer = document.getElementById('products-container'); // index.html
    const shopContainer = document.getElementById('shop-products-container'); // shop.html
    
    // Select the active container
    const container = homeContainer || shopContainer;
    
    // Debugging: verify execution
    console.log('WooCommerce: Init');
    if (homeContainer) console.log('WooCommerce: Detected Home Page');
    if (shopContainer) console.log('WooCommerce: Detected Shop Page');

    if (!container) {
        console.warn('WooCommerce: No container found');
        return;
    }

    // Different settings for Shop page vs Home page
    const isShopPage = !!shopContainer;
    const limit = isShopPage ? 12 : 4; // Fetch more for shop page

    // Check if we have valid keys (basic check)
    if (WC_CONFIG.consumerKey.includes('YOUR_CONSUMER_KEY')) {
        console.warn('WooCommerce: API Consumer Key/Secret not configured. Using static content.');
        return; 
    }

    try {
        // Show loading state (console only to avoid UI flicker if fast)
        console.log('WooCommerce: Fetching products...');
        
        const products = await fetchProducts(limit);
        console.log(`WooCommerce: Fetched ${products.length} products`);

        if (products && products.length > 0) {
            if (isShopPage) {
                renderShopProducts(products, container);
            } else {
                renderProducts(products, container);
            }
        } else {
             console.warn('WooCommerce: No products returned');
        }
    } catch (error) {
        console.error('WooCommerce: Connection failed', error);
        // Fallback is to do nothing, leaving static content visible
    }
}

async function fetchProducts(perPage = 4) {
    // Note: In a production environment, never expose keys in client-side code.
    // Use a proxy server. This is for demonstration/local dev only.
    
    const requestUrl = new URL(WC_CONFIG.endpoint, WC_CONFIG.url);
    requestUrl.searchParams.append('consumer_key', WC_CONFIG.consumerKey);
    requestUrl.searchParams.append('consumer_secret', WC_CONFIG.consumerSecret);
    requestUrl.searchParams.append('per_page', perPage);

    const response = await fetch(requestUrl.toString());
    if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
    }
    return await response.json();
}

async function fetchProductById(id) {
    const requestUrl = new URL(`${WC_CONFIG.endpoint}/${id}`, WC_CONFIG.url);
    requestUrl.searchParams.append('consumer_key', WC_CONFIG.consumerKey);
    requestUrl.searchParams.append('consumer_secret', WC_CONFIG.consumerSecret);

    const response = await fetch(requestUrl.toString());
    if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
    }
    return await response.json();
}

async function initProductPage(container) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = '<p style="color:white; text-align:center;">Product not found.</p>';
        return;
    }

    try {
        const product = await fetchProductById(productId);
        renderSingleProduct(product, container);
    } catch (error) {
        console.error('WooCommerce: Failed to fetch product', error);
        container.innerHTML = '<p style="color:white; text-align:center;">Error loading product details.</p>';
    }
}

function renderSingleProduct(product, container) {
    // Handle Image
    const imageUrl = product.images && product.images.length > 0 
        ? product.images[0].src 
        : 'images/placeholder-tire.png';
    const imageAlt = product.images && product.images.length > 0 
        ? product.images[0].alt 
        : product.name;

    // Get description (full HTML allowed for detail page)
    const description = product.description || product.short_description || 'No description available.';

    // Format Price
    let priceHtml = product.price_html || `$${product.price}`;
    
    // Category
    const category = product.categories && product.categories.length > 0 
        ? product.categories[0].name 
        : 'Tires';

    // Link to external buy (optional, or maybe we want a cart system later)
    // For now, "Buy Now" can still go to external, OR we keep it simple.
    // The user moved from external link to internal page, so the "Buy Now" inside the product page 
    // might still need to go to WooCommerce or an actual checkout.
    // Assuming for now the "Buy Now" on the detail page goes to the external checkout/product page.
    const externalLink = product.permalink; 

    container.innerHTML = `
        <div class="product-detail-wrapper">
            <div class="product-detail-image">
                <img src="${imageUrl}" alt="${imageAlt}">
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <p style="color: var(--accent); font-weight: 600; text-transform: uppercase;">${category}</p>
                <div class="product-detail-price">${priceHtml}</div>
                <div class="product-detail-description">
                    ${description}
                </div>
                <div class="product-actions" style="margin-top: 30px;">
                     <a href="${externalLink}" target="_blank" class="btn primary">Buy on Website</a>
                     <a href="shop.html" class="btn ghost">Back to Shop</a>
                </div>
            </div>
        </div>
    `;
}

function renderProducts(products, container) {
    // Clear static content
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('article');
        card.className = 'card dark-card';
        
        // Handle Image
        const imageUrl = product.images && product.images.length > 0 
            ? product.images[0].src 
            : 'images/placeholder-tire.png';
        const imageAlt = product.images && product.images.length > 0 
            ? product.images[0].alt 
            : product.name;

        // Strip HTML from short description
        const doc = new DOMParser().parseFromString(product.short_description || '', 'text/html');
        const description = doc.body.textContent || doc.body.innerText || '';

        // Format Price
        let priceHtml = product.price_html || `$${product.price}`;
        let activePrice = priceHtml;

        // Extract <ins> content if available (sale price)
        if (priceHtml.includes('<ins>')) {
             const tempDiv = document.createElement('div');
             tempDiv.innerHTML = priceHtml;
             const ins = tempDiv.querySelector('ins');
             if (ins) activePrice = ins.textContent;
        } else {
            // Flatten html
             activePrice = priceHtml.replace(/<[^>]*>?/gm, '');
        }

        card.innerHTML = `
            <picture>
                <img src="${imageUrl}" alt="${imageAlt}" loading="lazy" style="width: 100%; height: auto; object-fit: cover; aspect-ratio: 4/3;">
            </picture>
            <div class="card-body">
                <h3>${product.name}</h3>
                <div class="meta">
                    <span class="price" style="font-weight: bold; color: var(--accent);">${activePrice}</span>
                    <a class="btn small" href="product.html?id=${product.id}">View</a>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function renderShopProducts(products, container) {
    // Clear static content
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card-shop';
        
        // Try to get category from product
        const category = product.categories && product.categories.length > 0 
            ? product.categories[0].name 
            : 'Tires';
            
        // Used for filtering if needed
        const categorySlug = product.categories && product.categories.length > 0
            ? product.categories[0].slug
            : 'all';

        card.setAttribute('data-category', categorySlug);

        // Handle Image
        const imageUrl = product.images && product.images.length > 0 
            ? product.images[0].src 
            : 'images/placeholder-tire.png';
        const imageAlt = product.images && product.images.length > 0 
            ? product.images[0].alt 
            : product.name;

        // Strip HTML from short description
        const doc = new DOMParser().parseFromString(product.short_description || '', 'text/html');
        const description = doc.body.textContent || doc.body.innerText || '';

        // Format Price
        let priceHtml = product.price_html || `$${product.price}`;
        let activePrice = priceHtml;

        // Extract <ins> content if available (sale price)
        if (priceHtml.includes('<ins>')) {
             const tempDiv = document.createElement('div');
             tempDiv.innerHTML = priceHtml;
             const ins = tempDiv.querySelector('ins');
             if (ins) activePrice = ins.textContent;
        } else {
            // Flatten html
             activePrice = priceHtml.replace(/<[^>]*>?/gm, '');
        }

        card.innerHTML = `
            <div class="product-image-shop">
                <img src="${imageUrl}" alt="${imageAlt}" loading="lazy" style="width: 100%; height: auto; object-fit: cover; aspect-ratio: 1/1;">
            </div>
            <div class="product-info-shop">
                <h3>${product.name}</h3>
                <p class="product-category">${category}</p>
                <div class="product-footer">
                    <p class="product-price">${activePrice}<span></span></p>
                    <a href="product.html?id=${product.id}" class="btn primary">View Details</a>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}
