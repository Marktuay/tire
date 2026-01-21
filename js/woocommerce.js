/**
 * WooCommerce API Connector
 * Connects to GlobalTire Services WordPress API to fetch products
 */

const WC_CONFIG = {
    // Use local proxy when developing on localhost (avoids browser CORS issues).
    // In production (globaltireservices.com) it can hit the live proxy directly.
    endpoint: (() => {
        const host = window.location.hostname;
        const port = window.location.port;
        const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
        
        // If running on Live Server (port 5500) or similar, we use the remote proxy
        // because Live Server does not execute PHP scripts (api-proxy.php).
        if (isLocal && (port === '5500' || port === '5501' || port === '3000')) {
            return 'https://www.globaltireservices.com/api-proxy.php';
        }
        
        return isLocal ? './api-proxy.php' : 'https://www.globaltireservices.com/api-proxy.php';
    })(),
    perPage: 4
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWooCommerceFetch);
} else {
    initWooCommerceFetch();
}

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

    // If opened directly from the filesystem, fetches are commonly blocked (origin "null").
    // Provide a clear message instead of leaving the user with a blank/skeleton UI.
    if (window.location.protocol === 'file:') {
        console.warn('WooCommerce: Detected file:// protocol. Use a local server for API requests.');
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);">
                <h3 style="color: white; margin-bottom: 10px;">Products can’t load from file://</h3>
                <p style="margin: 0;">Run a local server (e.g. <strong>php -S localhost:8080</strong>) and open <strong>http://localhost:8080</strong>.</p>
            </div>
        `;
        return;
    }

    // Different settings for Shop page vs Home page
    const isShopPage = !!shopContainer;
    const limit = isShopPage ? 100 : 4; // Fetch more for shop page
    
    // For Home Page (index.html), user wants "Most Viewed" -> We use 'popularity' (Total Sales) as a standard proxy
    // For Shop Page, default to 'date' (Newest)
    const orderBy = isShopPage ? 'date' : 'popularity';

    // Check if endpoint is configured
    if (!WC_CONFIG.endpoint) {
        console.warn('WooCommerce: API Endpoint not configured.');
        return; 
    }

    // Preserve existing markup so we can restore it if the API call fails.
    const originalMarkup = container.innerHTML;

    try {
        // Show loading state (Skeleton UI)
        renderSkeleton(container, isShopPage ? 8 : 4);
        
        console.log('WooCommerce: Fetching products...');
        
        const products = await fetchProducts(limit, orderBy);
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
        // Restore original markup so the page isn't stuck in a loading state.
        container.innerHTML = originalMarkup;
    }
}

async function fetchProducts(perPage = 4, orderBy = 'date', order = 'desc') {
    // Note: In a production environment, never expose keys in client-side code.
    // Use a proxy server. This is for demonstration/local dev only.
    
    // Updated to use local PHP proxy
    const requestUrl = new URL(WC_CONFIG.endpoint, window.location.href);
    requestUrl.searchParams.append('per_page', perPage);
    requestUrl.searchParams.append('orderby', orderBy);
    requestUrl.searchParams.append('order', order);

    const response = await fetch(requestUrl.toString());
    if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
    }
    return await response.json();
}

async function fetchProductById(id) {
    const requestUrl = new URL(WC_CONFIG.endpoint, window.location.href);
    requestUrl.searchParams.append('id', id);

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

    // Render Skeleton Loading for Single Product
    renderSingleProductSkeleton(container);

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

    // Show section and skeletons immediately
    relatedSection.style.display = 'block';
    renderRelatedSkeleton(relatedContainer, 5);

    try {
        // Fetch products (fetch mostly random/latest)
        // We fetch slightly more to filter out the current one
        let products = await fetchProducts(6); 
        
        // Filter out current product
        products = products.filter(p => p.id != currentProductId).slice(0, 5); // Take max 5

        if (products.length > 0) {
            renderRelatedProducts(products, relatedContainer);
        } else {
            // No products found, hide the section
            relatedSection.style.display = 'none';
        }

    } catch (error) {
        console.warn('WooCommerce: Failed to fetch related products', error);
        // Error, hide the section
        relatedSection.style.display = 'none';
    }
}

function renderRelatedSkeleton(container, count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
        <div class="related-product-card" style="display: flex; flex-direction: column; height: 100%;">
            <div class="skeleton skeleton-image" style="height: 120px; margin-bottom: 10px; border-radius: 6px;"></div>
            <div class="skeleton skeleton-text" style="width: 90%; margin-bottom: 5px;"></div>
            <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 15px;"></div>
            <div class="skeleton skeleton-btn" style="width: 100%; height: 35px; margin-top: auto;"></div>
        </div>
        `;
    }
    container.innerHTML = html;
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

function renderSingleProductSkeleton(container) {
    container.innerHTML = `
        <div class="product-detail-wrapper">
            <div class="product-detail-image">
                <div class="skeleton skeleton-image" style="width: 100%; max-width: 350px; height: 350px; border-radius: 12px;"></div>
            </div>
            <div class="product-detail-info" style="width: 100%;">
                <div class="skeleton skeleton-text" style="height: 2.5rem; width: 70%; margin-bottom: 15px;"></div>
                <div class="skeleton skeleton-text" style="height: 1.2rem; width: 30%; margin-bottom: 25px;"></div>
                <div class="skeleton skeleton-text" style="height: 2.5rem; width: 40%; margin-bottom: 25px;"></div>
                
                <div class="skeleton skeleton-text" style="margin-bottom: 10px;"></div>
                <div class="skeleton skeleton-text" style="margin-bottom: 10px;"></div>
                <div class="skeleton skeleton-text" style="width: 90%; margin-bottom: 10px;"></div>
                <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 40px;"></div>
                
                <div style="display: flex; gap: 15px; margin-top: 30px;">
                    <div class="skeleton skeleton-btn" style="width: 150px; height: 50px;"></div>
                    <div class="skeleton skeleton-btn" style="width: 150px; height: 50px;"></div>
                </div>
            </div>
        </div>
    `;
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
                <div class="product-actions" style="margin-top: 30px; display: flex; gap: 15px;">
                     <button id="add-to-cart-main" class="btn primary">Add to Cart</button>
                     <a href="shop.html" class="btn ghost">Back to Shop</a>
                </div>
            </div>
        </div>
    `;

    // Add Cart Listener
    const addBtn = document.getElementById('add-to-cart-main');
    if (addBtn) {
        addBtn.onclick = () => {
            if (typeof window.addToCart === 'function') {
                window.addToCart(product);
            } else {
                console.error('Cart: addToCart function not found');
            }
        };
    }
}

/**
 * Renders skeleton loading cards
 * @param {HTMLElement} container - The element to append skeletons to
 * @param {number} count - Number of skeletons to show
 */
function renderSkeleton(container, count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
        <article class="card dark-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-body">
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-btn"></div>
            </div>
        </article>
        `;
    }
    container.innerHTML = html;
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
                <div class="meta" style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="price" style="font-weight: bold; color: var(--accent); font-size: 1.1rem;">${activePrice}</span>
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
                <div class="product-footer" style="display: flex; flex-direction: column; gap: 10px;">
                    <p class="product-price">${activePrice}<span></span></p>
                    <div style="display: flex; gap: 8px;">
                        <a href="product.html?id=${product.id}" class="btn primary small" style="flex: 1; text-align: center;">View Details</a>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}
