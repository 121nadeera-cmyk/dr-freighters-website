// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function toggleMenu() {
    mobileMenu.classList.toggle('translate-x-full');
}

mobileMenuBtn.addEventListener('click', toggleMenu);
closeMenuBtn.addEventListener('click', toggleMenu);

mobileLinks.forEach(link => {
    link.addEventListener('click', toggleMenu);
});

// Sticky Navbar Effect (Removed as nav is already sticky without custom IDs)

// Number Counter Animation
const counters = document.querySelectorAll('.counter');
let hasInitedCounter = false;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasInitedCounter) {
            hasInitedCounter = true;
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const increment = target / 50;

                const updateCounter = () => {
                    const c = +counter.innerText.replace('+', '').replace('k', '000');
                    if (c < target) {
                        counter.innerText = `${Math.ceil(c + increment)}`;
                        setTimeout(updateCounter, 20);
                    } else {
                        // Restore k or + formatting if needed - keeping it simple for now
                        counter.innerText = counter.getAttribute('data-target') + '+';
                        if (counter.getAttribute('data-target').includes('k')) { // specialized handling if I added k logic
                            // logic here if needed
                        }
                    }
                };
                updateCounter();
            });
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('section.py-12'); // Select stats section
if (statsSection) {
    observer.observe(statsSection);
}

// Update the current year in footer
const currentYearElement = document.getElementById('current-year');
if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

const RATE_LIMIT_KEY = 'drf_contact_submissions';
const MAX_SUBMISSIONS = 3;
const TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit() {
    let now = Date.now();
    let submissions = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY)) || [];

    // Clean up old submissions outside the 1-hour window
    submissions = submissions.filter(time => now - time < TIME_WINDOW_MS);

    if (submissions.length >= MAX_SUBMISSIONS) {
        return false;
    }

    submissions.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(submissions));
    return true;
}

// Telegram Form Submission
function handleTelegramFormSubmit(event, formElement, isQuote) {
    event.preventDefault();

    const formData = new FormData(formElement);

    // Cloudflare Turnstile Validation (Client-side presence check)
    const turnstileResponse = formData.get('cf-turnstile-response');
    if (turnstileResponse !== null && !turnstileResponse) {
        alert('Please complete the security verification before submitting.');
        return;
    }

    // Rate Limit Validation
    if (!checkRateLimit()) {
        alert('You have reached the limit of 3 messages per hour. Please try again later.');
        return;
    }
    const name = formData.get('name') || 'N/A';
    const email = formData.get('email') || 'N/A';
    const phone = formData.get('phone') || 'N/A';
    const message = formData.get('message') || 'N/A';

    let text = `🚢 New Dr. Freighters Lead\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n`;
    if (isQuote) {
        text += `Service: ${formData.get('service')}\n`;
    } else {
        text += `Subject: ${formData.get('subject')}\n`;
    }
    text += `Message: ${message}`;

    const payload = {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: text
    };

    const btn = formElement.querySelector('button[type="submit"]');
    const originalBtnText = btn.innerText;
    btn.innerText = 'Sending...';
    btn.disabled = true;

    fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (response.ok) {
                formElement.innerHTML = `<div class="text-center p-8 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold">Thank You! Your message has been sent successfully.</div>`;
            } else {
                alert('Something went wrong. Please check your Chat ID configuration and try again.');
                btn.innerText = originalBtnText;
                btn.disabled = false;
            }
        })
        .catch(error => {
            alert('Error sending message. Please check your connection and try again.');
            btn.innerText = originalBtnText;
            btn.disabled = false;
        });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => handleTelegramFormSubmit(e, contactForm, false));
}

const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => handleTelegramFormSubmit(e, quoteForm, true));
}
