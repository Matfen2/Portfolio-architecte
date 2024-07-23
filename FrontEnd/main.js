document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const apiURL = 'http://localhost:5678/api/works';
    const apiCategoriesURL = 'http://localhost:5678/api/categories';

    // Elements Gallery
    const gallery = document.querySelector('.gallery');
    const categoryButtonsContainer = document.getElementById('category-buttons');
    const openModal = document.querySelector('.open-modal');

    let projects = [];
    let categories = [];

    // Vérifier si l'utilisateur est connecté
    if (token) {
        // Charger le HTML de la popup d'ajout de photo
        loadPhotoModalHTML();
    }

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
                        <!-- Ajout des photos -->
                        <div class="modal-body" id="contentAdd">
                            <h2 class="gallery-title">Ajout photo</h2>
                            <div class="upload-placeholder">
                                <div id="photoPreview" class="photo-preview" style="display: none;">
                                    <img id="photoPreviewImg" src="" alt="Prévisualisation" style="max-width: 100%; max-height: 200px; display: block; margin: auto;" />
                                </div>
                                <button type="button" id="getPhoto" class="upload-button">
                                    <span class="upload-text">+ Ajouter photo</span>
                                </button>
                                <input type="file" id="photoInput" accept="image/jpeg, image/png" style="display: none;" />
                                <small class="typePhoto">jpg, png : 4mo max</small>
                            </div>
                            <form id="postPhoto" class="add-photo-form">
                                <div class="photoTitle">
                                    <label for="title">Titre</label>
                                    <input type="text" name="title" id="title" required />
                                </div>
                                <div class="photoCategory">
                                    <label for="category">Catégorie</label>
                                    <select name="category" id="pet-select">
                                        <!-- Options will be populated dynamically -->
                                    </select>
                                </div>
                            </form>
                        </div>
                        <hr class="rowValid">
                        <button type="submit" id="btnValidPhoto" class="btn btn-primary">Valider</button>
                    </div>
                </div>
            </aside>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        addEventListenersToModal();
    }

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

        openModal.addEventListener('click', function () {
            showModal.style.display = "flex";
        });

        btnPhoto.addEventListener('click', function () {
            document.getElementById('galleryView').style.display = 'none';
            showPhoto.style.display = "block";
        });

        closeShow.addEventListener('click', function () {
            showModal.style.display = "none";
            document.getElementById('galleryView').style.display = 'block';
            showPhoto.style.display = "none";
        });

        closeShow2.addEventListener('click', function () {
            showPhoto.style.display = "none";
            showModal.style.display = "none";
            document.getElementById('galleryView').style.display = 'block';
        });

        function closeModalOnOutsideClick(event) {
            if (event.target === showModal) {
                showModal.style.display = "none";
                document.getElementById('galleryView').style.display = 'block';
                showPhoto.style.display = "none";
            }
        }

        window.addEventListener('click', closeModalOnOutsideClick);

        backToGallery.addEventListener('click', function () {
            showPhoto.style.display = 'none';
            document.getElementById('galleryView').style.display = 'block';
        });

        document.getElementById('getPhoto').addEventListener('click', function () {
            imageInput.click();
        });

        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    photoPreviewImg.src = e.target.result;
                    photoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                document.querySelector('.upload-text').textContent = file.name;
            }
        });

        postPhotoForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const title = document.getElementById('title').value.trim();
            const category = document.getElementById('pet-select').value;
            const file = imageInput.files[0];

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
                    projects.push(newProject);
                    localStorage.setItem('projects', JSON.stringify(projects)); // Mise à jour du localStorage

                    addProjectToGallery(newProject);
                    addPhotoToModal(newProject);

                    resetModal();
                    postPhotoForm.reset();

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

        populateCategorySelect(categories);
    }

    // Charger les catégories et projets depuis l'API ou le stockage local
    function loadProjectsFromLocalStorage() {
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
            projects = JSON.parse(storedProjects);
            displayProjects(projects);
            displayPhotosInModal(projects);
        } else {
            fetchProjects();
        }
    }

    function loadCategoriesFromLocalStorage() {
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
            categories = JSON.parse(storedCategories);
            createCategoryButtons(categories);
            if (token) {
                populateCategorySelect(categories);
            }
        } else {
            fetchCategories();
        }
    }

    loadProjectsFromLocalStorage();
    loadCategoriesFromLocalStorage();

    async function fetchProjects() {
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            projects = data;
            localStorage.setItem('projects', JSON.stringify(projects));

            displayProjects(projects);
            displayPhotosInModal(projects);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets :', error);
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch(apiCategoriesURL);
            const data = await response.json();
            categories = data;
            localStorage.setItem('categories', JSON.stringify(categories));

            createCategoryButtons(categories);
            if (token) {
                populateCategorySelect(categories);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories :', error);
        }
    }

    function displayProjects(projects) {
        gallery.innerHTML = '';
        projects.forEach(project => {
            const projectElement = createProjectElement(project);
            gallery.appendChild(projectElement);
        });
    }

    function createProjectElement(project) {
        const figure = document.createElement('figure');
        figure.setAttribute('id', `project-${project.id}`);

        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        figure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = project.title;
        figure.appendChild(figcaption);

        return figure;
    }

    function createCategoryButtons(categories) {
        categoryButtonsContainer.innerHTML = ''; // Clear previous buttons
        const allButton = document.createElement('button');
        allButton.type = 'button';
        allButton.className = 'btn-filter active';
        allButton.textContent = 'Tous';
        allButton.addEventListener('click', () => filterProjectsByCategory(null));
        categoryButtonsContainer.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-filter';
            button.textContent = category.name;
            button.addEventListener('click', () => filterProjectsByCategory(category.name));
            categoryButtonsContainer.appendChild(button);
        });
    }

    function populateCategorySelect(categories) {
        const categorySelect = document.getElementById('pet-select');
        categorySelect.innerHTML = ''; // Clear previous options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    function filterProjectsByCategory(categoryName) {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(button => button.classList.remove('active'));

        const activeButton = categoryName === null ? buttons[0] : Array.from(buttons).find(button => button.textContent === categoryName);
        activeButton.classList.add('active');

        const filteredProjects = categoryName === null ? projects : projects.filter(project => project.category.name === categoryName);

        displayProjects(filteredProjects);
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
        btnDelete.addEventListener('click', () => deletePhoto(project.id));
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
                listGallery.appendChild(row);
            }
            const photoElement = createPhotoElement(project);
            row.appendChild(photoElement);
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

            console.log("La réponse de ma suppresion : " + response);

            const projectIndex = projects.findIndex(project => project.id === photoId);
            if (projectIndex !== -1) {
                projects.splice(projectIndex, 1);
            }
            displayProjects(projects);
            displayPhotosInModal(projects);

            const projectElement = document.getElementById(`project-${photoId}`);
            if (projectElement) {
                projectElement.remove();
            }

            const photoElement = document.getElementById(`photo-${photoId}`);
            if (photoElement) {
                photoElement.remove();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo:', error);
        }
    }

    function addProjectToGallery(project) {
        const projectElement = createProjectElement(project);
        gallery.appendChild(projectElement);

        addPhotoToModal(project);
    }

    function addPhotoToModal(project) {
        const listGallery = document.getElementById('listGallery');
        let row = listGallery.querySelector('.row:last-child');
        const photosInRow = row ? row.children.length : 0;
        if (!row || photosInRow >= 5) {
            row = document.createElement('div');
            row.className = 'row';
            listGallery.appendChild(row);
        }
        const photoElement = createPhotoElement(project);
        row.appendChild(photoElement);
    }

    function resetModal() {
        const showModal = document.getElementById('photoModal');
        const showPhoto = document.getElementById('addPhotoView');
        const galleryView = document.getElementById('galleryView');

        showPhoto.style.display = 'none';
        galleryView.style.display = 'block';
        showModal.style.display = 'none';
    }
});
