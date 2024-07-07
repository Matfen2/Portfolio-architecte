document.getElementById('logForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Empêcher l'envoi du formulaire par défaut

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validation côté client (vous pouvez ajouter plus de validations selon vos besoins)
  if (email === '' || password === '') {
    alert('Veuillez remplir tous les champs.');
    return;
  }

  // Exemple de requête AJAX vers le serveur pour vérifier l'authentification
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Email ou mot de passe incorrect.');
    }
    return response.json();
  })
  .then(data => {
    if (data.success && data.token) {
      // Stockage du token dans localStorage
      localStorage.setItem('token', data.token);

      // Redirection vers la page d'administration ou autre page appropriée
      window.location.href = 'admin.html';
    } else {
      throw new Error('Vous n\'avez pas les droits d\'administrateur.');
    }
  })
  .catch(error => {
    alert(error.message);
  });
});
