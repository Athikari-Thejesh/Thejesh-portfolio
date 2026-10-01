/* Athikari Thejesh — portfolio scripts (no dependencies) */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      menu.classList.toggle('is-open', !open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        menu.classList.remove('is-open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        toggle.click();
        toggle.focus();
      }
    });
  }

  /* ---------- Active section link ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Project cards: expand / collapse ---------- */
  document.querySelectorAll('.project__more').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var label = btn.querySelector('.project__more-label');
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      if (label) label.textContent = open ? 'Show details' : 'Hide details';
    });
  });

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll('.copy[data-copy]').forEach(function (btn) {
    var original = btn.textContent;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        setTimeout(function () { btn.textContent = original; btn.classList.remove('is-done'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---------- Contact form ----------
     1. On Netlify the form is posted to the site itself (Netlify Forms picks it up).
     2. Anywhere else (Vercel, GitHub Pages, local) the POST fails, so we fall back
        to opening the visitor's mail client with the message pre-filled. */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus('Please fill in your name, a valid email and a message.', 'err');
        return;
      }
      var data = new FormData(form);
      setStatus('Sending…', '');
      fetch(form.getAttribute('action') || window.location.pathname, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        setStatus('Message sent. Thank you!', 'ok');
      }).catch(function () {
        var subject = encodeURIComponent('Portfolio contact from ' + (data.get('name') || ''));
        var body = encodeURIComponent(
          (data.get('message') || '') + '\n\n— ' + (data.get('name') || '') + ' <' + (data.get('email') || '') + '>'
        );
        window.location.href = 'mailto:thejeshyadav33@gmail.com?subject=' + subject + '&body=' + body;
        setStatus('Opening your mail app. If nothing happens, email thejeshyadav33@gmail.com directly.', '');
      });
    });
  }
  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form__status mono' + (kind ? ' is-' + kind : '');
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Hero: generative PCB traces on canvas ---------- */
  var canvas = document.getElementById('traces');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, traces = [], pulses = [], raf = 0, last = 0;
    var COPPER = '#e3a75d', GREEN = '#3fd6a4';

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function snap(v, g) { return Math.round(v / g) * g; }

    function build() {
      var rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, rect.width); H = Math.max(1, rect.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var grid = 24;
      var count = Math.round(Math.min(26, Math.max(10, W / 60)));
      traces = [];
      for (var i = 0; i < count; i++) {
        // start on the right / bottom edge region, route with 45° bends like a real PCB
        var x = snap(rnd(W * 0.35, W), grid), y = snap(rnd(0, H), grid);
        var pts = [[x, y]];
        var segs = Math.floor(rnd(3, 7));
        var dir = Math.random() < 0.5 ? -1 : 1; // horizontal direction
        for (var s = 0; s < segs; s++) {
          var len = snap(rnd(grid * 2, grid * 8), grid);
          var kind = Math.random();
          if (kind < 0.55) { x += dir * len; }
          else if (kind < 0.8) { var d = len / 2; x += dir * d; y += (Math.random() < 0.5 ? -1 : 1) * d; } // 45°
          else { y += (Math.random() < 0.5 ? -1 : 1) * len; }
          x = Math.max(-grid, Math.min(W + grid, x)); y = Math.max(-grid, Math.min(H + grid, y));
          pts.push([x, y]);
        }
        traces.push({ pts: pts, w: Math.random() < 0.25 ? 2 : 1.2, pad: Math.random() < 0.6 });
      }
      pulses = [];
      for (var p = 0; p < Math.min(5, traces.length); p++) {
        pulses.push({ t: Math.floor(rnd(0, traces.length)), u: Math.random(), v: rnd(0.08, 0.16) });
      }
      draw(0);
    }

    function pathLen(pts) {
      var L = 0, segs = [];
      for (var i = 1; i < pts.length; i++) {
        var l = Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]);
        segs.push(l); L += l;
      }
      return { L: L, segs: segs };
    }
    function pointAt(pts, u) {
      var pl = pathLen(pts), d = u * pl.L;
      for (var i = 0; i < pl.segs.length; i++) {
        if (d <= pl.segs[i] || i === pl.segs.length - 1) {
          var k = pl.segs[i] ? d / pl.segs[i] : 0;
          return [pts[i][0] + (pts[i+1][0] - pts[i][0]) * k, pts[i][1] + (pts[i+1][1] - pts[i][1]) * k];
        }
        d -= pl.segs[i];
      }
      return pts[pts.length - 1];
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      // fade the whole drawing toward the left so the headline stays readable
      var g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,1)');

      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      traces.forEach(function (t) {
        ctx.beginPath();
        ctx.moveTo(t.pts[0][0], t.pts[0][1]);
        for (var i = 1; i < t.pts.length; i++) ctx.lineTo(t.pts[i][0], t.pts[i][1]);
        ctx.strokeStyle = 'rgba(63, 214, 164, 0.22)';
        ctx.lineWidth = t.w;
        ctx.stroke();
        // via / pad at the end of the trace
        var e = t.pts[t.pts.length - 1];
        ctx.beginPath(); ctx.arc(e[0], e[1], t.pad ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = t.pad ? 'rgba(227, 167, 93, 0.55)' : 'rgba(63, 214, 164, 0.5)';
        ctx.fill();
        if (t.pad) { ctx.beginPath(); ctx.arc(e[0], e[1], 1.6, 0, Math.PI * 2); ctx.fillStyle = '#0b1210'; ctx.fill(); }
      });

      if (!reduceMotion) {
        pulses.forEach(function (p) {
          p.u += p.v * dt;
          if (p.u > 1) { p.u = 0; p.t = Math.floor(Math.random() * traces.length); }
          var pt = pointAt(traces[p.t].pts, p.u);
          var rg = ctx.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], 14);
          rg.addColorStop(0, 'rgba(63, 214, 164, 0.9)'); rg.addColorStop(1, 'rgba(63, 214, 164, 0)');
          ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(pt[0], pt[1], 14, 0, Math.PI * 2); ctx.fill();
        });
      }

      // mask: keep traces mostly on the right
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(ts) {
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }

    build();
    if (!reduceMotion) {
      var vis = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }
        else { cancelAnimationFrame(raf); raf = 0; }
      });
      vis.observe(canvas);
    }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  }
})();
