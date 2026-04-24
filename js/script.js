document.addEventListener('DOMContentLoaded', () => {

    /* ── EmailJS init ── */
    emailjs.init('VOTRE_PUBLIC_KEY'); // ← remplacer

    /* ── Canvas étoiles filantes ── */
    const canvas = document.getElementById('stars-canvas');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    let W, H;

    function resizeCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function initStars() {
        stars = [];
        const count = Math.floor((W * H) / 4500);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.2 + 0.2,
                alpha: Math.random() * 0.7 + 0.2,
                speed: Math.random() * 0.004 + 0.001,
                phase: Math.random() * Math.PI * 2,
                color: Math.random() > 0.85 ? '#a78bfa' : '#ffffff'
            });
        }
    }
    initStars();
    window.addEventListener('resize', initStars);

    function spawnShootingStar() {
        if (Math.random() > 0.004) return;
        shootingStars.push({
            x: Math.random() * W * 0.7,
            y: Math.random() * H * 0.4,
            len: Math.random() * 120 + 60,
            speed: Math.random() * 8 + 6,
            alpha: 1,
            angle: Math.PI / 5
        });
    }

    let frame = 0;
    function animateStars() {
        ctx.clearRect(0, 0, W, H);
        frame++;

        stars.forEach(s => {
            const twinkle = Math.sin(frame * s.speed + s.phase);
            const a = s.alpha + twinkle * 0.25;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.max(0.05, Math.min(1, a));
            ctx.fill();
        });

        spawnShootingStar();
        shootingStars = shootingStars.filter(ss => ss.alpha > 0.02);
        shootingStars.forEach(ss => {
            ctx.save();
            ctx.translate(ss.x, ss.y);
            ctx.rotate(ss.angle);
            const grad = ctx.createLinearGradient(0, 0, ss.len, 0);
            grad.addColorStop(0, `rgba(167,139,250,${ss.alpha})`);
            grad.addColorStop(1, 'rgba(167,139,250,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = ss.alpha;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(ss.len, 0);
            ctx.stroke();
            ctx.restore();
            ss.x += ss.speed * Math.cos(ss.angle);
            ss.y += ss.speed * Math.sin(ss.angle);
            ss.alpha -= 0.018;
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(animateStars);
    }
    animateStars();

    /* ── Navbar scroll ── */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* ── Navigation ── */
    function openMenu() {
        document.getElementById('mobileMenu').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        document.getElementById('mobileMenu').classList.remove('open');
        document.body.style.overflow = '';
    }
    window.openMenu = openMenu;
    window.closeMenu = closeMenu;

    /* ── Scroll reveal ── */
    const revealEls = document.querySelectorAll(
        '#about .about-inner, #services .service-card, #fleet .fleet-grid, .avis-card, .reservation-wrap'
    );
    revealEls.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealEls.forEach(el => observer.observe(el));

    /* ── Date min ── */
    const dateInput = document.getElementById('date');
    const today = new Date();
    dateInput.min = today.toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);
    dateInput.max = maxDate.toISOString().split('T')[0];

    /* ── Cartes service → formulaire ── */
    let lastSelectedCard = null;

    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            if (lastSelectedCard) lastSelectedCard.classList.remove('selected');
            card.classList.add('selected');
            lastSelectedCard = card;

            const select = document.getElementById('service');
            if (select && card.dataset.service) {
                select.value = card.dataset.service;
                flashField(select);
            }
            const textarea = document.getElementById('message');
            if (textarea && card.dataset.message && textarea.value.trim() === '') {
                textarea.value = card.dataset.message;
                flashField(textarea);
            }
            document.getElementById('reservation').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    function flashField(el) {
        el.classList.remove('field-flash');
        void el.offsetWidth;
        el.classList.add('field-flash');
        setTimeout(() => el.classList.remove('field-flash'), 1400);
    }

    /* ── Soumission formulaire ── */
    function submitForm() {
        const prenom  = document.getElementById('prenom').value.trim();
        const nom     = document.getElementById('nom').value.trim();
        const tel     = document.getElementById('tel').value.trim();
        const service = document.getElementById('service').value;
        const date    = document.getElementById('date').value;
        const heure   = document.getElementById('heure').value;
        const depart  = document.getElementById('depart').value.trim();
        const arrivee = document.getElementById('arrivee').value.trim();

        if (!prenom || !nom || !tel || !service || !date || !heure || !depart) {
            alert('Veuillez remplir tous les champs obligatoires (*).');
            return;
        }

        /* Validation date */
        const selectedDate = new Date(date);
        const todayCheck = new Date(); todayCheck.setHours(0,0,0,0);
        if (selectedDate < todayCheck) { alert('La date ne peut pas être dans le passé.'); return; }

        /* Délai minimum 2h */
        const selectedDateTime = new Date(`${date}T${heure}`);
        if (selectedDateTime - new Date() < 2 * 60 * 60 * 1000) {
            alert('Réservation minimum 2 heures à l\'avance.');
            return;
        }

        const email   = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const dateFmt = new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const texte =
            `Nouvelle réservation — Agence ATS VTC\n\n` +
            `Client : ${prenom} ${nom}\n` +
            `Tél : ${tel}${email ? '\nEmail : ' + email : ''}\n` +
            `Service : ${service}\n` +
            `Date : ${dateFmt} à ${heure}\n` +
            `Départ : ${depart}${arrivee ? '\nArrivée : ' + arrivee : ''}` +
            `${message ? '\nInfos : ' + message : ''}`;

        /* WhatsApp → numéro ATS */
        setTimeout(() => {
            window.open(`https://wa.me/33766132171?text=${encodeURIComponent(texte)}`, '_blank');
        }, 300);

        /* EmailJS */
        emailjs.send('VOTRE_SERVICE_ID', 'VOTRE_TEMPLATE_ID', {
            prenom, nom, tel,
            email:   email || '—',
            service, date: dateFmt, heure, depart,
            arrivee: arrivee || '—',
            infos:   message || '—'
        });

        /* Succès */
        document.getElementById('formContent').style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
        document.getElementById('successName').textContent = prenom;

        document.getElementById('formSuccess').querySelector('.btn-new-resa')?.remove();
        const btnNew = document.createElement('button');
        btnNew.className = 'btn-submit btn-new-resa';
        btnNew.style.marginTop = '1.5rem';
        btnNew.textContent = '+ Nouvelle réservation';
        btnNew.onclick = resetForm;
        document.getElementById('formSuccess').appendChild(btnNew);
    }
    window.submitForm = submitForm;

    /* ── Reset formulaire ── */
    function resetForm() {
        ['prenom','nom','tel','email','service','date','heure','depart','arrivee','message']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        dateInput.min = new Date().toISOString().split('T')[0];
        if (lastSelectedCard) { lastSelectedCard.classList.remove('selected'); lastSelectedCard = null; }
        document.getElementById('formContent').style.display = 'block';
        document.getElementById('formSuccess').style.display = 'none';
        document.getElementById('reservation').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.resetForm = resetForm;

});