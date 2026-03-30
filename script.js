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


// Pro Player Functionality
    const teaserAudio = document.getElementById('teaser-track');
    const playBtn = document.getElementById('play-pause-trigger');
    const playIcon = document.getElementById('status-icon');
    const progFill = document.getElementById('audio-progress');
    const seekContainer = document.getElementById('seek-bar-container');

    if (playBtn && teaserAudio) {
        playBtn.addEventListener('click', () => {
            if (teaserAudio.paused) {
                teaserAudio.play();
                playIcon.classList.replace('fa-play', 'fa-pause');
            } else {
                teaserAudio.pause();
                playIcon.classList.replace('fa-pause', 'fa-play');
            }
        });

        teaserAudio.addEventListener('timeupdate', () => {
            const percent = (teaserAudio.currentTime / teaserAudio.duration) * 100;
            if (progFill) progFill.style.width = percent + '%';
            const currTime = document.getElementById('time-current');
            if (currTime) currTime.innerText = formatTime(teaserAudio.currentTime);
        });

        teaserAudio.addEventListener('loadedmetadata', () => {
            const totalTime = document.getElementById('time-total');
            if (totalTime) totalTime.innerText = formatTime(teaserAudio.duration);
        });

        seekContainer?.addEventListener('click', (e) => {
            const width = seekContainer.clientWidth;
            teaserAudio.currentTime = (e.offsetX / width) * teaserAudio.duration;
        });
    }

    function formatTime(time) {
        let min = Math.floor(time / 60);
        let sec = Math.floor(time % 60);
        return min + ":" + (sec < 10 ? '0' + sec : sec);
    }


});
