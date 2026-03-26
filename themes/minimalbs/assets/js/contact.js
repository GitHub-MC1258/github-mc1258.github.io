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
                msgDiv.innerHTML = "<span style='color: green;'>Message envoyé avec succès !</span>";
                contactForm.reset();
            } else {
                msgDiv.innerHTML = "<span style='color: red;'>Erreur lors de l'envoi via le Worker.</span>";
            }
        } catch (error) {
            msgDiv.innerHTML = "<span style='color: red;'>Impossible de joindre le serveur.</span>";
        }
    });
}
