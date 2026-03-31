document.addEventListener('DOMContentLoaded', () => {
    const progressContainer = document.getElementById("progress-container");
    const progressCircle = document.querySelector('.progress');
    const circumference = 2 * Math.PI * 45;

    if (!progressContainer || !progressCircle) return;

    window.addEventListener('scroll', () => {
        // --- 1. Calcul du pourcentage et mise à jour du cercle ---
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrollCurrent = window.pageYOffset;

        if (scrollTotal > 0) {
            const p = (scrollCurrent / scrollTotal) * circumference;
            progressCircle.style.strokeDashoffset = circumference - p;
        }

        // --- 2. Apparition fluide (seuil de 300px) ---
        if (scrollCurrent > 300) {
            progressContainer.style.display = "flex";
        } else {
            progressContainer.style.display = "none";
        }

        // --- 3. CHERRY ON THE CAKE : Changement de couleur à 100% ---
        // On vérifie si on est à 100% (scrollTotal) ou très proche (>=)
        const isFinished = scrollCurrent >= scrollTotal;
        progressContainer.classList.toggle('is-complete', isFinished);
    });

    // Fonction de retour en haut
    progressContainer.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
