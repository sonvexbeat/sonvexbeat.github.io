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

    // التعديل هنا: غيرنا toggle-text لـ mode-label عشان يطابق الـ HTML بتاعك
    const toggleText = themeBtn ? themeBtn.querySelector('.mode-label') : null;

    const currentTheme = localStorage.getItem('theme') || 'dark';

    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (toggleText) toggleText.textContent = 'Dark Mode';
    } else {
        // بنأكد إن الدارك مود هو الأساس لو مفيش اختيار قديم
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (toggleText) toggleText.textContent = 'Light Mode';
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



    let isFirstPlay = true;





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






// --- النطة الانتحارية (لضمان التنفيذ غصب عن المتصفح) ---
        rAudio.onplay = function() {
            if (isFirstPlay) {
                let attempts = 0;
                const jumpTo = Math.floor(Math.random() * 21) + 20;

                // بنعمل Timer بيحاول يثبت الوقت 5 مرات ورا بعض
                const forceJump = setInterval(() => {
                    rAudio.currentTime = jumpTo;
                    attempts++;
                    
                    // لو النطة ثبتت أو حاولنا 5 مرات.. بنوقف
                    if (Math.abs(rAudio.currentTime - jumpTo) < 1 || attempts > 5) {
                        clearInterval(forceJump);
                        isFirstPlay = false;
                        rAudio.onplay = null; // نظف الحدث
                    }
                }, 200); 
            }
        };

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



            currentTrackIndex++;



            playRadio();



        });







      // منع التقديم اليدوي وحل مشكلة التأتأة نهائياً



       rAudio.addEventListener('seeking', () => {
    // القفل يشتغل بس لو النطة الأولى خلصت (يعني isFirstPlay بقت false)
    if (!isFirstPlay && rAudio.currentTime > 0) {
        rAudio.currentTime = 0;
    }
});







        // إضافة حماية إضافية لمنع التأتأة عند التوقف المفاجئ



        rAudio.addEventListener('waiting', () => {



            // لو المتصفح وقف عشان "يقطع" أو يحمل، بنخليه يكمل لعب فوراً



            rAudio.play();



        });







       // تحديث شكل الشريط الداخلي في الموقع



        rAudio.addEventListener('timeupdate', () => {



            if (rProg) {



                // الطريقة الصح لضمان الـ 100%



                rProg.style.setProperty('width', '100%', 'important');



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
            // منع وصول الضغطة للـ body نهائياً
            e.stopImmediatePropagation();

            if (teaserAudio.paused) {
                // لو دوسنا بلاي على التيزر.. الراديو يقف اتوماتيك
                if (rAudio) rAudio.pause(); 
                teaserAudio.volume = 0.9; 
                teaserAudio.play();
                playIcon?.classList.replace('fa-play', 'fa-pause');

                // --- تحديث النص فقط في شاشة القفل ---
                if ('mediaSession' in navigator) {
                    const trackName = document.querySelector('.track-name-display')?.innerText || 'Upcoming Track';
                    const artistName = document.querySelector('.track-artist-display')?.innerText || 'Prod. SB';

                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: trackName,
                        artist: artistName,
                        album: 'Upcoming Exclusive'
                    });
                }

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


// 1. تسجيل المحرك (Service Worker) - السطرين دول هما "الموتور"
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

    
// --- Sonvex PWA Control Engine (Manual Override) ---
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

// إظهار الزرار فوراً وبشكل دائم زي ما طلبت
installBtn.style.display = 'inline-flex';

// 1. منع إشعار جوجل التلقائي عشان أنت اللي تتحكم
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // السطر ده بيوقف "هري" جوجل وإشعاراتها التلقائية
    deferredPrompt = e;
    console.log('PWA is ready, waiting for Sonvex click...');
});

// 2. تشغيل التثبيت لما المستخدم يدوس على زرارك أنت
installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        // لو الموبايل لقط الملفات، هيفتح نافذة التثبيت بطلبك أنت
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        
        // مش هنصفر الـ prompt هنا عشان الزرار يفضل شغال لو حب يثبته تاني
    } else {
        // لو المتصفح لسه ملقطش الـ PWA (بسبب الكاش)
        alert("خاصية التطبيق جاهزة! لو مظهرتش نافذة التثبيت فوراً، جرب تقفل المتصفح وتفتحه تاني.");
    }
});

// 3. التأكيد إن الزرار مش هيختفي أبداً حتى بعد التثبيت
window.addEventListener('appinstalled', () => {
    console.log('Sonvex App Installed Successfully!');
    installBtn.style.display = 'inline-flex'; // بيفضل ظاهر "محشور" مكانه
});
    
// كود سحري لتسريع الموقع بدون حذف أي محتوى
document.querySelectorAll('iframe').forEach(iframe => {
    iframe.setAttribute('loading', 'lazy'); // هيحمل الفيديو لما تنزل له بس
});

document.querySelectorAll('img').forEach(img => {
    img.setAttribute('loading', 'lazy'); // هيحمل الصور بالطلب
    img.setAttribute('decoding', 'async'); // مش هيعطل ظهور الكلام
});


}); // نهاية الملف
