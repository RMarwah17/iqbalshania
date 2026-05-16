(function () {
  'use strict';

  /* ===== COVER ===== */
  const cover = document.getElementById('cover');
  const mainContent = document.getElementById('main-content');
  const btnOpen = document.getElementById('btnOpen');
  const audio = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicBtn');

  if (btnOpen) {
    btnOpen.addEventListener('click', function () {
      cover.classList.add('opened');
      mainContent.classList.add('visible');
      document.body.style.overflow = '';
      playAudio();
      musicBtn.classList.add('visible');
      
      var bottomNav = document.getElementById('bottomNav');
      if (bottomNav) bottomNav.classList.add('visible');

      setTimeout(initScrollReveal, 300);
    });
  }
  // Lock scroll until cover is opened
  document.body.style.overflow = 'hidden';

  /* ===== MUSIC ===== */
  function playAudio() {
    if (!audio) return;
    audio.volume = 0.5;
    var p = audio.play();
    if (p) p.then(function () { musicBtn.classList.add('playing'); }).catch(function () {});
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', function () {
      if (!audio) return;
      if (audio.paused) {
        audio.play();
        musicBtn.classList.add('playing');
      } else {
        audio.pause();
        musicBtn.classList.remove('playing');
      }
    });
  }

  /* ===== COUNTDOWN ===== */
  var countdownEls = document.querySelectorAll('.countdown-row');
  countdownEls.forEach(function (el) {
    var target = el.getAttribute('data-date');
    var targetDate = new Date(target).getTime();
    var dEl = el.querySelector('.cd-days');
    var hEl = el.querySelector('.cd-hours');
    var mEl = el.querySelector('.cd-mins');
    var sEl = el.querySelector('.cd-secs');

    function updateCountdown() {
      var now = Date.now();
      var diff = targetDate - now;
      if (diff <= 0) {
        if (dEl) dEl.textContent = '0';
        if (hEl) hEl.textContent = '0';
        if (mEl) mEl.textContent = '0';
        if (sEl) sEl.textContent = '0';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      if (dEl) dEl.textContent = d;
      if (hEl) hEl.textContent = h;
      if (mEl) mEl.textContent = m;
      if (sEl) sEl.textContent = s;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  });

  /* ===== SCROLL REVEAL ===== */
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { observer.observe(el); });

    /* NAVBAR OBSERVER */
    var sections = document.querySelectorAll('.section');
    var navItems = document.querySelectorAll('.nav-item');
    if (navItems.length > 0) {
      var navObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            // If it's akad, highlight resepsi button (acara)
            if (id === 'akad') id = 'resepsi';
            navItems.forEach(function(nav) {
              nav.classList.remove('active');
              if (nav.getAttribute('href') === '#' + id) {
                nav.classList.add('active');
              }
            });
          }
        });
      }, { threshold: 0.3 });
      sections.forEach(function(sec) { navObserver.observe(sec); });
    }
  }

  /* ===== RSVP FORM ===== */
  var rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('rsvpName').value.trim();
      var attendance = document.querySelector('input[name="attendance"]:checked');
      var message = document.getElementById('rsvpMessage').value.trim();
      if (!name || !attendance || !message) return;

      var wish = {
        name: name,
        attendance: attendance.value,
        message: message,
        time: new Date().toLocaleString('id-ID')
      };

      var wishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
      wishes.unshift(wish);
      if (wishes.length > 50) wishes = wishes.slice(0, 50);
      localStorage.setItem('wedding_wishes', JSON.stringify(wishes));

      rsvpForm.reset();
      renderWishes();
      showToast('Terima kasih atas ucapannya! 💚');
    });
  }

  function renderWishes() {
    var container = document.getElementById('wishesList');
    if (!container) return;
    var wishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
    if (wishes.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Belum ada ucapan. Jadilah yang pertama! 🌿</p>';
      return;
    }
    var html = '';
    wishes.forEach(function (w) {
      var badge = w.attendance === 'hadir' ? '✓ Hadir' : '✗ Tidak Hadir';
      html += '<div class="wish-item">' +
        '<div><span class="wish-name">' + escapeHtml(w.name) + '</span>' +
        '<span class="wish-attendance">' + badge + '</span></div>' +
        '<div class="wish-message">' + escapeHtml(w.message) + '</div>' +
        '<div class="wish-time">' + escapeHtml(w.time) + '</div></div>';
    });
    container.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Initial render
  renderWishes();

  /* ===== COPY TO CLIPBOARD ===== */
  window.copyText = function (text, btnEl) {
    navigator.clipboard.writeText(text).then(function () {
      btnEl.classList.add('copied');
      btnEl.innerHTML = '✓ Tersalin';
      showToast('Nomor rekening disalin!');
      setTimeout(function () {
        btnEl.classList.remove('copied');
        btnEl.innerHTML = '📋 Salin No. Rekening';
      }, 2500);
    }).catch(function () {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Nomor rekening disalin!');
    });
  };

  /* ===== TOAST ===== */
  function showToast(msg) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('show'); });
    });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }, 2500);
  }

  /* ===== LOADER ===== */
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    if (loader) {
      setTimeout(function () {
        loader.style.opacity = '0';
        setTimeout(function () { loader.style.display = 'none'; }, 500);
      }, 800);
    }
  });

})();
