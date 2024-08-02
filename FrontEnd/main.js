// Ajoute un écouteur d'événements pour exécuter le code une fois que le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Récupère le token de l'utilisateur depuis le stockage local
    const token = localStorage.getItem('token');
    // Récupère les éléments HTML nécessaires
    const authLink = document.getElementById('auth-link');
    const modifySection = document.querySelector('.modify');
    const blackBanner = document.querySelector('.black-banner');
    const gallery = document.querySelector('.gallery');
    const categoryButtonsContainer = document.getElementById('category-buttons');

    let projects = [];
    let categories = new Set(); // Utilisation d'un Set pour garantir l'unicité des catégories
    let categoriesLoaded = false; // Variable pour suivre si les boutons de catégories ont été créés

    // Vérifie si l'utilisateur est connecté et exécute les fonctions appropriées
    if (token) {
        onLogin();
    } else {
        onLogout();
    }

    // Fonction à exécuter lors de la connexion de l'utilisateur
    function onLogin() {
        authLink.textContent = 'logout'; // Change le texte du lien d'authentification
        authLink.href = '#'; // Modifie le lien pour pointer vers rien
        modifySection.style.display = 'flex'; // Affiche la section de modification
        modifySection.style.flexDirection = 'row';
        blackBanner.style.display = 'flex'; // Affiche la bannière noire
        authLink.addEventListener('click', handleLogout); // Ajoute un écouteur d'événements pour gérer la déconnexion
        loadPhotoModalHTML(); // Charge le HTML du modal de photos
        loadProjectsFromAPI(); // Charge les projets depuis l'API
        loadCategoriesFromAPI(); // Charge les catégories depuis l'API
        hideCategoryButtons(); // Cache les boutons de catégories
    }

    // Fonction à exécuter lors de la déconnexion de l'utilisateur
    function onLogout() {
        authLink.textContent = 'login'; // Change le texte du lien d'authentification
        authLink.href = 'login.html'; // Modifie le lien pour pointer vers la page de connexion
        modifySection.style.display = 'none'; // Cache la section de modification
        blackBanner.style.display = 'none'; // Cache la bannière noire
        authLink.removeEventListener('click', handleLogout); // Retire l'écouteur d'événements pour la déconnexion
        showCategoryButtons(); // Affiche les boutons de catégories
        loadProjectsFromAPI(); // Charge les projets depuis l'API
        if (!categoriesLoaded) {
            loadCategoriesFromAPI(); // Charge les catégories si elles ne sont pas encore chargées
        }
    }

    // Fonction pour gérer la déconnexion
    function handleLogout(event) {
        event.preventDefault();
        localStorage.removeItem('token'); // Supprime le token du stockage local
        onLogout(); // Appelle la fonction de déconnexion
    }

    // Fonction pour charger les projets depuis l'API
    function loadProjectsFromAPI() {
        fetch('http://localhost:5678/api/works', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        .then(response => response.json())
        .then(data => {
            projects = data; // Stocke les projets dans la variable projects
            displayProjects(projects); // Affiche les projets dans la galerie
            displayPhotosInModal(projects); // Affiche les photos dans le modal
        })
        .catch(error => console.error('Erreur lors de la récupération des projets :', error));
    }

    // Fonction pour charger les catégories depuis l'API
    function loadCategoriesFromAPI() {
        fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(data => {
            data.forEach(category => categories.add(category)); // Ajout des catégories dans le Set
            createCategoryButtons([...categories]); // Conversion du Set en tableau pour créer les boutons
            populateCategorySelect([...categories]); // Conversion du Set en tableau pour le select
            categoriesLoaded = true; // Marque les catégories comme chargées
        })
        .catch(error => console.error('Erreur lors de la récupération des catégories :', error));
    }

    // Fonction pour afficher les projets dans la galerie
    function displayProjects(projects) {
        gallery.innerHTML = ''; // Vide la galerie
        projects.forEach(project => {
            const projectElement = createProjectElement(project);
            gallery.appendChild(projectElement); // Ajoute chaque projet à la galerie
        });
    }

    // Fonction pour créer un élément de projet
    function createProjectElement(project) {
        const figure = document.createElement('figure');
        figure.setAttribute('id', `project-${project.id}`);

        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        img.classList.add('gallery-image');
        figure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = project.title;
        figure.appendChild(figcaption);

        return figure;
    }

    // Fonction pour afficher les photos dans le modal
    function displayPhotosInModal(projects) {
        const listGallery = document.getElementById('listGallery');
        listGallery.innerHTML = ''; // Vide la liste de la galerie
        projects.forEach(project => {
            const photoElement = createPhotoElement(project);
            listGallery.appendChild(photoElement); // Ajoute chaque photo à la liste
        });
    }

    // Fonction pour créer un élément de photo
    function createPhotoElement(project) {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container';
        photoContainer.setAttribute('id', `photo-${project.id}`);

        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        img.className = 'photoArchitecture';
        photoContainer.appendChild(img);

        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'btn-delete';
        btnDelete.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        btnDelete.addEventListener('click', () => deletePhoto(project.id)); // Ajoute un écouteur d'événements pour supprimer la photo
        photoContainer.appendChild(btnDelete);

        return photoContainer;
    }

    // Fonction pour créer les boutons de catégories
    function createCategoryButtons(categories) {
        categoryButtonsContainer.innerHTML = ''; // Vide le conteneur des boutons
        const allButton = document.createElement('button');
        allButton.type = 'button';
        allButton.className = 'btn-filter active';
        allButton.textContent = 'Tous';
        allButton.addEventListener('click', () => filterProjectsByCategory(null)); // Ajoute un écouteur d'événements pour filtrer par toutes les catégories
        categoryButtonsContainer.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-filter';
            button.textContent = category.name;
            button.dataset.id = category.id;
            button.addEventListener('click', () => filterProjectsByCategory(category.id)); // Ajoute un écouteur d'événements pour filtrer par catégorie
            categoryButtonsContainer.appendChild(button);
        });
    }

    // Fonction pour filtrer les projets par catégorie
    function filterProjectsByCategory(categoryId) {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(button => button.classList.remove('active')); // Supprime la classe active de tous les boutons

        const activeButton = categoryId === null ? buttons[0] : Array.from(buttons).find(button => button.dataset.id == categoryId);
        if (activeButton) activeButton.classList.add('active'); // Ajoute la classe active au bouton correspondant

        const filteredProjects = categoryId === null ? projects : projects.filter(project => project.categoryId == categoryId);

        displayProjects(filteredProjects); // Affiche les projets filtrés
    }

    // Fonction asynchrone pour supprimer une photo
    async function deletePhoto(photoId) {
        try {
            const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Supprimer l'élément du DOM
                const projectElement = document.getElementById(`project-${photoId}`);
                if (projectElement) {
                    projectElement.remove();
                }

                const photoElement = document.getElementById(`photo-${photoId}`);
                if (photoElement) {
                    photoElement.remove();
                }

                // Supprimer l'élément de la liste des projets
                projects = projects.filter(project => project.id !== photoId);
            } else {
                console.error('Erreur lors de la suppression de la photo :', response.status);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo :', error);
        }
    }

    // Fonction pour ajouter un projet à la galerie
    function addProjectToGallery(project) {
        const projectElement = createProjectElement(project);
        gallery.appendChild(projectElement);
    }

    // Fonction pour ajouter une photo au modal
    function addPhotoToModal(project) {
        const listGallery = document.getElementById('listGallery');
        const photoElement = createPhotoElement(project);
        listGallery.appendChild(photoElement);
    }

    // Fonction pour réinitialiser le modal
    function resetModal() {
        const showModal = document.getElementById('photoModal');
        const showPhoto = document.getElementById('addPhotoView');
        const galleryView = document.getElementById('galleryView');

        showPhoto.style.display = 'none';
        galleryView.style.display = 'block';
        showModal.style.display = 'none';
    }

    // Fonction pour remplir le select des catégories
    function populateCategorySelect(categories) {
        const categorySelect = document.getElementById('pet-select');
        categorySelect.innerHTML = ''; // Vide le select des catégories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    // Fonction pour charger le HTML du modal de photos
    function loadPhotoModalHTML() {
        const modalHTML = `
            <aside class="modal" id="photoModal" aria-hidden="true" style="display: none;">
                <div class="modal-content">
                    <div id="galleryView" class="modal-view active">
                        <button type="button" id="btnCloseModal" class="close-modal" aria-label="Close">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <div class="modal-body" id="contentGallery">
                            <h2 class="gallery-title">Galerie photo</h2>
                            <div class="gallery-content">
                                <div class="row" id="listGallery">
                                </div>
                            </div>
                        </div>
                        <hr class="rowAdd">
                        <button type="button" id="btnAddPhotoView" class="btn btn-primary">Ajouter une photo</button>
                    </div>
                    <div id="addPhotoView" class="modal-view" style="display: none;">
                        <div class="listBtnModal">
                            <button type="button" id="btnBackToGallery" class="back-modal" aria-label="Back">
                                <i class="fa-solid fa-arrow-left"></i>
                            </button>
                            <button type="button" id="btnCloseModal2" class="close-modal" aria-label="Close">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div class="modal-body" id="contentAdd">
                            <h2 class="gallery-title">Ajout photo</h2>
                            <div class="upload-placeholder" id="uploadPlaceholder">
                                <div id="photoPreview" class="photo-preview" style="display: none;">
                                    <img id="photoPreviewImg" src="" alt="Prévisualisation" style="max-width: 100%; max-height: 200px; display: block; margin: auto;" />
                                </div>
                                <button type="button" id="getPhoto" class="upload-button">
                                    <i class="fa-regular fa-image"></i>
                                    <h2 class="upload-text">+ Ajouter photo</h2>
                                    <input type="file" id="photoInput" accept="image/jpeg, image/png" style="display: none;" />
                                    <small class="typePhoto">jpg, png : 4mo max</small>
                                </button>
                            </div>
                            <form id="postPhoto" class="add-photo-form">
                                <div class="photoTitle">
                                    <label for="title">Titre</label>
                                    <input type="text" name="title" id="title" required />
                                </div>
                                <div class="photoCategory">
                                    <label for="category">Catégorie</label>
                                    <select name="category" id="pet-select" required>
                                    </select>
                                </div>
                                <hr class="rowValid">
                                <button type="submit" id="btnValidPhoto" class="btn btn-primary">Valider</button>
                            </form>
                        </div>
                    </div>
                </div>
            </aside>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML); // Insère le HTML du modal à la fin du body
        addEventListenersToModal(); // Ajoute les écouteurs d'événements au modal
    }

    // Fonction pour ajouter des écouteurs d'événements au modal
    function addEventListenersToModal() {
        const showModal = document.getElementById('photoModal');
        const showPhoto = document.getElementById('addPhotoView');
        const btnPhoto = document.getElementById('btnAddPhotoView');
        const closeShow = document.getElementById('btnCloseModal');
        const closeShow2 = document.getElementById('btnCloseModal2');
        const backToGallery = document.getElementById('btnBackToGallery');
        const postPhotoForm = document.getElementById('postPhoto');
        const imageInput = document.getElementById('photoInput');
        const photoPreview = document.getElementById('photoPreview');
        const photoPreviewImg = document.getElementById('photoPreviewImg');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadButtonIcon = document.querySelector('.upload-button i');
        const uploadText = document.querySelector('.upload-text');
        const typePhotoText = document.querySelector('.typePhoto');

        // Écouteur d'événements pour ouvrir le modal
        document.querySelector('.open-modal').addEventListener('click', (event) => {
            event.preventDefault();
            showModal.style.display = "flex";
        });

        // Écouteur d'événements pour afficher la vue d'ajout de photo
        btnPhoto.addEventListener('click', () => {
            document.getElementById('galleryView').style.display = 'none';
            showPhoto.style.display = "block";
        });

        // Écouteur d'événements pour fermer le modal
        closeShow.addEventListener('click', () => {
            showModal.style.display = "none";
            document.getElementById('galleryView').style.display = 'block';
            showPhoto.style.display = "none";
        });

        // Écouteur d'événements pour fermer le modal depuis la vue d'ajout de photo
        closeShow2.addEventListener('click', () => {
            showPhoto.style.display = "none";
            showModal.style.display = "none";
            document.getElementById('galleryView').style.display = 'block';
        });

        // Écouteur d'événements pour fermer le modal en cliquant à l'extérieur
        window.addEventListener('click', event => {
            if (event.target === showModal) {
                showModal.style.display = "none";
                document.getElementById('galleryView').style.display = 'block';
                showPhoto.style.display = "none";
            }
        });

        // Écouteur d'événements pour revenir à la galerie depuis la vue d'ajout de photo
        backToGallery.addEventListener('click', () => {
            showPhoto.style.display = 'none';
            document.getElementById('galleryView').style.display = 'block';
        });

        // Écouteur d'événements pour déclencher l'input de fichier en cliquant sur le bouton de téléchargement
        document.getElementById('getPhoto').addEventListener('click', () => {
            imageInput.click();
        });

        // Écouteur d'événements pour afficher la prévisualisation de l'image sélectionnée
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    photoPreviewImg.src = e.target.result;
                    photoPreview.style.display = 'block';
                    uploadButtonIcon.style.display = 'none';
                    uploadText.style.display = 'none';
                    typePhotoText.style.display = 'none';

                    uploadPlaceholder.innerHTML = `<img src="${e.target.result}" alt="Prévisualisation" style="max-width: 100%; max-height: 200px; display: block; margin: auto;" />`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Écouteur d'événements pour soumettre le formulaire d'ajout de photo
        postPhotoForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const title = document.getElementById('title').value.trim();
            const category = document.getElementById('pet-select').value;
            const file = imageInput.files[0];

            if (!file) {
                alert("Veuillez sélectionner une image.");
                return;
            }

            const formData = new FormData();
            formData.append("image", file);
            formData.append("title", title);
            formData.append("category", category);

            try {
                const response = await fetch('http://localhost:5678/api/works', {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const newProject = await response.json();
                    projects.push(newProject);

                    addProjectToGallery(newProject); // Ajoute le nouveau projet à la galerie
                    addPhotoToModal(newProject); // Ajoute la nouvelle photo au modal

                    resetModal(); // Réinitialise le modal
                    postPhotoForm.reset(); // Réinitialise le formulaire

                    alert("Ajout d'un nouveau projet réussi");
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Une erreur est survenue lors de l'ajout de la photo.");
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi de la requête :", error);
                alert("Une erreur est survenue lors de l'envoi de la photo.");
            }
        });
    }

    // Fonction pour cacher les boutons de catégories
    function hideCategoryButtons() {
        categoryButtonsContainer.style.display = 'none';
    }

    // Fonction pour afficher les boutons de catégories
    function showCategoryButtons() {
        categoryButtonsContainer.style.display = 'flex';
    }
});
