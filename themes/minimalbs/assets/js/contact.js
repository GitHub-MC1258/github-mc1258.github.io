console.log("Chargement du script de contact...");

document.addEventListener('click', function(e) {
    console.log("Élément cliqué :", e.target);
});
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- LOGIQUE HONEYPOT ---
        const honey = document.getElementById('honeypot').value;
        if (honey !== "") {
            console.warn("Spam détecté !");
            return; // On arrête tout sans envoyer au Worker
        }

        const msgDiv = document.getElementById('response-msg');
        const submitBtn = contactForm.querySelector('button');

        msgDiv.innerText = "Envoi en cours...";
        msgDiv.className = "text-muted small mt-3 text-center";

        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('https://hugo-contact.mcugnolio-662.workers.dev', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                msgDiv.textContent = "Merci pour votre message.";
                msgDiv.className = "contact-success-msg";
                if (submitBtn) submitBtn.classList.add('hidden');
                contactForm.reset();
            } else {
                msgDiv.textContent = "Erreur lors de l'envoi. Réessayez plus tard.";
                msgDiv.className = "contact-error-msg";
            }
        } catch (error) {
            msgDiv.textContent = "Impossible de joindre le serveur.";
            msgDiv.className = "contact-error-msg";
        }
    });
}
