// Ajoute un écouteur d'événements pour exécuter le code une fois que le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const authLink = document.getElementById('auth-link');
    const modifySection = document.querySelector('.modify');
    const blackBanner = document.querySelector('.black-banner');
    const gallery = document.querySelector('.gallery');
    const categoryButtonsContainer = document.getElementById('category-buttons');

    let projects = [];
    let categories = new Set();
    let categoriesLoaded = false;

    if (token) {
        onLogin();
    } else {
        onLogout();
    }

    function onLogin() {
        authLink.textContent = 'logout';
        authLink.href = '#';
        modifySection.style.display = 'flex';
        modifySection.style.flexDirection = 'row';
        blackBanner.style.display = 'flex';
        authLink.addEventListener('click', handleLogout);
        loadPhotoModalHTML();
        loadProjectsFromAPI();
        loadCategoriesFromAPI();
        hideCategoryButtons();
    }

    function onLogout() {
        authLink.textContent = 'login';
        authLink.href = 'login.html';
        modifySection.style.display = 'none';
        blackBanner.style.display = 'none';
        authLink.removeEventListener('click', handleLogout);
        showCategoryButtons();
        loadProjectsFromAPI();
        if (!categoriesLoaded) {
            loadCategoriesFromAPI();
        }
    }

    function handleLogout(event) {
        event.preventDefault();
        localStorage.removeItem('token');
        onLogout();
    }

    function loadProjectsFromAPI() {
        fetch('http://localhost:5678/api/works', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        .then(response => response.json())
        .then(data => {
            projects = data;
            displayProjects(projects);
            displayPhotosInModal(projects);
        })
        .catch(error => console.error('Erreur lors de la récupération des projets :', error));
    }

    function loadCategoriesFromAPI() {
        fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(data => {
            data.forEach(category => categories.add(category));
            createCategoryButtons([...categories]);
            populateCategorySelect([...categories]);
            categoriesLoaded = true;
        })
        .catch(error => console.error('Erreur lors de la récupération des catégories :', error));
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
        img.classList.add('gallery-image');
        figure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = project.title;
        figure.appendChild(figcaption);

        return figure;
    }

    function displayPhotosInModal(projects) {
        const listGallery = document.getElementById('listGallery');
        if (listGallery) {
            listGallery.innerHTML = '';
            projects.forEach(project => {
                const photoElement = createPhotoElement(project);
                listGallery.appendChild(photoElement);
            });
        }
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

    function createCategoryButtons(categories) {
        categoryButtonsContainer.innerHTML = '';
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
            button.dataset.id = category.id;
            button.addEventListener('click', () => filterProjectsByCategory(category.id));
            categoryButtonsContainer.appendChild(button);
        });
    }

    function filterProjectsByCategory(categoryId) {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(button => button.classList.remove('active'));

        const activeButton = categoryId === null ? buttons[0] : Array.from(buttons).find(button => button.dataset.id == categoryId);
        if (activeButton) activeButton.classList.add('active');

        const filteredProjects = categoryId === null ? projects : projects.filter(project => project.categoryId == categoryId);

        displayProjects(filteredProjects);
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
                const projectElement = document.getElementById(`project-${photoId}`);
                if (projectElement) {
                    projectElement.remove();
                }

                const photoElement = document.getElementById(`photo-${photoId}`);
                if (photoElement) {
                    photoElement.remove();
                }

                projects = projects.filter(project => project.id !== photoId);

                const newImageInput = document.getElementById('photoInput');
                if (newImageInput) {
                    newImageInput.value = ''; // Réinitialise la valeur de l'input
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
        gallery.appendChild(projectElement);
    }

    function addPhotoToModal(project) {
        const listGallery = document.getElementById('listGallery');
        if (listGallery) {
            const photoElement = createPhotoElement(project);
            listGallery.appendChild(photoElement);
        }
    }

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

    function populateCategorySelect(categories) {
        const categorySelect = document.getElementById('pet-select');
        if (categorySelect) {
            categorySelect.innerHTML = '';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
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
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadButtonIcon = document.querySelector('.upload-button i');
        const uploadText = document.querySelector('.upload-text');
        const typePhotoText = document.querySelector('.typePhoto');

        document.querySelector('.open-modal').addEventListener('click', (event) => {
            event.preventDefault();
            if (showModal) showModal.style.display = "flex";
        });

        btnPhoto.addEventListener('click', () => {
            if (showPhoto && galleryView) {
                galleryView.style.display = 'none';
                showPhoto.style.display = "block";
            }
        });

        closeShow.addEventListener('click', () => {
            if (showModal && showPhoto && galleryView) {
                showModal.style.display = "none";
                galleryView.style.display = 'block';
                showPhoto.style.display = "none";
            }
        });

        closeShow2.addEventListener('click', () => {
            if (showModal && showPhoto && galleryView) {
                showPhoto.style.display = "none";
                showModal.style.display = "none";
                galleryView.style.display = 'block';
            }
        });

        window.addEventListener('click', event => {
            if (event.target === showModal) {
                if (showModal && showPhoto && galleryView) {
                    showModal.style.display = "none";
                    galleryView.style.display = 'block';
                    showPhoto.style.display = "none";
                }
            }
        });

        backToGallery.addEventListener('click', () => {
            if (showPhoto && galleryView) {
                showPhoto.style.display = 'none';
                galleryView.style.display = 'block';
            }
        });

        document.getElementById('getPhoto').addEventListener('click', () => {
            imageInput.click();
        });

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

    function hideCategoryButtons() {
        if (categoryButtonsContainer) {
            categoryButtonsContainer.style.display = 'none';
        }
    }

    function showCategoryButtons() {
        if (categoryButtonsContainer) {
            categoryButtonsContainer.style.display = 'flex';
        }
    }
});
