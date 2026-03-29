document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
    });

    // 2. Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const toggleText = document.querySelector('.toggle-text');

    // Check for saved theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeIcon.textContent = '🌙';
        toggleText.textContent = 'Dark Mode';
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
            themeIcon.textContent = '🌙';
            toggleText.textContent = 'Dark Mode';
        } else {
            localStorage.setItem('theme', 'dark');
            themeIcon.textContent = '☀️';
            toggleText.textContent = 'Light Mode';
        }
    });

    // 3. Audio Visualizer Background
    const visualizerBg = document.getElementById('visualizer-bg');
    const NUM_BARS = 32; // Number of pulsing audio bars

    for (let i = 0; i < NUM_BARS; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');

        // Randomize animation duration for a dynamic wave effect (0.4s to 1.2s)
        const animationDuration = Math.random() * 0.8 + 0.4;

        // Start at different times
        const animationDelay = Math.random() * -2;

        // Dynamic pulse heights
        const minHeight = Math.random() * 10 + 5; // 5vh to 15vh
        const maxHeight = Math.random() * 50 + 20; // 20vh to 70vh

        bar.style.animationDuration = `${animationDuration}s`;
        bar.style.animationDelay = `${animationDelay}s`;

        // Send CSS custom properties to keyframes smoothly
        bar.style.setProperty('--h-min', `${minHeight}vh`);
        bar.style.setProperty('--h-max', `${maxHeight}vh`);

        visualizerBg.appendChild(bar);
    }
});
