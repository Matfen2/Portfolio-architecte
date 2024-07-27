document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Récupération du token depuis le localStorage
    const apiURL = 'http://localhost:5678/api/works'; // URL de l'API pour les projets
    const apiCategoriesURL = 'http://localhost:5678/api/categories'; // URL de l'API pour les catégories

    const gallery = document.querySelector('.gallery'); // Sélection de l'élément de la galerie
    const categoryButtonsContainer = document.getElementById('category-buttons'); // Sélection du conteneur des boutons de catégorie
    const openModal = document.querySelector('.open-modal'); // Sélection du bouton pour ouvrir le modal

    let projects = [];
    let categories = [];

    if (token) {
        loadPhotoModalHTML(); // Charger le HTML du modal si un token est présent
    }

    // Fonction pour charger le HTML du modal
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
                                    <!-- Les projets seront ajoutés ici via JavaScript -->
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
                                        <!-- Options will be populated dynamically -->
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

        document.body.insertAdjacentHTML('beforeend', modalHTML); // Insertion du modal HTML dans le corps du document
        addEventListenersToModal(); // Ajouter les écouteurs d'événements au modal
    }

    // Fonction pour ajouter des écouteurs d'événements au modal
    function addEventListenersToModal() {
        const showModal = document.getElementById('photoModal'); // Sélection du modal
        const showPhoto = document.getElementById('addPhotoView'); // Sélection de la vue d'ajout de photo
        const btnPhoto = document.getElementById('btnAddPhotoView'); // Sélection du bouton pour ajouter une photo
        const closeShow = document.getElementById('btnCloseModal'); // Sélection du bouton pour fermer le modal
        const closeShow2 = document.getElementById('btnCloseModal2'); // Sélection du deuxième bouton pour fermer le modal
        const backToGallery = document.getElementById('btnBackToGallery'); // Sélection du bouton pour revenir à la galerie
        const postPhotoForm = document.getElementById('postPhoto'); // Sélection du formulaire d'ajout de photo
        const imageInput = document.getElementById('photoInput'); // Sélection de l'input de fichier
        const photoPreview = document.getElementById('photoPreview'); // Sélection de l'élément de prévisualisation de la photo
        const photoPreviewImg = document.getElementById('photoPreviewImg'); // Sélection de l'image de prévisualisation
        const uploadPlaceholder = document.getElementById('uploadPlaceholder'); // Sélection de l'élément de remplacement
        const uploadButtonIcon = document.querySelector('.upload-button i'); // Sélection de l'icône du bouton de téléchargement
        const uploadText = document.querySelector('.upload-text'); // Sélection du texte du bouton de téléchargement
        const typePhotoText = document.querySelector('.typePhoto'); // Sélection du texte de type de photo

        openModal.addEventListener('click', () => {
            showModal.style.display = "flex"; // Afficher le modal
        });

        btnPhoto.addEventListener('click', () => {
            document.getElementById('galleryView').style.display = 'none';
            showPhoto.style.display = "block"; // Afficher la vue d'ajout de photo
        });

        closeShow.addEventListener('click', () => {
            showModal.style.display = "none"; // Fermer le modal
            document.getElementById('galleryView').style.display = 'block';
            showPhoto.style.display = "none";
        });

        closeShow2.addEventListener('click', () => {
            showPhoto.style.display = "none"; // Fermer la vue d'ajout de photo
            showModal.style.display = "none";
            document.getElementById('galleryView').style.display = 'block';
        });

        window.addEventListener('click', event => {
            if (event.target === showModal) {
                showModal.style.display = "none"; // Fermer le modal si on clique en dehors
                document.getElementById('galleryView').style.display = 'block';
                showPhoto.style.display = "none";
            }
        });

        backToGallery.addEventListener('click', () => {
            showPhoto.style.display = 'none'; // Revenir à la galerie
            document.getElementById('galleryView').style.display = 'block';
        });

        document.getElementById('getPhoto').addEventListener('click', () => {
            imageInput.click(); // Simuler un clic sur l'input de fichier
        });

        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    photoPreviewImg.src = e.target.result;
                    photoPreview.style.display = 'block'; // Afficher la prévisualisation de l'image
                    uploadButtonIcon.style.display = 'none'; // Masquer l'icône du bouton de téléchargement
                    uploadText.style.display = 'none'; // Masquer le texte du bouton de téléchargement
                    typePhotoText.style.display = 'none'; // Masquer le texte de type de photo

                    // Afficher l'image dans .upload-placeholder
                    uploadPlaceholder.innerHTML = `<img src="${e.target.result}" alt="Prévisualisation" style="max-width: 100%; max-height: 200px; display: block; margin: auto;" />`;
                };
                reader.readAsDataURL(file); // Lire le fichier comme une URL de données
            }
        });

        postPhotoForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Empêcher l'envoi par défaut du formulaire

            const title = document.getElementById('title').value.trim(); // Récupérer le titre
            const category = document.getElementById('pet-select').value; // Récupérer la catégorie
            const file = imageInput.files[0]; // Récupérer le fichier sélectionné

            if (!file) {
                alert("Veuillez sélectionner une image."); // Alerter si aucun fichier n'est sélectionné
                return;
            }

            const formData = new FormData();
            formData.append("image", file);
            formData.append("title", title);
            formData.append("category", category);

            try {
                const response = await fetch(apiURL, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const newProject = await response.json();
                    projects.push(newProject); // Ajouter le nouveau projet à la liste des projets
                    localStorage.setItem('projects', JSON.stringify(projects)); // Stocker les projets dans le localStorage

                    addProjectToGallery(newProject); // Ajouter le projet à la galerie
                    addPhotoToModal(newProject); // Ajouter la photo au modal

                    resetModal(); // Réinitialiser le modal
                    postPhotoForm.reset(); // Réinitialiser le formulaire

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

        populateCategorySelect(categories); // Remplir le sélecteur de catégories
    }

    function loadProjectsFromLocalStorage() {
        const storedProjects = localStorage.getItem('projects'); // Récupérer les projets du localStorage
        if (storedProjects) {
            projects = JSON.parse(storedProjects);
            displayProjects(projects); // Afficher les projets
            displayPhotosInModal(projects); // Afficher les photos dans le modal
        } else {
            fetchProjects(); // Récupérer les projets depuis l'API
        }
    }

    function loadCategoriesFromLocalStorage() {
        const storedCategories = localStorage.getItem('categories'); // Récupérer les catégories du localStorage
        if (storedCategories) {
            categories = JSON.parse(storedCategories);
            createCategoryButtons(categories); // Créer les boutons de catégorie
            if (token) {
                populateCategorySelect(categories); // Remplir le sélecteur de catégories
            }
        } else {
            fetchCategories(); // Récupérer les catégories depuis l'API
        }
    }

    loadProjectsFromLocalStorage(); // Charger les projets depuis le localStorage
    loadCategoriesFromLocalStorage(); // Charger les catégories depuis le localStorage

    async function fetchProjects() {
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            projects = data;
            localStorage.setItem('projects', JSON.stringify(projects)); // Stocker les projets dans le localStorage

            displayProjects(projects); // Afficher les projets
            displayPhotosInModal(projects); // Afficher les photos dans le modal
        } catch (error) {
            console.error('Erreur lors de la récupération des projets :', error);
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch(apiCategoriesURL);
            const data = await response.json();
            categories = data;
            localStorage.setItem('categories', JSON.stringify(categories)); // Stocker les catégories dans le localStorage

            createCategoryButtons(categories); // Créer les boutons de catégorie
            if (token) {
                populateCategorySelect(categories); // Remplir le sélecteur de catégories
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories :', error);
        }
    }

    function displayProjects(projects) {
        gallery.innerHTML = '';
        projects.forEach(project => {
            const projectElement = createProjectElement(project);
            gallery.appendChild(projectElement); // Ajouter chaque projet à la galerie
        });
    }

    function createProjectElement(project) {
        const figure = document.createElement('figure');
        figure.setAttribute('id', `project-${project.id}`);

        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        img.classList.add('gallery-image'); // Ajouter une classe pour uniformiser la hauteur des images
        figure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = project.title;
        figure.appendChild(figcaption);

        return figure;
    }

    function createCategoryButtons(categories) {
        categoryButtonsContainer.innerHTML = '';
        const allButton = document.createElement('button');
        allButton.type = 'button';
        allButton.className = 'btn-filter active';
        allButton.textContent = 'Tous';
        allButton.addEventListener('click', () => filterProjectsByCategory(null)); // Ajouter un écouteur d'événement pour filtrer les projets
        categoryButtonsContainer.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-filter';
            button.textContent = category.name;
            button.dataset.id = category.id;
            button.addEventListener('click', () => filterProjectsByCategory(category.id)); // Ajouter un écouteur d'événement pour filtrer les projets par catégorie
            categoryButtonsContainer.appendChild(button);
        });
    }

    function populateCategorySelect(categories) {
        const categorySelect = document.getElementById('pet-select');
        categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option); // Ajouter chaque catégorie au sélecteur de catégories
        });
    }

    function filterProjectsByCategory(categoryId) {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(button => button.classList.remove('active')); // Retirer la classe active de tous les boutons

        const activeButton = categoryId === null ? buttons[0] : Array.from(buttons).find(button => button.dataset.id == categoryId);
        if (activeButton) activeButton.classList.add('active'); // Ajouter la classe active au bouton sélectionné

        const filteredProjects = categoryId === null ? projects : projects.filter(project => project.categoryId == categoryId);

        displayProjects(filteredProjects); // Afficher les projets filtrés
    }

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
        btnDelete.addEventListener('click', () => deletePhoto(project.id)); // Ajouter un écouteur d'événement pour supprimer la photo
        photoContainer.appendChild(btnDelete);

        return photoContainer;
    }

    function displayPhotosInModal(projects) {
        const listGallery = document.getElementById('listGallery');
        listGallery.innerHTML = '';
        let row;
        projects.forEach((project, index) => {
            if (index % 5 === 0) {
                row = document.createElement('div');
                row.className = 'row';
                listGallery.appendChild(row); // Ajouter une nouvelle ligne tous les 5 projets
            }
            const photoElement = createPhotoElement(project);
            row.appendChild(photoElement); // Ajouter chaque photo à la ligne
        });
    }

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
                const projectIndex = projects.findIndex(project => project.id === photoId);
                if (projectIndex !== -1) {
                    projects.splice(projectIndex, 1); // Supprimer le projet de la liste des projets
                    localStorage.setItem('projects', JSON.stringify(projects)); // Mettre à jour les projets dans le localStorage
                }

                const projectElement = document.getElementById(`project-${photoId}`);
                if (projectElement) {
                    projectElement.remove(); // Supprimer l'élément du DOM
                }

                const photoElement = document.getElementById(`photo-${photoId}`);
                if (photoElement) {
                    photoElement.remove(); // Supprimer l'élément du DOM
                }
            } else {
                console.error('Erreur lors de la suppression de la photo :', response.status);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo :', error);
        }
    }

    function addProjectToGallery(project) {
        const projectElement = createProjectElement(project);
        gallery.appendChild(projectElement); // Ajouter le projet à la galerie

        addPhotoToModal(project); // Ajouter la photo au modal
    }

    function addPhotoToModal(project) {
        const listGallery = document.getElementById('listGallery');
        let row = listGallery.querySelector('.row:last-child');
        const photosInRow = row ? row.children.length : 0;
        if (!row || photosInRow >= 5) {
            row = document.createElement('div');
            row.className = 'row';
            listGallery.appendChild(row); // Ajouter une nouvelle ligne tous les 5 projets
        }
        const photoElement = createPhotoElement(project);
        row.appendChild(photoElement); // Ajouter chaque photo à la ligne
    }

    function resetModal() {
        const showModal = document.getElementById('photoModal');
        const showPhoto = document.getElementById('addPhotoView');
        const galleryView = document.getElementById('galleryView');

        showPhoto.style.display = 'none'; // Masquer la vue d'ajout de photo
        galleryView.style.display = 'block'; // Afficher la vue de la galerie
        showModal.style.display = 'none'; // Fermer le modal
    }
});
