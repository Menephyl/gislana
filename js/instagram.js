// ==================== CAROUSEL SIMPLES ====================
class SimpleCarousel {
    constructor() {
        this.carousel = document.getElementById('carousel');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.indicators = document.getElementById('indicators');

        if (!this.carousel) {
            console.warn('⚠️ Carousel não encontrado');
            return;
        }

        this.currentIndex = 0;
        this.itemsVisible = this.getItemsVisible();
        this.slides = document.querySelectorAll('.carousel-slide');
        this.totalSlides = Math.ceil(this.slides.length / this.itemsVisible);

        console.log(`Total de slides: ${this.slides.length}, Visíveis por vez: ${this.itemsVisible}, Total de páginas: ${this.totalSlides}`);

        this.init();
    }

    init() {
        console.log('✓ Carousel inicializado');
        this.renderIndicators();
        this.attachEventListeners();
        this.autoPlay();
    }

    getItemsVisible() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    renderIndicators() {
        if (!this.indicators) return;

        this.indicators.innerHTML = Array.from({ length: this.totalSlides }, (_, i) => `
      <div class="indicator ${i === 0 ? 'active' : ''}" data-slide="${i}"></div>
    `).join('');

        document.querySelectorAll('.indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.currentIndex = slideIndex * this.itemsVisible;
                this.updateCarousel();
            });
        });
    }

    attachEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        window.addEventListener('resize', () => {
            const newItemsVisible = this.getItemsVisible();
            if (newItemsVisible !== this.itemsVisible) {
                this.itemsVisible = newItemsVisible;
                this.currentIndex = 0;
                this.totalSlides = Math.ceil(this.slides.length / this.itemsVisible);
                this.renderIndicators();
                this.updateCarousel();
            }
        });
    }

    prev() {
        this.currentIndex = Math.max(0, this.currentIndex - this.itemsVisible);
        this.updateCarousel();
    }

    next() {
        const maxIndex = this.slides.length - this.itemsVisible;
        this.currentIndex = Math.min(maxIndex, this.currentIndex + this.itemsVisible);
        this.updateCarousel();
    }

    updateCarousel() {
        if (!this.carousel) return;

        const slideWidth = 100 / this.itemsVisible;
        const translateX = -(this.currentIndex * slideWidth);
        this.carousel.style.transform = `translateX(${translateX}%)`;

        // Atualiza indicadores
        const currentSlide = Math.floor(this.currentIndex / this.itemsVisible);
        document.querySelectorAll('.indicator').forEach((ind, i) => {
            ind.classList.toggle('active', i === currentSlide);
        });

        console.log(`Slide atual: ${currentSlide + 1}/${this.totalSlides}`);
    }

    autoPlay() {
        // Auto-play a cada 6 segundos
        setInterval(() => {
            const maxIndex = this.slides.length - this.itemsVisible;

            if (this.currentIndex >= maxIndex) {
                // Volta para o início
                this.currentIndex = 0;
            } else {
                // Próxima página
                this.currentIndex += this.itemsVisible;
            }

            this.updateCarousel();
        }, 6000);
    }
}

// ==================== INICIALIZA CAROUSEL ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📸 Inicializando Carousel...');
    new SimpleCarousel();
});