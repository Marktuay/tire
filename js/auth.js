/**
 * Authentication Logic for GlobalTire
 * Connects to auth-proxy.php
 */

const AUTH_CONFIG = {
    // Use local proxy when developing on localhost (avoids browser CORS issues).
    // In production (globaltireservices.com) it can hit the live proxy directly.
    endpoint: (() => {
        const host = window.location.hostname;
        const port = window.location.port;
        const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
        
        // If running on Live Server (port 5500) or similar, we use the remote proxy
        // because Live Server does not execute PHP scripts (auth-proxy.php).
        if (isLocal && (port === '5500' || port === '5501' || port === '3000')) {
            return 'https://www.globaltireservices.com/auth-proxy.php';
        }
        
        return isLocal ? './auth-proxy.php' : 'https://www.globaltireservices.com/auth-proxy.php';
    })()
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initAuthForms();
        checkLoginState();
    });
} else {
    initAuthForms();
    checkLoginState();
}

function initAuthForms() {
    // LOGIN FORM
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            
            // UI Loading State
            setLoading(btn, true, 'Logging In...');
            clearMessages(loginForm);

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${AUTH_CONFIG.endpoint}?action=login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    // Save User Session
                    localStorage.setItem('gt_user', JSON.stringify(result.user));
                    localStorage.setItem('gt_login_time', Date.now());
                    
                    showMessage(loginForm, 'success', 'Login successful! Redirecting...');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showMessage(loginForm, 'error', result.message || 'Login failed.');
                    setLoading(btn, false, originalText);
                }
            } catch (error) {
                console.error('Login Error:', error);
                showMessage(loginForm, 'error', 'Connection failed. Please try again.');
                setLoading(btn, false, originalText);
            }
        });
    }

    // REGISTER FORM
    const registerForm = document.getElementById('form-register');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            setLoading(btn, true, 'Creating Account...');
            clearMessages(registerForm);

            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${AUTH_CONFIG.endpoint}?action=register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    showMessage(registerForm, 'success', result.message);
                    // Reset form
                    registerForm.reset();
                    // Optionally switch to login tab
                    setTimeout(() => {
                        document.querySelector('.auth-tab[data-target="login-form"]').click();
                    }, 2000);
                } else {
                    showMessage(registerForm, 'error', result.message || 'Registration failed.');
                }
            } catch (error) {
                console.error('Register Error:', error);
                showMessage(registerForm, 'error', 'Connection failed. Please try again.');
            } finally {
                setLoading(btn, false, originalText);
            }
        });
    }
    
    // LOGOUT LOGIC (Global)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Check if user is logged in (Simple valid session check)
function checkLoginState() {
    const userStr = localStorage.getItem('gt_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        updateUIForLoggedInUser(user);
    }
}

function updateUIForLoggedInUser(user) {
    // Find Account Icon and update it
    const accountIcon = document.querySelector('a[aria-label="Account"]');
    if (accountIcon) {
        // Use first name, or display name, or fallback to 'My Account'
        const nameToDisplay = user.first_name || user.display_name || 'My Account';
        
        let contentHtml = '';
        if (user.avatar_url) {
             contentHtml = `
                <img src="${user.avatar_url}" alt="Avatar" style="width: 28px; height: 28px; border-radius: 50%; margin-right: 8px; object-fit: cover; border: 1px solid #ddd;">
                <span style="font-size:0.85rem; font-weight:600;">${nameToDisplay}</span>
             `;
        } else {
             contentHtml = `<span style="font-size:0.85rem; font-weight:600;">${nameToDisplay}</span>`;
        }
        
        // Update styling to match header text style better
        accountIcon.innerHTML = contentHtml;
        accountIcon.style.display = 'flex';
        accountIcon.style.alignItems = 'center';
        accountIcon.style.textDecoration = 'none';
        
        // Redirect to Dashboard
        accountIcon.href = 'dashboard.html';

        // Add Logout Button (Sign Out) next to username
        if (!document.getElementById('header-logout-btn')) {
            const logoutLink = document.createElement('a');
            logoutLink.id = 'header-logout-btn';
            logoutLink.href = '#';
            logoutLink.className = 'icon-btn';
            logoutLink.setAttribute('aria-label', 'Sign Out');
            logoutLink.title = 'Sign Out';
            logoutLink.style.marginLeft = '10px';
            logoutLink.innerHTML = '<i class="bi bi-box-arrow-right" style="font-size: 1.2rem;"></i>';
            
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });

            // Insert after the account icon
            accountIcon.parentNode.insertBefore(logoutLink, accountIcon.nextSibling);
        }
    }
}

function logout() {
    localStorage.removeItem('gt_user');
    localStorage.removeItem('gt_login_time');
    window.location.href = 'login.html';
}

// Helpers
function setLoading(btn, isLoading, text) {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="display:inline-block; width:1rem; height:1rem; border:2px solid #fff; border-radius:50%; border-top-color:transparent; animation:spin 1s linear infinite; margin-right:5px;"></span> ${text}`;
    } else {
        btn.disabled = false;
        btn.innerHTML = text;
    }
}

function showMessage(form, type, text) {
    let msgDiv = form.querySelector('.auth-message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.className = 'auth-message';
        msgDiv.style.marginTop = '15px';
        msgDiv.style.padding = '10px';
        msgDiv.style.borderRadius = '6px';
        msgDiv.style.fontSize = '0.9rem';
        form.appendChild(msgDiv);
    }
    
    msgDiv.style.display = 'block';
    msgDiv.textContent = text;
    
    if (type === 'success') {
        msgDiv.style.background = 'rgba(76, 175, 80, 0.1)';
        msgDiv.style.border = '1px solid #4CAF50';
        msgDiv.style.color = '#4CAF50';
    } else {
        msgDiv.style.background = 'rgba(244, 67, 54, 0.1)';
        msgDiv.style.border = '1px solid #F44336';
        msgDiv.style.color = '#F44336';
    }
}

function clearMessages(form) {
    const msgDiv = form.querySelector('.auth-message');
    if (msgDiv) msgDiv.style.display = 'none';
}
