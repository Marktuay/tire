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
    const limit = isShopPage ? 100 : 4; // Fetch more for shop page

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
                // Initialize Pagination for Shop Page
                initShopPagination(products, container);
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
        
        // Load Related Products
        initRelatedProducts(productId);

    } catch (error) {
        console.error('WooCommerce: Failed to fetch product', error);
        container.innerHTML = '<p style="color:white; text-align:center;">Error loading product details.</p>';
    }
}

async function initRelatedProducts(currentProductId) {
    const relatedContainer = document.getElementById('related-products-grid');
    const relatedSection = document.getElementById('related-products-section');
    
    if (!relatedContainer || !relatedSection) return;

    try {
        // Fetch products (fetch mostly random/latest)
        // We fetch slightly more to filter out the current one
        let products = await fetchProducts(6); 
        
        // Filter out current product
        products = products.filter(p => p.id != currentProductId).slice(0, 5); // Take max 5

        if (products.length > 0) {
            relatedSection.style.display = 'block';
            renderRelatedProducts(products, relatedContainer);
        }

    } catch (error) {
        console.warn('WooCommerce: Failed to fetch related products', error);
    }
}

function renderRelatedProducts(products, container) {
    container.innerHTML = '';
    products.forEach(product => {
         // Handle Image
         const imageUrl = product.images && product.images.length > 0 
         ? product.images[0].src 
         : 'images/placeholder-tire.png';
         
         // Format Price
         let priceHtml = product.price_html || `$${product.price}`;
         // Simple strip of HTML for related text if it's simple
         const tempPrice = document.createElement('div');
         tempPrice.innerHTML = priceHtml;
         // If it has del/ins, keep it, otherwise just use text
         
        const card = document.createElement('div');
        card.className = 'related-product-card';
        card.innerHTML = `
            <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                <h4>${product.name}</h4>
                <div class="related-product-price">${priceHtml}</div>
                <span class="btn ghost small" style="margin-top: auto;">View</span>
            </a>
        `;
        container.appendChild(card);
    });
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

// Shop Pagination & Filtering Logic
let currentShopPage = 1;
const itemsPerPage = 20;
let shopProductsAll = [];
let shopProductsFiltered = [];

function initShopPagination(products, container) {
    shopProductsAll = products;
    shopProductsFiltered = products;
    currentShopPage = 1;
    
    initCategoryFilters(container);
    renderShopPage(container);
    renderPaginationControls();
}

function initCategoryFilters(container) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.onclick = () => {
             // Update UI
             buttons.forEach(b => b.classList.remove('active'));
             btn.classList.add('active');
             
             // Filter
             const category = btn.getAttribute('data-category');
             filterShopProducts(category, container);
        };
    });
}

function filterShopProducts(category, container) {
    if (category === 'all') {
        shopProductsFiltered = shopProductsAll;
    } else {
        shopProductsFiltered = shopProductsAll.filter(p => {
             // Robust check against all categories in string format or slug
             if (!p.categories) return false;
             // We check if any of the product's categories match the selected filter (by slug or name)
             // "offroad" might be "off-road" in api, so we check inclusion
             return p.categories.some(c => 
                c.slug.toLowerCase().includes(category) || 
                c.name.toLowerCase().includes(category)
             );
        });
    }
    
    currentShopPage = 1;
    renderShopPage(container);
    renderPaginationControls();
}

function renderShopPage(container) {
    const startIndex = (currentShopPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = shopProductsFiltered.slice(startIndex, endIndex);

    if (pageProducts.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: var(--muted);"><h3>No products found in this category</h3><p>Try selecting another category or viewing all items.</p></div>';
    } else {
        renderShopProducts(pageProducts, container);
    }
    
    // Scroll to top of products container
    const shopSection = document.getElementById('shop-products-container');
    if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderPaginationControls() {
    const paginationContainer = document.getElementById('shop-pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(shopProductsFiltered.length / itemsPerPage);

    if (totalPages <= 1) return;
    
    // Helper for buttons
    const createBtn = (html, page, isCurrent = false, isDisabled = false) => {
        const btn = document.createElement('button');
        // Active page uses primary style, others ghost
        // We override min-width to make numbers look more uniform/square-ish
        btn.className = isCurrent ? 'btn primary small' : 'btn ghost small';
        btn.innerHTML = html;
        btn.style.minWidth = '40px'; 
        btn.style.padding = '0 10px';
        
        if (isDisabled) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'default';
        } else if (!isCurrent) {
            btn.onclick = () => {
                currentShopPage = page;
                renderShopPage(document.getElementById('shop-products-container'));
                renderPaginationControls();
            };
        }
        return btn;
    };

    // Prev Button
    paginationContainer.appendChild(createBtn('<i class="bi bi-chevron-left"></i>', currentShopPage - 1, false, currentShopPage === 1));

    // Page Numbers logic
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.appendChild(createBtn(i, i, i === currentShopPage));
        }
    } else {
        const window = 1;
        paginationContainer.appendChild(createBtn(1, 1, 1 === currentShopPage));
        
        if (currentShopPage - window > 2) {
             const dots = document.createElement('span');
             dots.innerText = '...';
             dots.style.color = 'white';
             dots.style.alignSelf = 'center';
             paginationContainer.appendChild(dots);
        }

        for (let i = Math.max(2, currentShopPage - window); i <= Math.min(totalPages - 1, currentShopPage + window); i++) {
             paginationContainer.appendChild(createBtn(i, i, i === currentShopPage));
        }

        if (currentShopPage + window < totalPages - 1) {
             const dots = document.createElement('span');
             dots.innerText = '...';
             dots.style.color = 'white';
             dots.style.alignSelf = 'center';
             paginationContainer.appendChild(dots);
        }

        paginationContainer.appendChild(createBtn(totalPages, totalPages, totalPages === currentShopPage));
    }

    // Next Button
    paginationContainer.appendChild(createBtn('<i class="bi bi-chevron-right"></i>', currentShopPage + 1, false, currentShopPage === totalPages));
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
