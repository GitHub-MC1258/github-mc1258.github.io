const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('response-msg');
        msgDiv.innerText = "Envoi en cours...";

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
    // MODIFIE LE TEXTE ICI
    responseMsg.textContent = "Merci pour votre message, nous vous répondrons au plus tôt.";
   responseMsg.className = "contact-success-msg";
    contactForm.reset();
} else {
    responseMsg.textContent = "Erreur lors de l'envoi. Réessayez plus tard.";
    responseMsg.className = "text-danger small mt-3 text-center";
}
        } catch (error) {
            msgDiv.innerHTML = "<span style='color: red;'>Impossible de joindre le serveur.</span>";
        }
    });
}
