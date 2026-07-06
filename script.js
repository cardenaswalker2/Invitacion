document.addEventListener('DOMContentLoaded', () => {
    // 1. FLOATING DECORATIONS
    const decorContainer = document.getElementById('decorations-container');
    const emojis = ['🍓', '🌸', '🍃', '💖', '✨', '☁️', '🎈'];
    
    function createFloatingParticle() {
        if (!decorContainer) return;
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = Math.random() * 100 + 'vw';
        
        // Randomize speed, delay, size
        const duration = 5 + Math.random() * 8; // 5s to 13s
        const delay = Math.random() * 5;
        const fontSize = 1 + Math.random() * 1.5; // 1rem to 2.5rem
        
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.fontSize = `${fontSize}rem`;
        
        decorContainer.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            particle.remove();
        }, (duration + delay) * 1000);
    }
    
    // Spawn initial particles and set interval
    for (let i = 0; i < 15; i++) {
        createFloatingParticle();
    }
    setInterval(createFloatingParticle, 2000);

    // 2. ENVELOPE INTERACTION & CONFETTI
    const envelope = document.getElementById('envelope');
    const envelopeContainer = document.getElementById('envelope-container');
    const cardContainer = document.getElementById('card-container');
    
    if (envelope) {
        envelope.addEventListener('click', () => {
            if (!envelope.classList.contains('open')) {
                envelope.classList.add('open');
                
                // Trigger confetti
                setTimeout(() => {
                    startConfetti();
                }, 600);
                
                // Fade out envelope and reveal card
                setTimeout(() => {
                    if (envelopeContainer) envelopeContainer.classList.add('collapsed');
                    if (cardContainer) {
                        cardContainer.classList.remove('hidden');
                        setTimeout(() => {
                            cardContainer.classList.add('reveal');
                            handleScrollReveal();
                        }, 100);
                    }
                }, 1500);
            }
        });
    }

    // 3. CONFETTI CANVAS EFFECT
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let confettiActive = false;
    let particles = [];
    const colors = ['#FF3B5C', '#FFB7C5', '#FFF0F2', '#4CAF50', '#D4AF37', '#FFE082'];

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class ConfettiParticle {
        constructor() {
            this.x = Math.random() * (canvas ? canvas.width : 500);
            this.y = -20;
            this.size = 6 + Math.random() * 8;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speedX = -2 + Math.random() * 4;
            this.speedY = 3 + Math.random() * 5;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = -5 + Math.random() * 10;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
        }

        draw() {
            if (!ctx) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            if (Math.random() > 0.5) {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function startConfetti() {
        confettiActive = true;
        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                if (confettiActive) particles.push(new ConfettiParticle());
            }, i * 15);
        }
        animateConfetti();
        // Stop spawning after 6 seconds
        setTimeout(() => {
            confettiActive = false;
        }, 6000);
    }

    function animateConfetti() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, idx) => {
            p.update();
            p.draw();
            
            // Remove off-screen particles
            if (p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
                if (confettiActive) {
                    particles[idx] = new ConfettiParticle();
                } else {
                    particles.splice(idx, 1);
                }
            }
        });

        if (particles.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // 4. MUSIC CONTROLLER (rosita.mp3)
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    let isPlaying = false;

    function playMusic() {
        if (bgMusic) {
            bgMusic.play().then(() => {
                isPlaying = true;
                if (musicBtn) {
                    musicBtn.classList.add('playing');
                    musicBtn.querySelector('i').className = 'fas fa-volume-up';
                }
            }).catch(e => {
                console.log("Autoplay was prevented by the browser. Waiting for interaction.", e);
            });
        }
    }

    function pauseMusic() {
        if (bgMusic) {
            bgMusic.pause();
            isPlaying = false;
            if (musicBtn) {
                musicBtn.classList.remove('playing');
                musicBtn.querySelector('i').className = 'fas fa-volume-mute';
            }
        }
    }

    // Automatically trigger music play when envelope is clicked (user interaction)
    if (envelope) {
        envelope.addEventListener('click', () => {
            setTimeout(playMusic, 300);
        });
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                pauseMusic();
            } else {
                playMusic();
            }
        });
    }

    // 5. 3D TILT EFFECT
    const tiltCard = document.getElementById('tilt-card');
    
    function handleTilt(e) {
        if (!tiltCard) return;
        const cardRect = tiltCard.getBoundingClientRect();
        
        // Mouse coordinate relative to card
        const x = e.clientX - cardRect.left;
        const y = e.clientY - cardRect.top;
        
        // Normalize coordinates to -1 to 1
        const midX = cardRect.width / 2;
        const midY = cardRect.height / 2;
        const rotateX = ((y - midY) / midY) * -8; // Max 8 degrees tilt
        const rotateY = ((x - midX) / midX) * 8;
        
        tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function resetTilt() {
        if (!tiltCard) return;
        tiltCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }

    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            if (cardContainer && !cardContainer.classList.contains('hidden')) {
                handleTilt(e);
            }
        });
        
        document.addEventListener('mouseleave', resetTilt);
    }

    // 6. COUNTDOWN TIMER
    const targetDate = new Date('2026-07-26T17:00:00').getTime();
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            const cd = document.getElementById('countdown');
            if (cd) cd.innerHTML = "<div class='age-badge'>¡Es hoy! 🍓✨</div>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 7. INTERACTIVE GALLERY SLIDER
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let currentSlide = 0;

    function showSlide(index) {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

    // 8. SCROLL REVEAL ANIMATIONS
    const animElements = document.querySelectorAll('.animate-on-scroll');

    function handleScrollReveal() {
        animElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top <= windowHeight * 0.85) {
                el.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', handleScrollReveal);

    // 9. ADD TO CALENDAR EVENT
    const calendarBtn = document.getElementById('add-to-calendar-btn');
    
    if (calendarBtn) {
        calendarBtn.addEventListener('click', () => {
            const title = "Cumpleaños de Janelle Sarah 🍓";
            const description = "Fiesta de cumpleaños de Janelle Sarah Martínez Solano. Temática: Rosita Fresita. ¡No faltes!";
            const location = "Mi Residencia, Mi Casa";
            const startDate = "20260726T170000";
            const endDate = "20260726T210000"; // 4 hours party

            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
            window.open(googleCalendarUrl, '_blank');
        });
    }

    // 10. WHATSAPP RSVP HANDLER WITH CUSTOM GUEST NAME
    const rsvpBtn = document.getElementById('rsvp-btn');
    const guestNameInput = document.getElementById('guest-name-input');
    
    if (rsvpBtn) {
        rsvpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const guestName = guestNameInput ? guestNameInput.value.trim() : '';
            
            if (!guestName) {
                alert("Por favor, escribe tu nombre completo para confirmar tu asistencia 💕");
                if (guestNameInput) guestNameInput.focus();
                return;
            }
            
            const phoneNumber = "573006663273"; // Colombia (57) prefix + 3006663273
            const message = `¡Hola! Confirmo con mucha alegría mi asistencia al cumpleaños de Janelle Sarah 🍓. Mi nombre es: *${guestName}*. ¡Nos vemos pronto! ✨`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
        });
    }
});
