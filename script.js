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
    let isFirstPlay = true; // (إضافة: مفتاح أول تشغيل)

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

        // (إضافة: جلب بيانات الوقت الحقيقي للواقعية)
        const savedTrackFile = localStorage.getItem('sonvex_last_file');
        const savedStartTime = parseInt(localStorage.getItem('sonvex_start_timestamp')) || 0;
        const now = Date.now();

        // خلط القائمة لو خلصت أو بدأت
        if (shuffledQueue.length === 0 || currentTrackIndex >= shuffledQueue.length) {
            shuffledQueue = shuffleArray(radioPlaylist);
            currentTrackIndex = 0;
        }

        // (إضافة: لو ريفريش يرجع لنفس التراك)
        if (isFirstPlay && savedTrackFile) {
            const foundIndex = shuffledQueue.findIndex(t => t.file === savedTrackFile);
            if (foundIndex !== -1) currentTrackIndex = foundIndex;
        }

        const track = shuffledQueue[currentTrackIndex];
        rAudio.src = track.file;
        rTitle.innerText = track.title;
        rAudio.volume = volumeSlider ? volumeSlider.value : 0.5;

        // --- إضافة حركة الـ Live (أول تراك بس) ---
        rAudio.onloadedmetadata = function() {
            if (isFirstPlay) {
                const duration = rAudio.duration;
                const elapsed = (now - savedStartTime) / 1000;

                if (savedStartTime > 0 && elapsed < duration && savedTrackFile === track.file) {
                    // واقعية: الأغنية سبقت المستمع بمقدار وقت الغياب
                    rAudio.currentTime = elapsed;
                } else {
                    // دخول جديد: نطة عشوائية
                    if (duration && isFinite(duration) && duration > 20) {
                        rAudio.currentTime = Math.floor(Math.random() * (duration - 15)) + 5;
                    }
                    localStorage.setItem('sonvex_start_timestamp', Date.now() - (rAudio.currentTime * 1000));
                }
                isFirstPlay = false;
            }
        };

        // (إضافة: حفظ بيانات التراك الحالي)
        localStorage.setItem('sonvex_last_file', track.file);
        if (!localStorage.getItem('sonvex_start_timestamp') || rAudio.currentTime < 2) {
            localStorage.setItem('sonvex_start_timestamp', Date.now());
        }

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
                artwork: [
                    { 
                        src: 'https://i.ibb.co/xVgJjLJ/SB-Logo-PNG.png', 
                        sizes: '512x512', 
                        type: 'image/png' 
                    }
                ]
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
            localStorage.setItem('sonvex_start_timestamp', Date.now());
            currentTrackIndex++;
            playRadio();
        });

        // منع التقديم اليدوي (مع السماح لنطة الواقعية في البداية)
        rAudio.addEventListener('seeking', () => {
            // التعديل هنا: بنضيف شرط إن الأغنية تكون بدأت فعلاً (أكبر من ثانية مثلاً)
            // عشان ميتخانقش مع كود الواقعية اللي بيشتغل في أول لحظة
            if (!isFirstPlay && rAudio.currentTime > 1) { 
                rAudio.currentTime = 0; 
            }
        });

        // إضافة حماية إضافية لمنع التأتأة
        rAudio.addEventListener('waiting', () => {
            rAudio.play();
        });

        // تحديث شكل الشريط وإخفاء التايمر وحفظ الوقت الحقيقي
        rAudio.addEventListener('timeupdate', () => {
            if (rProg) {
                rProg.style.setProperty('width', '100%', 'important');
            }
            
         // التعديل هنا: 
            // 1. لازم نكون عدينا مرحلة التحميل الأول (isFirstPlay بقت false)
            // 2. ولازم الأغنية تكون مشيت فعلاً (أكبر من ثانية مثلاً)
            if (!isFirstPlay && rAudio.currentTime > 1) {
                localStorage.setItem('sonvex_start_timestamp', Date.now() - (rAudio.currentTime * 1000));
            }

            if ('mediaSession' in navigator) {
                navigator.mediaSession.setPositionState(null);
            }
        });
        
         } // إغلاق if (rAudio)

        

    
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

        // 1. لو الدوسة على زرار التيزر (المشغل الكبير)، اخرج فوراً

        if (e.target.closest('#play-pause-trigger')) return;



        // 2. لو التيزر شغال حالياً، ممنوع الراديو يفتح عشان ميبقاش فيه صوتين

        if (teaserAudio && !teaserAudio.paused) return;



        if (rAudio) {

            // 3. لو الراديو لسه ملوش مصدر صوت (أول مرة)، شغله بالشفل

            if (!rAudio.src || rAudio.src === "") {

                playRadio();

                hideHint();

                return;

            }



            // 4. الحل الأكيد لمنع التأتأة (Check for Buffering/ReadyState)

            // readyState < 2 معناها إن الملف لسه بيحمل أو مفيش بيانات كافية

            if (rAudio.paused && rAudio.readyState >= 2) {

                rAudio.play().catch(err => console.log("Playback wait..."));

                hideHint();

            }

        }

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



   // --- 8. العداد الوهمي للمستمعين (ترتيب إنجليزي سليم) ---
const liveCounter = document.getElementById('live-counter');
if (liveCounter) {
    let listeners = 52; 
    liveCounter.innerText = listeners;

    setInterval(() => {
        let change;
        
        // مود الصعود (تحت الـ 300): الزيادة (8) أكبر من النقصان (3)
        if (listeners < 300) {
            change = Math.floor(Math.random() * 12) - 3; 
        } 
        // مود الثبات (فوق الـ 300): النقصان (7) أكبر من الزيادة (3)
        else {
            change = Math.floor(Math.random() * 11) - 7; 
        }

        listeners += change;

        // حماية البداية والنهاية
        if (listeners < 52) listeners = Math.floor(Math.random() * 5) + 52;
        if (listeners > 420) listeners -= 10; 

        liveCounter.innerText = listeners;
    }, 3000); 
}

}); // نهاية الملف
