/**
 * Knowledge base injected into the badgi AI assistant's system prompt.
 *
 * Keep this file FACTUAL: every statement here must describe what the
 * platform actually does. The assistant is instructed to never invent
 * features that are not listed here. Update it whenever a user-facing
 * feature changes. Written in French (default locale); the model answers
 * in the user's language regardless.
 */
export const BADGI_KNOWLEDGE = `
# badgi.net — Guide de la plateforme

badgi est une plateforme tunisienne de gestion d'événements (congrès, journées
scientifiques, formations, rencontres professionnelles). Les participants
découvrent des événements et s'y inscrivent ; les organisateurs créent et gèrent
leurs événements au sein d'une organisation.

Langues de l'interface : français (par défaut), anglais, arabe, espagnol.
Sélecteur de langue : icône de traduction dans la barre de navigation.
Fuseau horaire : Africa/Tunis.

## Compte et connexion
- Créer un compte : /sign-up. Se connecter : /sign-in.
- L'authentification est gérée par Clerk (email + mot de passe et/ou boutons
  sociaux affichés sur la page de connexion). La liste exacte des méthodes
  disponibles est celle visible sur /sign-in.
- Un espace dans le nom d'utilisateur est remplacé automatiquement par "_".
- Pages accessibles sans compte : accueil, pages d'événements, /about,
  /features, /pricing, /blog, /contact, /help, /support, /documentation,
  pages d'organisations, formulaires publics, certificats publics.
- Pages qui exigent une connexion : /profile, /events/create, /orders,
  /organisations (mes organisations), /ai-tools, modification / badges / scan
  d'un événement, /cockpit.
- Compte suspendu : l'utilisateur est redirigé vers /banned et peut faire
  appel par email à support@badgi.net.

## Mon profil (/profile)
Tableau de bord personnel avec un menu latéral :
- Vue d'ensemble : statistiques (inscriptions, événements, organisations) et
  actions rapides (créer un événement, nouvelle organisation, voir mes
  inscriptions).
- Paramètres du profil : prénom, nom, fonction/spécialité, pays, ville,
  village. L'email, la photo et le nom d'utilisateur ne se modifient pas ici
  (ils proviennent du compte Clerk).
- Mes inscriptions : mes billets. Sur chaque carte, un menu propose
  "Obtenir l'accès" (billet avec QR code), "Obtenir le certificat" et
  "Déposer un travail".
- Événements organisés, Organisations, Formulaires personnalisés, Sponsors,
  Champs personnalisés, Certificats.

## Rôles
- Participant : tout utilisateur (connecté ou invité) qui s'inscrit à un
  événement.
- Organisateur : créateur d'un événement, ou créateur/administrateur de
  l'organisation qui porte l'événement. Il n'y a pas de "demande" pour
  devenir organisateur : il suffit de créer une organisation.
- Administrateur de la plateforme : rôle attribué par badgi ; il accède au
  cockpit (/cockpit).

## Organisations
- Une organisation est OBLIGATOIRE pour publier un événement.
- Créer : /organisations/create (nom, description, logo, image de couverture,
  site web, réseaux sociaux, bannière, partenaires).
- Mes organisations : /organisations. Page publique : /organisations/<slug>.
  Paramètres : /organisations/<slug>/settings (créateur ou admin).
- Membres : seul le créateur peut ajouter ou retirer des administrateurs
  (recherche par email ou nom d'utilisateur). Seul le créateur peut supprimer
  l'organisation.
- Vérification : une organisation doit être VÉRIFIÉE par un administrateur
  badgi avant de pouvoir créer des événements. Si la création d'événement
  échoue avec le message "This organisation must be verified by an admin",
  il faut attendre la vérification ou contacter support@badgi.net.
- Sous-domaine : une organisation peut avoir une page dédiée sur
  <sous-domaine>.badgi.net (événement à venir avec compte à rebours,
  bannière, liste des événements, partenaires).

## Créer un événement (/events/create)
- Prérequis : être connecté et appartenir à une organisation vérifiée. Sans
  organisation, la page propose "Créer une organisation d'abord".
- Formulaire unique (une seule page) avec les sections :
  1. Informations : organisation, pays, titre, catégorie, description (texte
     riche), lieu (recherche sur carte) ou "En ligne", ville, dates et heures
     de début et de fin.
  2. Tarification : prix de base, nombre de places, plans tarifaires (avec
     options, packs, plans masqués ou groupés), billet gratuit, note sur les
     frais d'inscription.
  3. Moyens de paiement proposés : carte en ligne (Stripe), paiement à
     l'accueil, virement bancaire (capture d'écran ou identifiant de
     virement), option "virement réservé aux résidents en Tunisie".
  4. Réductions : déclenchées par la valeur d'un champ d'inscription,
     en pourcentage ou montant fixe, avec justificatif éventuel.
  5. Autres détails : URL externe, image ou vidéo.
  6. Paramètres d'inscription : informations requises, champs de base,
     champs personnalisés (texte, liste, radio, conditionnels).
  7. Contenu de la page : programme (titre, texte, image), CV des auteurs.
  8. Options : inscription des invités sans compte (activée par défaut).
  9. Soumission de travaux : activation, nombre max, dates limites résumés et
     posters, co-auteurs, formats acceptés, sections et limites de mots.
  10. Sponsors.
- L'événement est en ligne dès sa création (pas d'étape de validation).
- Contrôles de l'organisateur sur la carte d'un événement : Modifier
  (/events/<id>/update), Supprimer, Détails des inscriptions
  (/orders?eventId=<id>), Formulaires, Héberger un contributeur, Promouvoir.

## Page d'un événement (/events/<slug>)
- Onglets : Détails, Programme, CV des auteurs, Date, Lieu, Inscription,
  Avis (commentaires).
- Boutons : "Je participe", J'aime, Partager (copier le lien, Facebook,
  Instagram, X, WhatsApp). Mention "Événement passé" quand il est terminé.
- Accueil (/) : liste des événements avec filtres pays, recherche, date,
  catégorie.
- Signaler un événement : menu de la carte, motifs = contenu dangereux,
  haineux, sexuel, spam/trompeur, violent. Les signalements sont traités par
  les administrateurs badgi.

## S'inscrire à un événement
- Depuis l'onglet Inscription de la page de l'événement.
- Les invités peuvent s'inscrire sans compte si l'organisateur l'a permis ;
  sinon, redirection vers la connexion.
- Une seule inscription par email et par événement.
- Après la fin de l'événement, les inscriptions sont fermées.
- Modes :
  - Gratuit : inscription immédiate.
  - Carte : paiement sécurisé Stripe, puis retour sur la page de l'événement.
  - Paiement à l'accueil : inscription confirmée, règlement sur place.
  - Virement : déposer une capture (image, 5 Mo max) ou un identifiant de
    virement ; statut "en attente de vérification" jusqu'à validation par
    l'organisateur (email envoyé dans les deux cas).
- Certaines options ou réductions avec justificatif passent par une
  validation de l'organisateur ("en attente de validation").
- Un email de confirmation est envoyé avec les plans choisis et le statut.
- Le billet (QR code) est disponible dans /profile → Mes inscriptions →
  "Obtenir l'accès".

## Gérer les inscriptions (organisateur) — /orders?eventId=<id>
- Réservé à l'organisateur de l'événement ou à un administrateur badgi.
- Statistiques : inscriptions, certifications, travaux, courbe dans le temps.
- Onglets : Inscriptions, Certifications, Travaux, Virements (si paiement
  activé).
- Inscriptions : rechercher, voir le détail, modifier, supprimer, ajouter un
  participant manuellement, importer depuis Excel (.xlsx/.xls), rapport,
  accès scan, gestion des badges, export CSV / XLSX / Word / PDF.
- Virements : approuver ou rejeter chaque preuve de virement.

## Contrôle d'accès sur site — /events/<id>/scan
- Scan du QR code du billet avec la caméra ou depuis une image.
- Points de scan configurables (par défaut "Entrée principale").
- Chaque scan enregistre la présence (commande, point, heure, agent).

## Badges — /events/<id>/badge
- Trois onglets : Design, Participants, Impression.
- Participants : recherche, filtre par catégorie (participant, intervenant,
  sponsor, staff), sélection, impression, marquer comme imprimé, export des
  badges imprimés.
- Impression A4, un badge par page, recto ou recto-verso ; option pour
  compter l'impression comme une entrée.

## Certificats
- L'organisateur crée les modèles dans /orders → Certifications →
  "Types & designs" : éditeur A4 (fond, paysage/portrait, textes, images,
  formes, QR de vérification) avec variables {name}, {event_title},
  {event_date}, {certificate_type}, {issue_date}.
- "Attribuer & envoyer" : émission aux destinataires puis envoi par email
  (file d'attente, envoi progressif).
- "Demandes" : traitement des demandes de certificat des participants.
- Le participant retrouve ses certificats approuvés dans /profile →
  Certificats, ou via "Obtenir le certificat" sur son inscription.
- Page publique de vérification : /certificates/<id> (le QR code y renvoie),
  avec téléchargement PDF A4 et impression.

## Travaux scientifiques (résumés et e-posters)
- Dépôt : /events/<id>/submit-work (accessible aux invités avec leur email).
- Le participant rédige un ou plusieurs résumés (titre, auteurs, co-auteurs,
  sections avec limite de mots) et peut joindre des fichiers.
- Statuts : brouillon → soumis → approuvé ou rejeté (avec motif).
- Le dépôt de l'e-poster final n'est possible qu'après approbation, dans les
  formats fixés par l'organisateur (par défaut jpg, png, webp).
- Dates limites distinctes pour les résumés et les posters. Modifier un
  résumé approuvé le remet en attente.
- Côté organisateur (/orders → Travaux) : approuver, rejeter, écrire aux
  auteurs, exporter CSV / XLSX / Word / PDF, exporter les e-posters en ZIP
  (JPEG, PDF ou PPTX).

## Formulaires personnalisés
- Créés dans /profile → Formulaires personnalisés.
- Types de champs : texte, nombre, email, liste, radio, case à cocher, zone
  de texte, date, téléphone.
- Formulaire public : /forms/<slug>. Une réponse par email ; email de
  confirmation envoyé.
- L'organisateur peut inviter par email, consulter les réponses, générer un
  rapport et imprimer des badges (/forms/<slug>/badge).

## Invitations (administrateur)
- Depuis le cockpit : choix de l'événement, modèle d'email, import d'une
  liste (collée ou fichier .csv/.txt/.xlsx), historique, renvoi, test.
  Les envois sont étalés dans le temps.

## Cockpit (/cockpit, administrateurs badgi uniquement)
- Utilisateurs (suspendre / réactiver), Organisations (vérifier / retirer la
  vérification), Signalements, Catégories d'événements, Outils IA (accès par
  email), Invitations, diagnostic SMTP.

## Outils IA (/ai-tools)
- Page réservée aux utilisateurs autorisés par un administrateur. Elle liste
  des liens vers des outils externes (Gemini, Perplexity, ChatGPT, Claude,
  Xmind, CapCut, Canva, DeepL, Genspark, Mentimeter) avec dates d'activation
  et d'expiration.

## Offres (/pricing)
- La page présente trois formules : Starter (gratuit, jusqu'à 3 événements),
  Professional (29 $/mois ou 290 $/an) et Enterprise (99 $/mois ou
  990 $/an). Pour toute souscription ou devis, écrire à contact@badgi.net.

## Aide et contact
- Centre d'aide : /help (Premiers pas, Événements, Paiements, Compte,
  Sécurité, Support technique). Documentation : /documentation.
- Contact : contact@badgi.net, téléphone +216 29 173 135, Tunis, Tunisie.
- Support : support@badgi.net. Urgences : emergency@badgi.net.
- Questions juridiques / confidentialité : legal@badgi.net,
  privacy@badgi.net. Pages : /terms, /privacy, /cookies, /gdpr.
`;
