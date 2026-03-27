const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const msgDiv = document.getElementById('response-msg');
        // On cible le bouton à l'intérieur du formulaire
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
                // SUCCESS
                msgDiv.textContent = "Merci pour votre message, nous vous répondrons au plus tôt.";
                msgDiv.className = "contact-success-msg";

                // On cache le bouton d'envoi
                if (submitBtn) submitBtn.classList.add('hidden');

                contactForm.reset();
            } else {
                // ERROR SERVEUR (ex: 500)
                msgDiv.textContent = "Erreur lors de l'envoi. Réessayez plus tard.";
                msgDiv.className = "contact-error-msg";
            }
        } catch (error) {
            // ERROR RESEAU
            msgDiv.textContent = "Impossible de joindre le serveur.";
            msgDiv.className = "contact-error-msg";
        }
    });
}
