document.getElementById('logForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Empêche l'envoi du formulaire par défaut

  const email = document.getElementById('adress').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMessage = document.getElementById('error-message');

  // Validation côté client 
  if (email === '' || password === '') {
    alert('Veuillez remplir tous les champs.');
    return;
  }

  // Requête pour vérifier l'authentification
  fetch('http://localhost:5678/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => { throw new Error(error.message); });
    }
    return response.json();
  })
  .then(data => {
    if (data.token) {
      // Stockage du token dans localStorage
      localStorage.setItem('token', data.token);

      // Redirection vers la page d'accueil
      window.location.href = 'index.html';
    } else {
      throw new Error('Token non reçu.');
    }
  })
  .catch(error => {
    errorMessage.style.display = 'block';
    errorMessage.textContent = error.message;
  });
});

// Fonction pour obtenir le token d'authentification
function getToken() {
  return localStorage.getItem('token');
}

// Exemple de requête avec le token d'authentification
function envoyerTravail(travailData) {
  const token = getToken();
  fetch('http://localhost:5678/api/works', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(travailData),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi du travail.');
    }
    return response.json();
  })
  .then(data => {
    console.log('Travail envoyé avec succès:', data);
  })
  .catch(error => {
    console.error('Erreur:', error);
  });
}

// Exemple de requête pour supprimer un travail avec le token d'authentification
function supprimerTravail(travailId) {
  const token = getToken();
  fetch(`http://localhost:5678/api/works/${travailId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token,
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du travail.');
    }
    console.log('Travail supprimé avec succès');
  })
  .catch(error => {
    console.error('Erreur:', error);
  });
}
