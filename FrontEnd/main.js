// Ajoute un écouteur d'événements pour exécuter le code une fois que le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Récupère le token d'authentification depuis le stockage local
    const authLink = document.getElementById('auth-link'); // Lien pour se connecter ou se déconnecter
    const modifySection = document.querySelector('.modify'); // Section pour les modifications (visible uniquement pour les utilisateurs connectés)
    const blackBanner = document.querySelector('.black-banner'); // Bannière noire (visible uniquement pour les utilisateurs connectés)
    const gallery = document.querySelector('.gallery'); // Section où les projets sont affichés
    const categoryButtonsContainer = document.getElementById('category-buttons'); // Conteneur pour les boutons de filtrage des catégories

    let projects = []; // Tableau pour stocker les projets
    let categories = new Set(); // Set pour stocker les catégories (garantit l'unicité)
    let categoriesLoaded = false; // Indicateur pour savoir si les catégories ont déjà été chargées

    // Vérifie si l'utilisateur est connecté et ajuste l'interface en conséquence
    if (token) {
        onLogin();
    } else {
        onLogout();
    }

    // Fonction exécutée lors de la connexion de l'utilisateur
    function onLogin() {
        authLink.textContent = 'logout'; // Change le texte du lien d'authentification pour "logout"
        authLink.href = '#'; // Modifie le lien pour qu'il ne pointe nulle part
        modifySection.style.display = 'flex'; // Affiche la section de modification
        modifySection.style.flexDirection = 'row'; // Arrange les éléments en ligne
        blackBanner.style.display = 'flex'; // Affiche la bannière noire
        authLink.addEventListener('click', handleLogout); // Ajoute un écouteur pour gérer la déconnexion
        loadPhotoModalHTML(); // Charge le HTML pour le modal de photos
        loadProjectsFromAPI(); // Charge les projets depuis l'API
        loadCategoriesFromAPI(); // Charge les catégories depuis l'API
        hideCategoryButtons(); // Cache les boutons de catégories
    }

    // Fonction exécutée lors de la déconnexion de l'utilisateur
    function onLogout() {
        authLink.textContent = 'login'; // Change le texte du lien d'authentification pour "login"
        authLink.href = 'login.html'; // Modifie le lien pour qu'il pointe vers la page de connexion
        modifySection.style.display = 'none'; // Cache la section de modification
        blackBanner.style.display = 'none'; // Cache la bannière noire
        authLink.removeEventListener('click', handleLogout); // Retire l'écouteur d'événements pour la déconnexion
        showCategoryButtons(); // Affiche les boutons de catégories
        loadProjectsFromAPI(); // Recharge les projets depuis l'API
        if (!categoriesLoaded) {
            loadCategoriesFromAPI(); // Charge les catégories si elles ne sont pas encore chargées
        }
    }

    // Fonction pour gérer la déconnexion de l'utilisateur
    function handleLogout(event) {
        event.preventDefault();
        localStorage.removeItem('token'); // Supprime le token d'authentification du stockage local
        onLogout(); // Exécute la fonction de déconnexion
    }

    // Fonction pour charger les projets depuis l'API
    function loadProjectsFromAPI() {
        fetch('http://localhost:5678/api/works', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {} // Ajoute le header d'authentification si l'utilisateur est connecté
        })
        .then(response => response.json())
        .then(data => {
            projects = data; // Stocke les projets dans la variable `projects`
            displayProjects(projects); // Affiche les projets dans la galerie
            displayPhotosInModal(projects); // Affiche les projets dans le modal de gestion des photos
        })
        .catch(error => console.error('Erreur lors de la récupération des projets :', error)); // Affiche une erreur en cas de problème
    }

    // Fonction pour charger les catégories depuis l'API
    function loadCategoriesFromAPI() {
        fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(data => {
            data.forEach(category => categories.add(category)); // Ajoute chaque catégorie dans le Set
            createCategoryButtons([...categories]); // Crée les boutons de filtrage pour les catégories
            populateCategorySelect([...categories]); // Remplit le select des catégories dans le formulaire
            categoriesLoaded = true; // Marque les catégories comme chargées
        })
        .catch(error => console.error('Erreur lors de la récupération des catégories :', error)); // Affiche une erreur en cas de problème
    }

    // Fonction pour afficher les projets dans la galerie
    function displayProjects(projects) {
        gallery.innerHTML = ''; // Vide la galerie
        projects.forEach(project => {
            const projectElement = createProjectElement(project); // Crée un élément pour chaque projet
            gallery.appendChild(projectElement); // Ajoute l'élément à la galerie
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
        if (listGallery) {
            listGallery.innerHTML = ''; // Vide la liste des photos dans le modal
            projects.forEach(project => {
                const photoElement = createPhotoElement(project); // Crée un élément pour chaque photo
                listGallery.appendChild(photoElement); // Ajoute l'élément à la liste dans le modal
            });
        }
    }

    // Fonction pour créer un élément de photo dans le modal
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
        btnDelete.addEventListener('click', () => deletePhoto(project.id)); // Ajoute un écouteur pour supprimer la photo
        photoContainer.appendChild(btnDelete);

        return photoContainer;
    }

    // Fonction pour créer les boutons de filtrage des catégories
    function createCategoryButtons(categories) {
        categoryButtonsContainer.innerHTML = ''; // Vide le conteneur des boutons de catégories
        const allButton = document.createElement('button');
        allButton.type = 'button';
        allButton.className = 'btn-filter active';
        allButton.textContent = 'Tous';
        allButton.addEventListener('click', () => filterProjectsByCategory(null)); // Filtre les projets par toutes les catégories
        categoryButtonsContainer.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-filter';
            button.textContent = category.name;
            button.dataset.id = category.id;
            button.addEventListener('click', () => filterProjectsByCategory(category.id)); // Filtre les projets par catégorie spécifique
            categoryButtonsContainer.appendChild(button);
        });
    }

    // Fonction pour filtrer les projets par catégorie
    function filterProjectsByCategory(categoryId) {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(button => button.classList.remove('active')); // Retire la classe active de tous les boutons

        const activeButton = categoryId === null ? buttons[0] : Array.from(buttons).find(button => button.dataset.id == categoryId);
        if (activeButton) activeButton.classList.add('active'); // Ajoute la classe active au bouton correspondant

        const filteredProjects = categoryId === null ? projects : projects.filter(project => project.categoryId == categoryId);

        displayProjects(filteredProjects); // Affiche les projets filtrés
    }

    // Fonction pour supprimer un projet et l'image associée
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
                console.log('Projet et image supprimés avec succès');

                // Supprime l'élément du DOM
                const projectElement = document.getElementById(`project-${photoId}`);
                if (projectElement) {
                    projectElement.remove();
                }

                const photoElement = document.getElementById(`photo-${photoId}`);
                if (photoElement) {
                    photoElement.remove();
                }

                // Met à jour la liste des projets
                projects = projects.filter(project => project.id !== photoId);

                const newImageInput = document.getElementById('photoInput');
                if (newImageInput) {
                    newImageInput.value = ''; // Réinitialise la valeur de l'input
                }

                alert('Projet et image supprimés avec succès');
            } else {
                const errorData = await response.json();
                console.error('Erreur lors de la suppression de la photo :', errorData.message);
                alert(`Erreur : ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo :', error);
            alert(`Erreur lors de la suppression : ${error.message}`);
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
        if (listGallery) {
            const photoElement = createPhotoElement(project);
            listGallery.appendChild(photoElement);
        }
    }

    // Fonction pour réinitialiser le modal après ajout d'une photo
    function resetModal() {
        const showModal = document.getElementById('photoModal');
        const showPhoto = document.getElementById('addPhotoView');
        const galleryView = document.getElementById('galleryView');

        if (showPhoto && galleryView && showModal) {
            showPhoto.style.display = 'none';
            galleryView.style.display = 'block';
            showModal.style.display = 'none';
        }

        const form = document.getElementById('postPhoto');
        if (form) {
            form.reset(); // Réinitialise tous les champs du formulaire
        }

        // Réinitialisation de l'état du bouton d'ajout de photo
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        if (uploadPlaceholder) {
            uploadPlaceholder.innerHTML = `
                <div id="photoPreview" class="photo-preview" style="display: none;">
                    <img id="photoPreviewImg" src="" alt="Prévisualisation" style="max-width: 100%; max-height: 200px; display: block; margin: auto;" />
                </div>
                <button type="button" id="getPhoto" class="upload-button">
                    <i class="fa-regular fa-image"></i>
                    <h2 class="upload-text">+ Ajouter photo</h2>
                    <input type="file" id="photoInput" accept="image/jpeg, image/png" style="display: none;" />
                    <small class="typePhoto">jpg, png : 4mo max</small>
                </button>
            `;
        }
    }

    // Fonction pour remplir le select des catégories dans le formulaire d'ajout de photo
    function populateCategorySelect(categories) {
        const categorySelect = document.getElementById('pet-select');
        if (categorySelect) {
            categorySelect.innerHTML = ''; // Vide le select
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option); // Ajoute chaque option de catégorie
            });
        }
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

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        addEventListenersToModal(); // Ajoute les écouteurs d'événements pour le modal
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

        // Ouvre le modal
        document.querySelector('.open-modal').addEventListener('click', (event) => {
            event.preventDefault();
            if (showModal) showModal.style.display = "flex";
        });

        // Passe à la vue d'ajout de photo dans le modal
        btnPhoto.addEventListener('click', () => {
            if (showPhoto && galleryView) {
                galleryView.style.display = 'none';
                showPhoto.style.display = "block";
            }
        });

        // Ferme le modal depuis la vue galerie
        closeShow.addEventListener('click', () => {
            if (showModal && showPhoto && galleryView) {
                showModal.style.display = "none";
                galleryView.style.display = 'block';
                showPhoto.style.display = "none";
            }
        });

        // Ferme le modal depuis la vue ajout de photo
        closeShow2.addEventListener('click', () => {
            if (showModal && showPhoto && galleryView) {
                showPhoto.style.display = "none";
                showModal.style.display = "none";
                galleryView.style.display = 'block';
            }
        });

        // Ferme le modal en cliquant à l'extérieur
        window.addEventListener('click', event => {
            if (event.target === showModal) {
                if (showModal && showPhoto && galleryView) {
                    showModal.style.display = "none";
                    galleryView.style.display = 'block';
                    showPhoto.style.display = "none";
                }
            }
        });

        // Retour à la galerie depuis la vue d'ajout de photo
        backToGallery.addEventListener('click', () => {
            if (showPhoto && galleryView) {
                showPhoto.style.display = 'none';
                galleryView.style.display = 'block';
            }
        });

        // Déclenche le choix de fichier lors du clic sur le bouton d'ajout de photo
        document.getElementById('getPhoto').addEventListener('click', () => {
            imageInput.click();
        });

        // Affiche la prévisualisation de l'image sélectionnée
        imageInput.addEventListener('change', function () {
            const file = this.files[0];

            // Vérification de la taille du fichier
            if (file && file.size > 4 * 1024 * 1024) { // 4 Mo en octets
                alert("La taille de l'image ne doit pas dépasser 4 Mo.");
                this.value = ''; // Réinitialise l'input file
                return;
            }

            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (photoPreviewImg && uploadButtonIcon && uploadText && typePhotoText) {
                        photoPreviewImg.src = e.target.result;
                        photoPreview.style.display = 'block';
                        uploadButtonIcon.style.display = 'none';
                        uploadText.style.display = 'none';
                        typePhotoText.style.display = 'none';

                        uploadPlaceholder.innerHTML = `<img src="${e.target.result}" alt="Prévisualisation" style="width: 40%; height: 200px; display: block; margin: auto; object-fit: cover" />`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        // Soumet le formulaire d'ajout de photo
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

                    addProjectToGallery(newProject);
                    addPhotoToModal(newProject);

                    resetModal();
                    alert('Ajout d\'un nouveau projet réussi');
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
        if (categoryButtonsContainer) {
            categoryButtonsContainer.style.display = 'none';
        }
    }

    // Fonction pour afficher les boutons de catégories
    function showCategoryButtons() {
        if (categoryButtonsContainer) {
            categoryButtonsContainer.style.display = 'flex';
        }
    }
});
