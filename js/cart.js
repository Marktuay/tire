/**
 * Shopping Cart Management System
 * Handles localStorage-based cart operations
 */

const CART_CONFIG = {
    storageKey: 'globaltire_cart',
};

// Cart State - Use a more unique name to avoid conflicts if needed
let cart = [];

/**
 * Initialize cart from localStorage
 */
function initCart() {
    const savedCart = localStorage.getItem(CART_CONFIG.storageKey);
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error("Cart: Error parsing saved cart", e);
            cart = [];
        }
    }
    updateCartUI();
}

/**
 * Add a product to the cart
 * @param {Object} product - The product object from WooCommerce
 * @param {number} quantity - Number of items to add
 */
function addToCart(product, quantity = 1) {
    console.log("Cart: Adding product", product);
    if (!product || (!product.id && !product.ID)) {
        console.error("Cart: Invalid product object", product);
        return;
    }

    const productId = product.id || product.ID;
    const existingItem = cart.find(item => item.id == productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        // Extract simple data from WooCommerce product object
        // Handle price strings that might include currency symbols
        let cleanPrice = 0;
        if (product.price) {
            cleanPrice = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
        }

        const item = {
            id: productId,
            name: product.name || 'Product',
            price: cleanPrice,
            image: (product.images && product.images.length > 0) ? product.images[0].src : 'images/placeholder-tire.png',
            quantity: quantity,
            permalink: product.permalink || '#'
        };
        cart.push(item);
    }

    saveCart();
    updateCartUI();
    
    // Show feedback
    showCartNotification(`${product.name || 'Product'} added to cart!`);
}

// Make globally available explicitly
window.addToCart = addToCart;
window.initCart = initCart;

/**
 * Remove an item from the cart
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    saveCart();
    updateCartUI();
    
    if (window.location.pathname.includes('cart.html') && typeof renderCartPage === 'function') {
        renderCartPage();
    }
}
window.removeFromCart = removeFromCart;

/**
 * Update quantity of an item
 */
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id == productId);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        saveCart();
        updateCartUI();
        
        if (window.location.pathname.includes('cart.html') && typeof renderCartPage === 'function') {
            renderCartPage();
        }
    }
}
window.updateQuantity = updateQuantity;

/**
 * Clear the cart
 */
function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}
window.clearCart = clearCart;

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(cart));
}

/**
 * Update global UI elements (like cart counter)
 */
function updateCartUI() {
    // Ensure cart is an array
    if (!Array.isArray(cart)) cart = [];

    // Recalculate total items
    const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    
    // Find all counter elements (in header, mobile menu, etc.)
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    console.log(`Cart: Updating UI with ${totalItems} items. Found ${cartCountElements.length} elements.`);

    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        // Force visibility update
        if (totalItems > 0) {
            el.style.setProperty('display', 'flex', 'important');
            el.style.opacity = '1';
            el.style.visibility = 'visible';
        } else {
            console.log("Cart: Hiding counter because totalItems is 0");
            el.style.setProperty('display', 'none', 'important');
        }
    });

    // Handle cart page specifics if we are on it
    if (window.location.pathname.includes('cart.html') && typeof renderCartPage === 'function') {
        renderCartPage();
    }
}
window.updateCartUI = updateCartUI;

/**
 * Show a simple notification
 * @param {string} message 
 */
function showCartNotification(message) {
    // Check if notification element exists, else create it
    let notify = document.getElementById('cart-notification');
    if (!notify) {
        notify = document.createElement('div');
        notify.id = 'cart-notification';
        notify.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent);
            color: #000;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            font-weight: 600;
            transform: translateY(100px);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notify);
    }

    notify.textContent = message;
    notify.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        notify.style.transform = 'translateY(150px)';
    }, 3000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}

window.addEventListener('pageshow', (event) => {
    initCart();
});
