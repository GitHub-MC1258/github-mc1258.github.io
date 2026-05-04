<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 1. SECURITÉ : Vérification du Honeypot anti-spam avant toute chose
// Si le champ caché est rempli, on arrête silencieusement (pour ne pas aider le bot)
if (!empty($_POST['anti-spam'])) {
    exit;
}

// 2. Config sécurisée (assure-toi que ce fichier est inaccessible via URL)
$config = require __DIR__ . '/secure/config.php';

// 3. PHPMailer
require_once __DIR__ . '/phpmailer/src/Exception.php';
require_once __DIR__ . '/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// On ne traite que les requêtes POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $mail = new PHPMailer(true);

    // Récupération et nettoyage des champs
    $nom     = isset($_POST['name'])      ? trim($_POST['name'])      : '';
    $prenom  = isset($_POST['firstname']) ? trim($_POST['firstname']) : '';
    $email   = isset($_POST['email'])     ? trim($_POST['email'])     : '';
    $message = isset($_POST['message'])   ? trim($_POST['message'])   : '';

    // Validation minimale de l'email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Adresse email invalide.";
        exit;
    }

    try {
        // Configuration SMTP
        $mail->isSMTP();
        $mail->Host       = $config['smtp_host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $config['smtp_user'];
        $mail->Password   = $config['smtp_pass'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $config['smtp_port'];

        $mail->setFrom($config['smtp_user'], '6te4mc.ct.ws');
        $mail->addAddress('antec74@hotmail.fr');

        // Permet de répondre directement à l'expéditeur
        $mail->addReplyTo($email, $prenom . ' ' . $nom);

        // UTF-8 pour les accents
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->isHTML(true);

        // Contenu du mail
        $mail->Subject = 'Formulaire de contact – 6te4mc.ct.ws';
        $mail->Body    =
            "<h3>Nouveau message reçu</h3>"
          . "<p><strong>Nom :</strong> " . htmlspecialchars($nom) . "</p>"
          . "<p><strong>Prénom :</strong> " . htmlspecialchars($prenom) . "</p>"
          . "<p><strong>Email :</strong> " . htmlspecialchars($email) . "</p>"
          . "<p><strong>Message :</strong><br>" . nl2br(htmlspecialchars($message)) . "</p>";

        // Envoi
        $mail->send();

        // Redirection vers la page merci
        header('Location: /merci/');
        exit;

    } catch (Exception $e) {
        // En prod, il vaut mieux loguer l'erreur plutôt que de l'afficher
        echo 'Erreur lors de l’envoi : ' . htmlspecialchars($mail->ErrorInfo);
    }
} else {
    // Si accès direct au fichier PHP sans formulaire, redirection vers l'accueil
    header('Location: /');
    exit;
}
