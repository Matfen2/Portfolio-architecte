document.getElementById('logForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Empêche l'envoi du formulaire par défaut

  const email = document.getElementById('adress').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMessage = document.getElementById('error-message');
  const connect = document.getElementById('connect');

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
      alert('Connexion réussie');
      connect.textContent = "logout";
    } else {
      throw new Error('Token non reçu.');
    }
  })
  .catch(error => {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Email ou mot de passe incorrect.';
  });
});
