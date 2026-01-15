// Functions are defined here but initialized inside DOMContentLoaded or called by specific init functions

// Tire Finder Logic
function initTireFinderLogic() {
    const form = document.querySelector('.tire-finder');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const resultsContainer = document.getElementById('tire-finder-results');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:1rem; height:1rem; border:2px solid #fff; border-radius:50%; border-top-color:transparent; animation:spin 1s linear infinite; margin-right:5px;"></span> Searching...';
        submitBtn.disabled = true;
        // Add spin animation if not present
        if (!document.getElementById('spin-style')) {
            const style = document.createElement('style');
            style.id = 'spin-style';
            style.innerHTML = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('hidden');

        try {
            // Gathering criteria
            const width = document.getElementById('tire-width').value;
            const profile = document.getElementById('tire-profile').value;
            const wheel = document.getElementById('tire-wheel').value;
            
            // We need to fetch products. Since we are in main.js and fetching logic is in woocommerce.js
            // we will try to use the fetchProducts function if exposed, OR we can reimplement a simple one here.
            // For robustness, let's reimplement a simple fetch here that hits the same endpoint.
            
            // Configuration (mirrors global config) to use Remote Proxy
            const WC_CONFIG = {
                endpoint: 'https://www.globaltireservices.com/api-proxy.php'
            };

            const requestUrl = new URL(WC_CONFIG.endpoint, window.location.href);
            requestUrl.searchParams.append('per_page', 100); // More results for client-side filtering

            const response = await fetch(requestUrl.toString());
            let products = [];
            if (response.ok) {
                products = await response.json();
            } else {
                console.warn('TireFinder: API call failed, falling back to static/empty');
            }

            // Filter Logic
            const filteredProducts = products.filter(p => {
                const name = p.name.toLowerCase();
                const shortDesc = (p.short_description || '').toLowerCase();
                // Simple search text aggregation
                const text = name + ' ' + shortDesc;
                
                // Allow empty selection to match all (optional, but UI implies required)
                // We use basic string inclusion for matching parts like "245", "45", "18"
                // "R18" is common, so we check for that too.
                const widthMatch = !width || text.includes(width);
                const profileMatch = !profile || text.includes(profile) || text.includes('/' + profile);
                const wheelMatch = !wheel || text.includes('r' + wheel) || text.includes(wheel);

                return widthMatch && profileMatch && wheelMatch;
            });

            if (filteredProducts.length > 0) {
                let html = '<div class="finder-results-grid">';
                filteredProducts.forEach(p => {
                     const imageUrl = p.images && p.images.length > 0 ? p.images[0].src : 'images/placeholder-tire.png';
                     const priceHtml = p.price_html || `$${p.price}`;
                     
                     html += `
                        <div class="finder-result-card">
                            <img src="${imageUrl}" alt="${p.name}">
                            <h4>${p.name}</h4>
                            <span class="price">${priceHtml}</span>
                            <a href="product.html?id=${p.id}" class="btn small primary">View</a>
                        </div>
                     `;
                });
                html += '</div>';
                resultsContainer.innerHTML = html;
            } else {
                resultsContainer.innerHTML = `
                    <div class="finder-no-results">
                        <i class="bi bi-emoji-frown" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
                        <p>No tires found for <strong>${width || 'Any'}/${profile || 'Any'} R${wheel || 'Any'}</strong></p>
                        <p style="font-size: 0.9rem; margin-top: 5px; opacity: 0.7;">Try specific sizes found in our catalog like 245/40 R18</p>
                    </div>
                `;
            }

        } catch (error) {
            console.error(error);
            resultsContainer.innerHTML = '<p class="finder-no-results">An error occurred while searching.</p>';
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}


// Minimal JS for mobile menu and form validation
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Tire Finder Logic
    initTireFinderLogic();

  const btn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-navigation');

  // create overlay (class controlled by CSS)
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function setNavOpen(open) {
    if (!btn || !nav) return;
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('open', open);
    overlay.classList.toggle('active', open);
    document.body.classList.toggle('nav-open', open);
  }

  function isNavOpen() {
    return !!nav && nav.classList.contains('open');
  }

  if (btn && nav) {
    btn.addEventListener('click', function () {
      setNavOpen(!isNavOpen());
    });

    // close when clicking on links inside nav (useful on mobile)
    nav.addEventListener('click', function (e) {
      const target = e.target.closest('a');
      if (target && isNavOpen()) {
        setNavOpen(false);
      }
    });
  }

  // Tire finder modal (Home hero)
  const openTireFinderBtn = document.getElementById('open-tire-finder');
  const tireFinderModal = document.getElementById('tire-finder-modal');
  const tireFinderOverlay = document.getElementById('tire-finder-overlay');
  const tireFinderCloseBtn = tireFinderModal ? tireFinderModal.querySelector('.modal-close') : null;

  // Specials/Coupons modal (Home hero)
  const openSpecialsBtn = document.getElementById('open-specials');
  const specialsModal = document.getElementById('specials-modal');
  const specialsOverlay = document.getElementById('specials-overlay');
  const specialsCloseBtn = specialsModal ? specialsModal.querySelector('.modal-close') : null;

  let lastFocusedEl = null;
  let lastFocusedElSpecials = null;

  function setTireFinderOpen(open) {
    if (!tireFinderModal || !tireFinderOverlay) return;

    tireFinderModal.hidden = !open;
    tireFinderOverlay.hidden = !open;
    tireFinderModal.classList.toggle('open', open);
    tireFinderOverlay.classList.toggle('open', open);
    document.body.classList.toggle('modal-open', open);

    if (open) {
      if (isNavOpen()) setNavOpen(false);
      lastFocusedEl = document.activeElement;

      const first = tireFinderModal.querySelector(
        'select, button, a, input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (first) setTimeout(() => first.focus(), 0);
    } else if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
      lastFocusedEl = null;
    }
  }

  function isTireFinderOpen() {
    return !!tireFinderModal && tireFinderModal.classList.contains('open');
  }

  function setSpecialsOpen(open) {
    if (!specialsModal || !specialsOverlay) return;

    specialsModal.hidden = !open;
    specialsOverlay.hidden = !open;
    specialsModal.classList.toggle('open', open);
    specialsOverlay.classList.toggle('open', open);
    document.body.classList.toggle('modal-open', open);

    if (open) {
      if (isTireFinderOpen()) setTireFinderOpen(false);
      if (isNavOpen()) setNavOpen(false);
      lastFocusedElSpecials = document.activeElement;

      const first = specialsModal.querySelector(
        'button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (first) setTimeout(() => first.focus(), 0);
    } else if (lastFocusedElSpecials && typeof lastFocusedElSpecials.focus === 'function') {
      lastFocusedElSpecials.focus();
      lastFocusedElSpecials = null;
    }
  }

  function isSpecialsOpen() {
    return !!specialsModal && specialsModal.classList.contains('open');
  }

  if (openTireFinderBtn && tireFinderModal && tireFinderOverlay) {
    openTireFinderBtn.addEventListener('click', function () {
      setTireFinderOpen(true);
    });
  }

  if (tireFinderCloseBtn) {
    tireFinderCloseBtn.addEventListener('click', function () {
      setTireFinderOpen(false);
    });
  }

  if (tireFinderOverlay) {
    tireFinderOverlay.addEventListener('click', function () {
      setTireFinderOpen(false);
    });
  }

  if (openSpecialsBtn && specialsModal && specialsOverlay) {
    openSpecialsBtn.addEventListener('click', function () {
      setSpecialsOpen(true);
    });
  }

  if (specialsCloseBtn) {
    specialsCloseBtn.addEventListener('click', function () {
      setSpecialsOpen(false);
    });
  }

  if (specialsOverlay) {
    specialsOverlay.addEventListener('click', function () {
      setSpecialsOpen(false);
    });
  }

  // Tire finder: More/Less options uses native <details>/<summary> in HTML.

  // close with ESC
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;

    if (isSpecialsOpen()) {
      setSpecialsOpen(false);
      return;
    }

    if (isTireFinderOpen()) {
      setTireFinderOpen(false);
      return;
    }

    if (isNavOpen()) setNavOpen(false);
  });

  // close on click outside (overlay)
  overlay.addEventListener('click', function () {
    if (isNavOpen()) {
      setNavOpen(false);
    }
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Contact form validation
  const form = document.querySelector('.footer-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous error messages
      const errorMessages = form.querySelectorAll('.error-message');
      errorMessages.forEach(msg => msg.remove());

      let isValid = true;

      // Validate first name
      const firstName = form.querySelector('#footer-first');
      if (firstName && firstName.value.trim() === '') {
        showError(firstName, 'First name is required');
        isValid = false;
      }

      // Validate last name
      const lastName = form.querySelector('#footer-last');
      if (lastName && lastName.value.trim() === '') {
        showError(lastName, 'Last name is required');
        isValid = false;
      }

      // Validate email
      const email = form.querySelector('#footer-email');
      if (email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() === '') {
          showError(email, 'Email is required');
          isValid = false;
        } else if (!emailPattern.test(email.value)) {
          showError(email, 'Enter a valid email');
          isValid = false;
        }
      }

      // Validate phone (optional but if has value, validate format)
      const phone = form.querySelector('#footer-phone');
      if (phone && phone.value.trim() !== '') {
        const phonePattern = /^[\d\s\-\+\(\)]{8,}$/;
        if (!phonePattern.test(phone.value)) {
          showError(phone, 'Enter a valid phone number');
          isValid = false;
        }
      }

      // Validate message
      const message = form.querySelector('#footer-message');
      if (message && message.value.trim() === '') {
        showError(message, 'Message is required');
        isValid = false;
      }

      if (isValid) {
        // Simulate successful submission
        showSuccess(form);
        form.reset();
      }
    });
  }

  function showError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ff6b6b';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
    input.style.borderColor = '#ff6b6b';

    // Remove error on typing
    input.addEventListener('input', function () {
      input.style.borderColor = '';
      const error = input.parentElement.querySelector('.error-message');
      if (error) error.remove();
    }, { once: true });
  }

  function showSuccess(form) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    successDiv.style.color = '#fff';
    successDiv.style.padding = '12px 16px';
    successDiv.style.borderRadius = '8px';
    successDiv.style.marginTop = '12px';
    successDiv.style.fontWeight = '600';
    successDiv.textContent = 'Message sent successfully! We\'ll contact you soon.';

    form.appendChild(successDiv);

    setTimeout(() => {
      successDiv.style.transition = 'opacity 0.3s ease';
      successDiv.style.opacity = '0';
      setTimeout(() => successDiv.remove(), 300);
    }, 4000);
  }
});

// Auth Tabs Logic
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.auth-tab');
    if (tabs.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form-container').forEach(c => c.classList.remove('active'));

            // Activate clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) target.classList.add('active');
        });
    });
});

// Cart Badge Logic
function updateCartCount() {
    const cartIcon = document.querySelector('a[aria-label="Cart"]');
    if (!cartIcon) return;

    // Get count
    let count = 0;
    try {
        const cartStr = localStorage.getItem('gt_cart');
        if (cartStr) {
            const cart = JSON.parse(cartStr);
            if (Array.isArray(cart)) {
                count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
            }
        }
    } catch (e) {
        console.error('Error parsing cart', e);
    }

    // Remove existing badge if any
    let badge = cartIcon.querySelector('.cart-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.style.cssText = 'position: absolute; top: -8px; right: -8px; background: var(--accent, #DA291C); color: #fff; font-size: 0.7rem; font-weight: bold; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; padding: 2px; line-height: 1; border: 1px solid #fff;';
        
        cartIcon.style.position = 'relative';
        cartIcon.appendChild(badge);
    }
    
    badge.innerText = count;
    badge.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', updateCartCount);
