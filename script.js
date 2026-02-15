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

// Sticky Navbar Effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('bg-brand-dark/95', 'shadow-lg');
        navbar.classList.remove('bg-brand-dark/80', 'py-4');
        navbar.classList.add('py-2');
    } else {
        navbar.classList.remove('bg-brand-dark/95', 'shadow-lg');
        navbar.classList.add('bg-brand-dark/80', 'py-4');
        navbar.classList.remove('py-2');
    }
});

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
                    if(c < target) {
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
