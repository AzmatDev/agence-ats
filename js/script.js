document.addEventListener('DOMContentLoaded', () => {

    emailjs.init('WYmm6MdNWyiBpeyCc');

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

    /* ── Gestion DATE (min + max) ── */
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);

    const dateInput = document.getElementById('date');
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];

    /* ── Clic carte service ── */
    let lastSelectedCard = null;

    document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
    const serviceValue = card.dataset.service;
    const messageValue = card.dataset.message;

    if (lastSelectedCard) lastSelectedCard.classList.remove('selected');
    card.classList.add('selected');
    lastSelectedCard = card;

    const select = document.getElementById('service');
    if (select && serviceValue) {
    select.value = serviceValue;
    flashField(select);
}

    const textarea = document.getElementById('message');
    if (textarea && messageValue && textarea.value.trim() === '') {
    textarea.value = messageValue;
    flashField(textarea);
}

    document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
});
});

    /* ── Animation flash ── */
    function flashField(el) {
    el.classList.remove('field-flash');
    void el.offsetWidth;
    el.classList.add('field-flash');
    setTimeout(() => el.classList.remove('field-flash'), 1400);
}

    /* ── Soumission ── */
    function submitForm() {
    const prenom  = document.getElementById('prenom').value.trim();
    const nom     = document.getElementById('nom').value.trim();
    const tel     = document.getElementById('tel').value.trim();
    const service = document.getElementById('service').value;
    const date    = document.getElementById('date').value;
    const heure   = document.getElementById('heure').value;
    const depart  = document.getElementById('depart').value.trim();

    if (!prenom || !nom || !tel || !service || !date || !heure || !depart) {
    alert('Veuillez remplir tous les champs obligatoires (*).');
    return;
}

    /* 🔐 Validation date */
    const selectedDate = new Date(date);
    const todayCheck = new Date();
    todayCheck.setHours(0,0,0,0);

    const maxCheck = new Date();
    maxCheck.setFullYear(todayCheck.getFullYear() + 1);

    if (selectedDate < todayCheck) {
    alert("La date ne peut pas être dans le passé.");
    return;
}

    if (selectedDate > maxCheck) {
    alert("La date est trop éloignée.");
    return;
}

    /* 🔐 Validation délai minimum (2h) */
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${heure}`);
    const minDelay = 2 * 60 * 60 * 1000;

    if (selectedDateTime - now < minDelay) {
    alert("Réservation minimum 2 heures à l'avance.");
    return;
}

    const email   = document.getElementById('email').value.trim();
    const arrivee = document.getElementById('arrivee').value.trim();
    const message = document.getElementById('message').value.trim();

    const dateFmt = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

    const texte =
    `Nouvelle réservation Yang Chauffeur\n\n` +
    `Client : ${prenom} ${nom}\n` +
    `Tél : ${tel}${email ? '\nEmail : ' + email : ''}\n` +
    `Service : ${service}\n` +
    `Date : ${dateFmt} à ${heure}\n` +
    `Départ : ${depart}${arrivee ? '\nArrivée : ' + arrivee : ''}` +
    `${message ? '\nInfos : ' + message : ''}`;

    /* WhatsApp */
    const waText = encodeURIComponent(texte);
    setTimeout(() => {
    window.open(`https://wa.me/33753608361?text=${waText}`, '_blank');
}, 300);

    /* EmailJS */

    emailjs.send('service_rvx8dyh', 'template_rnkq2a6', {
    prenom:  prenom,
    nom:     nom,
    tel:     tel,
    email:   email || '—',
    service: service,
    date:    dateFmt,
    heure:   heure,
    depart:  depart,
    arrivee: arrivee || '—',
    infos:   message || '—'
});

    /* Succès */
    document.getElementById('formContent').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
    document.getElementById('successName').textContent = prenom;

    const btnNew = document.createElement('button');
    btnNew.className = 'btn-submit';
    btnNew.style.marginTop = '1.5rem';
    btnNew.textContent = '+ Nouvelle réservation';
    btnNew.onclick = resetForm;

    document.getElementById('formSuccess').appendChild(btnNew);
}
    window.submitForm = submitForm;

    /* ── Reset ── */
    function resetForm() {
    ['prenom','nom','tel','email','service','date','heure','depart','arrivee','message']
    .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
});

    if (lastSelectedCard) {
    lastSelectedCard.classList.remove('selected');
    lastSelectedCard = null;
}

    document.getElementById('formContent').style.display = 'block';
    document.getElementById('formSuccess').style.display = 'none';
    document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
}
    window.resetForm = resetForm;

});
