/**
 * Contact Page Logic:
 * - Form validation
 * - Submission to Contact Form 7
 */

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('.contact-page-form');
    if (contactForm) {
        initContactForm(contactForm);
    }
});

function initContactForm(form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear previous messages
        const existingMessages = form.querySelectorAll('.error-message, .success-message');
        existingMessages.forEach(m => m.remove());

        let isValid = true;
        const data = {};

        // Helper to show error
        const showError = (inputSelector, message) => {
            const input = form.querySelector(inputSelector);
            if (input) {
                const err = document.createElement('div');
                err.className = 'error-message';
                err.style.color = '#ff4d4d';
                err.style.fontSize = '0.85rem';
                err.style.marginTop = '5px';
                err.innerText = message;
                input.parentNode.appendChild(err);
                isValid = false;
            }
        };

        // Basic Validation
        const firstName = form.querySelector('#contact-first').value.trim();
        const lastName = form.querySelector('#contact-last').value.trim();
        const email = form.querySelector('#contact-email').value.trim();
        const phone = form.querySelector('#contact-phone').value.trim();
        const subject = form.querySelector('#contact-subject').value;
        const message = form.querySelector('#contact-message').value.trim();

        if (!firstName) showError('#contact-first', 'First name is required');
        if (!lastName) showError('#contact-last', 'Last name is required');
        if (!email) {
            showError('#contact-email', 'Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('#contact-email', 'Enter a valid email');
        }
        if (!subject) showError('#contact-subject', 'Please select a subject');
        if (!message) showError('#contact-message', 'Message is required');

        if (isValid) {
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            // Simple sanitization to remove any HTML tags
            const sanitize = (str) => str.replace(/<[^>]*>?/gm, '').trim();

            const CF7_FORM_ID = '5230'; // Replace with actual Contact Form 7 ID for this page
            const CF7_URL = `https://www.globaltireservices.com/wp-json/contact-form-7/v1/contact-forms/${CF7_FORM_ID}/feedback`;

            const formData = new FormData();
            formData.append('_wpcf7', CF7_FORM_ID);
            formData.append('_wpcf7_unit_tag', `wpcf7-f${CF7_FORM_ID}-o1`);
            formData.append('_wpcf7_container_post', '0');
            formData.append('_wpcf7_locale', 'en_US');
            
            formData.append('your-first-name', sanitize(firstName));
            formData.append('your-last-name', sanitize(lastName));
            formData.append('your-email', sanitize(email));
            formData.append('your-phone', sanitize(phone));
            
            // Send the actual text of the selected option
            const subjectEl = form.querySelector('#contact-subject');
            const subjectText = subjectEl.options[subjectEl.selectedIndex].text;
            formData.append('your-subject', sanitize(subjectText));
            
            formData.append('your-message', sanitize(message));

            try {
                btn.disabled = true;
                btn.innerText = 'Sending...';

                const response = await fetch(CF7_URL, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log('CF7 Full Response:', result);

                if (result.status === 'mail_sent') {
                    const success = document.createElement('div');
                    success.className = 'success-message';
                    success.style.background = '#d4edda';
                    success.style.color = '#155724';
                    success.style.padding = '15px';
                    success.style.borderRadius = '8px';
                    success.style.marginTop = '20px';
                    success.innerText = 'Thank you! Your message has been sent successfully.';
                    form.appendChild(success);
                    form.reset();
                } else {
                    // Log specific validation errors if they exist
                    if (result.invalid_fields) {
                        result.invalid_fields.forEach(field => {
                            console.error(`Validation error in ${field.into}: ${field.message}`);
                        });
                    }
                    throw new Error(result.message || 'One or more fields have an error.');
                }
            } catch (error) {
                console.error('Contact Form Error:', error);
                const errGlobal = document.createElement('div');
                errGlobal.className = 'error-message';
                errGlobal.style.color = '#ff4d4d';
                errGlobal.style.marginTop = '20px';
                errGlobal.innerText = 'Failed to send. Please try again later.';
                form.appendChild(errGlobal);
            } finally {
                btn.disabled = false;
                btn.innerText = originalText;
            }
        }
    });
}
