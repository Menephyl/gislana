// Counter Animation para números
const countElements = document.querySelectorAll('[data-count]');

const countUp = (element) => {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCount = () => {
        current += step;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = target;
        }
    };

    updateCount();
};

// Intersection Observer para triggar animação
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            countUp(entry.target);
            entry.target.classList.add('counted');
        }
    });
}, { threshold: 0.5 });

countElements.forEach(el => observer.observe(el));

// Progress bars animation
const progressFills = document.querySelectorAll('.progress-fill');

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
        }
    });
}, { threshold: 0.5 });

progressFills.forEach(fill => progressObserver.observe(fill));