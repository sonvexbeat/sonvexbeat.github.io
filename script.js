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

    // --- 4. Sonvex Radio Logic (True Shuffle Mode) ---
    const radioItems = document.querySelectorAll('.radio-item');
    const radioPlaylist = Array.from(radioItems).map(item => ({
        title: item.getAttribute('data-title'),
        file: item.getAttribute('data-src')
    }));

    const rAudio = document.getElementById('radio-audio-player');
    const rTitle = document.getElementById('radio-track-title');
    const rProg = document.getElementById('radio-progress');
    const volumeSlider = document.getElementById('volume-slider');

    let shuffledQueue = [];
    let currentTrackIndex = 0;

    // دالة خلط المصفوفة
    function shuffleArray(array) {
        let newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

   function playRadio() {
        if (!rAudio || radioPlaylist.length === 0) return;

        // خلط القائمة لو خلصت أو بدأت
        if (shuffledQueue.length === 0 || currentTrackIndex >= shuffledQueue.length) {
            shuffledQueue = shuffleArray(radioPlaylist);
            currentTrackIndex = 0;
        }

        const track = shuffledQueue[currentTrackIndex];
        rAudio.src = track.file;
        rTitle.innerText = track.title;
        rAudio.volume = volumeSlider ? volumeSlider.value : 0.5;

        // --- 1. قفل خاصية الوقت (الضبة والمفتاح للكمبيوتر والموبايل) ---
        // بنوهم المتصفح إن مدة الملف "لانهاية" عشان يقلب لوضع الـ Live ويخفي شريط التحكم الخارجي
        try {
            Object.defineProperty(rAudio, 'duration', {
                get: function() { return Infinity; },
                configurable: true
            });
        } catch(e) { console.log("Stream Protected"); }

        // --- 2. إعدادات نظام التشغيل وشاشة القفل (MediaSession) ---
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: 'Sonvex Beat',
                album: 'Sonvex Live Radio',
                artwork: [{ src: 'logo-dark.png', sizes: '512x512', type: 'image/png' }]
            });

            // تفعيل التشغيل والإيقاف فقط من الخارج
            navigator.mediaSession.setActionHandler('play', () => {
                rAudio.play();
                navigator.mediaSession.playbackState = "playing";
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                rAudio.pause();
                navigator.mediaSession.playbackState = "paused";
            });

            // تعطيل كافة أزرار التقديم، الترجيع، والتخطي (قفل تام)
            const disableActions = ['seekto', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack'];
            disableActions.forEach(action => {
                try { navigator.mediaSession.setActionHandler(action, null); } catch(e) {}
            });
            
            navigator.mediaSession.playbackState = "playing";
        }

        rAudio.play().catch(err => console.log("User interaction required for audio"));
    }

    // --- 3. الحارس الداخلي والتحكم في شكل الشريط (Listeners) ---
    if (rAudio) {
        // الانتقال للتراك التالي تلقائياً
        rAudio.addEventListener('ended', () => {
            currentTrackIndex++;
            playRadio();
        });

        // منع التقديم اليدوي (لو اليوزر حاول يلمس الشريط أو يستخدم الكيبورد)
        rAudio.addEventListener('seeking', () => {
            if (rAudio.currentTime > 0) {
                // بيرجعه فوراً للنقطة اللي كان فيها (تجمد الشريط)
                rAudio.currentTime = rAudio.currentTime; 
            }
        });

        // تحديث شكل الشريط الداخلي في الموقع
        rAudio.addEventListener('timeupdate', () => {
            // بما إننا في وضع "راديو لايف"، هنخلي الشريط منور بالكامل (100%) دايماً
            // ده بيدي إيحاء احترافي إن البث مستمر ملوش نهاية
            if (rProg) {
                rProg.style.width = '100%';
            }
        });
    }
    // --- 5. Pro Player Functionality (المشغل الكبير) ---
    const teaserAudio = document.getElementById('teaser-track');
    const playBtn = document.getElementById('play-pause-trigger');
    const playIcon = document.getElementById('status-icon');
    const progFill = document.getElementById('audio-progress');
    const seekContainer = document.getElementById('seek-bar-container');

    if (playBtn && teaserAudio) {
        playBtn.addEventListener('click', (e) => {
            // منع وصول الضغطة للـ body نهائياً عشان الراديو مياخدش أمر تشغيل في نفس اللحظة
            e.stopImmediatePropagation();

            if (teaserAudio.paused) {
                // لو دوسنا بلاي على التيزر.. الراديو يقف اتوماتيك
                if (rAudio) rAudio.pause(); 
                teaserAudio.volume = 0.9; 
                teaserAudio.play();
                playIcon?.classList.replace('fa-play', 'fa-pause');
                
                // إخفاء الهنت لو موجود
                hideHint();
            } else {
                // لو دوسنا ستوب على التيزر.. الراديو يشتغل تلقائي
                teaserAudio.pause();
                playIcon?.classList.replace('fa-pause', 'fa-play');
                
                // الراديو يرجع يشتغل لوحده
                if (rAudio) {
                    if (!rAudio.src) playRadio();
                    else rAudio.play().catch(err => console.log("Radio wait"));
                }
            }
        });

        teaserAudio.addEventListener('ended', () => {
            playIcon?.classList.replace('fa-pause', 'fa-play');
            // الراديو يرجع يشتغل تلقائي لما التيزر يخلص
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

    // --- 6. التحكم في مستوى الصوت ---
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (rAudio) rAudio.volume = val;
        });
    }

    // دالة إخفاء الجملة التوضيحية
    function hideHint() {
        const hint = document.getElementById('click-hint');
        if(hint) {
            hint.style.transition = 'opacity 0.5s ease';
            hint.style.opacity = '0';
            setTimeout(() => { hint.style.display = 'none'; }, 500);
        }
    }

    // تشغيل الراديو مع أول ضغطة في أي مكان وإخفاء الجملة
    document.addEventListener('click', (e) => {
        // لو الدوسة على زرار التيزر، اخرج فوراً وسيب الكود الخاص بالـ playBtn هو اللي يتصرف
        if (e.target.closest('#play-pause-trigger')) return;

        // لو التيزر شغال حالياً، متفتحش الراديو أبداً عشان الصوتين ميتداخلوش
        if (teaserAudio && !teaserAudio.paused) return;

        // 1. لو الراديو لسه ملوش مصدر صوت، شغله فوراً بنظام الشفل
        if (rAudio && !rAudio.src) {
            playRadio();
        }

        // 2. التأكد إن الراديو واقف والبرومو مش شغال، فنشغله
        if (rAudio && rAudio.paused) {
            rAudio.play().catch(err => console.log("Playback blocked"));
        }
        
        hideHint();
    });

    // --- 7. Contact Email Copy Logic ---
    const contactBtn = document.getElementById('contact-link');
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            const email = 'sonvexbeat@proton.me';
            
            navigator.clipboard.writeText(email).then(() => {
                showToast('Email Copied to Clipboard!');
                
                setTimeout(() => {
                    window.location.href = "mailto:" + email;
                }, 1000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }

    // دالة إظهار التنبيه (Toast)
    function showToast(message) {
        const toast = document.createElement('div');
        toast.innerText = message;
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '12px',
            backdropFilter: 'blur(15px)',
            webkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: '10000',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '14px',
            transition: 'all 0.5s ease',
            opacity: '0',
            transform: 'translateY(20px)'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // --- 8. العداد الوهمي للمستمعين ---
    const liveCounter = document.getElementById('live-counter');
    if (liveCounter) {
        let listeners = Math.floor(Math.random() * (290 - 260 + 1)) + 260;
        liveCounter.innerText = listeners;

        setInterval(() => {
            const change = Math.floor(Math.random() * 10) - 4;
            listeners += change;
            if (listeners < 250) listeners += 2;
            if (listeners > 325) listeners -= 2;
            liveCounter.innerText = listeners;
        }, 3000);
    }

}); // نهاية الملف
