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

    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (toggleText) toggleText.textContent = 'Dark Mode';
    }

    themeBtn?.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
            if (themeIcon) themeIcon.textContent = '🌙';
            if (toggleText) toggleText.textContent = 'Dark Mode';
        } else {
            localStorage.setItem('theme', 'dark');
            if (themeIcon) themeIcon.textContent = '☀️';
            if (toggleText) toggleText.textContent = 'Light Mode';
        }
    });

    // 3. Audio Visualizer Background
    const visualizerBg = document.getElementById('visualizer-bg');
    if (visualizerBg) {
        const NUM_BARS = 32;
        for (let i = 0; i < NUM_BARS; i++) {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            const animationDuration = Math.random() * 0.8 + 0.4;
            const animationDelay = Math.random() * -2;
            const minHeight = Math.random() * 10 + 5;
            const maxHeight = Math.random() * 50 + 20;

            bar.style.animationDuration = `${animationDuration}s`;
            bar.style.animationDelay = `${animationDelay}s`;
            bar.style.setProperty('--h-min', `${minHeight}vh`);
            bar.style.setProperty('--h-max', `${maxHeight}vh`);
            visualizerBg.appendChild(bar);
        }
    }

    // --- 4. Sonvex Radio Logic ---
    const radioItems = document.querySelectorAll('.radio-item');
    const radioPlaylist = Array.from(radioItems).map(item => ({
        title: item.getAttribute('data-title'),
        file: item.getAttribute('data-src')
    }));

    let radioIdx = Math.floor(Math.random() * radioPlaylist.length);
    const rAudio = document.getElementById('radio-audio-player');
    const rTitle = document.getElementById('radio-track-title');
    const rProg = document.getElementById('radio-progress');
    const volumeSlider = document.getElementById('volume-slider');

    function playRadio(idx) {
        if (!rAudio || radioPlaylist.length === 0) return;
        const track = radioPlaylist[idx];
        rAudio.src = track.file;
        rTitle.innerText = track.title;
        
        // الراديو يلتزم بقيمة السلايدر
        rAudio.volume = volumeSlider ? volumeSlider.value : 0.5;
        
        rAudio.play().catch(() => {
            document.addEventListener('click', () => {
                if (rAudio.paused && (!teaserAudio || teaserAudio.paused)) {
                    rAudio.play();
                }
            }, { once: true });
        });
    }

    if (rAudio) {
        rAudio.addEventListener('ended', () => {
            radioIdx = (radioIdx + 1) % radioPlaylist.length;
            playRadio(radioIdx);
        });

        rAudio.addEventListener('timeupdate', () => {
            const percent = (rAudio.currentTime / rAudio.duration) * 100;
            if (rProg) rProg.style.width = percent + '%';
        });
    }

    // --- 5. Pro Player Functionality (المشغل الكبير) ---
    const teaserAudio = document.getElementById('teaser-track');
    const playBtn = document.getElementById('play-pause-trigger');
    const playIcon = document.getElementById('status-icon');
    const progFill = document.getElementById('audio-progress');
    const seekContainer = document.getElementById('seek-bar-container');

    if (playBtn && teaserAudio) {
        playBtn.addEventListener('click', () => {
            if (teaserAudio.paused) {
                if (rAudio) rAudio.pause(); 
                
                // التعديل: التراكات الأساسية تشتغل بصوت كامل دايماً (0.9 مريح جداً)
                teaserAudio.volume = 0.9; 
                
                teaserAudio.play();
                playIcon?.classList.replace('fa-play', 'fa-pause');
            } else {
                teaserAudio.pause();
                playIcon?.classList.replace('fa-pause', 'fa-play');
                if (rAudio) rAudio.play();
            }
        });

        teaserAudio.addEventListener('ended', () => {
            playIcon?.classList.replace('fa-pause', 'fa-play');
            if (rAudio) rAudio.play();
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
        if (isNaN(time)) return "0:00";
        let min = Math.floor(time / 60);
        let sec = Math.floor(time % 60);
        return min + ":" + (sec < 10 ? '0' + sec : sec);
    }

 playRadio(radioIdx);

    // --- 6. التحكم في مستوى الصوت (للراديو فقط) ---
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (rAudio) rAudio.volume = val;
        });
    }

    // تشغيل الراديو مع أول ضغطة في أي مكان وإخفاء الجملة
    document.addEventListener('click', () => {
        // التأكد إن الراديو واقف "وكمان" البرومو مش شغال عشان الأصوات ما تدخلش في بعض
        if (rAudio && rAudio.paused && (!teaserAudio || teaserAudio.paused)) {
            rAudio.play().catch(err => console.log("Playback blocked"));
        }
        
        // إخفاء الجملة التوضيحية بنعومة
        const hint = document.getElementById('click-hint');
        if(hint) {
            hint.style.transition = 'opacity 0.5s ease'; // إضافة تأثير النعومة
            hint.style.opacity = '0';
            // مسح العنصر تماماً من الصفحة بعد ما يختفي عشان ما ياخدش مساحة
            setTimeout(() => { hint.style.display = 'none'; }, 500);
        }
    }, { once: true });

}); // نهاية الملف
