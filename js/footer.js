/**
 * Footer-only behaviors:
 * - Inject footer.html into #contacto
 * - Initialize footer year
 * - Footer form validation
 */

async function loadDynamicFooter() {
	const footerContainer = document.getElementById('contacto');
	if (!footerContainer) return;

	try {
		// Add timestamp to avoid caching issues during development
		const response = await fetch('footer.html?v=' + Date.now());
		if (!response.ok) throw new Error('Failed to load footer');
		const footerHtml = await response.text();
		footerContainer.innerHTML = footerHtml;

		initFooterYear(footerContainer);
		initFooterFormValidation(footerContainer);
	} catch (error) {
		console.error('Error loading footer:', error);
	}
}

function initFooterYear(root = document) {
	const yearEl = root.querySelector('#year');
	if (!yearEl) return;
	yearEl.textContent = new Date().getFullYear();
}

function initFooterFormValidation(root = document) {
	const form = root.querySelector('.footer-form');
	if (!form) return;

	// Avoid double-binding if footer gets reloaded
	if (form.dataset.footerBound === 'true') return;
	form.dataset.footerBound = 'true';

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
			submitToCF7(form);
		}
	});

	async function submitToCF7(form) {
		const btn = form.querySelector('button[type="submit"]');
		const originalText = btn.innerText;

		// Simple sanitization to remove any HTML tags
		const sanitize = (str) => str.replace(/<[^>]*>?/gm, '').trim();
		
		// Setup mapping for Contact Form 7 fields
		// Replace '123' with your actual Contact Form 7 ID from WordPress
		const CF7_FORM_ID = '5229'; 
		const CF7_URL = `https://www.globaltireservices.com/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`;

		const formData = new FormData();
		formData.append('_wpcf7', CF7_FORM_ID);
		formData.append('_wpcf7_unit_tag', `wpcf7-f${CF7_FORM_ID}-o1`);
		formData.append('_wpcf7_container_post', '0');
		formData.append('_wpcf7_locale', 'en_US');

		formData.append('your-first-name', sanitize(form.querySelector('#footer-first').value));
		formData.append('your-last-name', sanitize(form.querySelector('#footer-last').value));
		formData.append('your-phone', sanitize(form.querySelector('#footer-phone').value));
		formData.append('your-email', sanitize(form.querySelector('#footer-email').value));
		formData.append('your-message', sanitize(form.querySelector('#footer-message').value));

		try {
			btn.disabled = true;
			btn.innerText = 'Sending...';

			const response = await fetch(CF7_URL, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			console.log('CF7 Footer Response:', result);

			if (result.status === 'mail_sent') {
				showSuccess(form);
				form.reset();
			} else {
				if (result.invalid_fields) {
					result.invalid_fields.forEach(field => {
						console.error(`Field error (${field.into}): ${field.message}`);
					});
				}
				throw new Error(result.message || 'Validation error');
			}
		} catch (error) {
			console.error('CF7 Error:', error);
			const errorDiv = document.createElement('div');
			errorDiv.className = 'error-message';
			errorDiv.style.color = '#ff4d4d';
			errorDiv.style.marginTop = '10px';
			errorDiv.innerText = 'Failed to send. Please try again or call us directly.';
			form.appendChild(errorDiv);
		} finally {
			btn.disabled = false;
			btn.innerText = originalText;
		}
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
		input.addEventListener(
			'input',
			function () {
				input.style.borderColor = '';
				const error = input.parentElement.querySelector('.error-message');
				if (error) error.remove();
			},
			{ once: true }
		);
	}

	function showSuccess(formEl) {
		const successDiv = document.createElement('div');
		successDiv.className = 'success-message';
		successDiv.style.background = 'linear-gradient(90deg, #10b981, #059669)';
		successDiv.style.color = '#fff';
		successDiv.style.padding = '12px 16px';
		successDiv.style.borderRadius = '8px';
		successDiv.style.marginTop = '12px';
		successDiv.style.fontWeight = '600';
		successDiv.textContent = "Message sent successfully! We'll contact you soon.";

		formEl.appendChild(successDiv);

		setTimeout(() => {
			successDiv.style.transition = 'opacity 0.3s ease';
			successDiv.style.opacity = '0';
			setTimeout(() => successDiv.remove(), 300);
		}, 4000);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	loadDynamicFooter();
});
