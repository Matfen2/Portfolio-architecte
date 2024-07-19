document.addEventListener('DOMContentLoaded', () => {
    const apiURL = 'http://localhost:5678/api/works';
    const gallery = document.querySelector('.gallery');
    const categoryButtonsContainer = document.getElementById('category-buttons');
    const listGallery = document.getElementById('listGallery');
    const openModal = document.querySelector('.open-modal');
    const showModal = document.getElementById('photoModal');
    const showPhoto = document.getElementById('addPhotoView');
    const btnPhoto = document.getElementById('btnAddPhotoView');
    const closeShow = document.getElementById('btnCloseModal');
    const closeShow2 = document.getElementById('btnCloseModal2');
    const backToGallery = document.getElementById('btnBackToGallery');
    const btnValidPhoto = document.getElementById('btnValidPhoto');
    const token = "testApi2024";
    const postPhotoForm = document.getElementById('postPhoto');
    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'none';
    showPhoto.appendChild(errorMessage);

    let projects = [];

    // Afficher les projets Architectes dans la page index.html
    async function photoArchitecte() {
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            projects = data;

            const categorySet = new Set(projects.map(project => project.category.name));
            const categories = Array.from(categorySet);

            createCategoryButtons(categories);
            displayProjects(projects);
            displayPhotos(projects);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets :', error);
        }
    }

    photoArchitecte();

    function displayProjects(projects) {
        gallery.innerHTML = '';
        projects.forEach(project => {
            const projectElement = createProjectElement(project);
            gallery.appendChild(projectElement);
        });
    }

    // Création des boutons catégories dans la page index.html
    function createCategoryButtons(categories) {
        const allButton = document.createElement('button');
        allButton.type = 'button';
        allButton.className = 'btn-filter active';
        allButton.textContent = 'Tous';
        allButton.addEventListener('click', () => filterProjectsByCategory());
        categoryButtonsContainer.appendChild(allButton);

        categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-filter';
            button.textContent = category;
            button.addEventListener('click', () => filterProjectsByCategory(category));
            categoryButtonsContainer.appendChild(button);
        });
    }

    // Créations du filtrage des boutons catégories
    function filterProjectsByCategory(categoryName) {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(button => button.classList.remove('active'));

        const activeButton = categoryName === null ? buttons[0] : Array.from(buttons).find(button => button.textContent === categoryName);
        activeButton.classList.add('active');

        const filteredProjects = categoryName === null ? projects : projects.filter(project => project.category.name === categoryName);
        displayProjects(filteredProjects);
    }

    // Modal
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
        errorMessage.style.display = 'none';
    });

    closeShow2.addEventListener('click', function () {
        showPhoto.style.display = "none";
        document.getElementById('galleryView').style.display = 'block';
        errorMessage.style.display = 'none';
    });

    backToGallery.addEventListener('click', function () {
        showPhoto.style.display = 'none';
        document.getElementById('galleryView').style.display = 'block';
        errorMessage.style.display = 'none';
    });

    function closeModalOnOutsideClick(event) {
        if (event.target === showModal) {
            showModal.style.display = "none";
            document.getElementById('galleryView').style.display = 'block';
            showPhoto.style.display = "none";
            errorMessage.style.display = 'none';
        }
    }

    window.addEventListener('click', closeModalOnOutsideClick);

    function createProjectElement(project) {
        const figure = document.createElement('figure');

        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        figure.appendChild(img);

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = project.title;
        figure.appendChild(figcaption);

        return figure;
    }

    function createPhotoElement(project) {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container';

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

    async function deletePhoto(photoId) {
        try {
            console.log(`Tentative de suppression de la photo avec l'ID: ${photoId}`);

            const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error('Détails de l\'erreur:', errorDetails);
            }

            const projectIndex = projects.findIndex(project => project.id === photoId);
            if (projectIndex !== -1) {
                projects.splice(projectIndex, 1);
            }
            displayProjects(projects);
            displayPhotos(projects);

            const projectElement = document.getElementById(`project-${photoId}`);
            if (projectElement) {
                projectElement.remove();
            }

            const photoElement = document.getElementById(`photo-${photoId}`);
            if (photoElement) {
                photoElement.remove();
            }
            console.log(`Photo avec l'ID: ${photoId} a été supprimée`);
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo:', error);
        }
    }

    document.getElementById('btnAddPhotoView').addEventListener('click', function () {
        document.getElementById('galleryView').style.display = 'none';
        document.getElementById('addPhotoView').style.display = 'block';
    });

    document.getElementById('getPhoto').addEventListener('click', function () {
        document.getElementById('photoInput').click();
    });

    document.getElementById('photoInput').addEventListener('change', function () {
        const fileName = this.files[0].name;
        document.querySelector('.upload-text').textContent = fileName;
    });

    btnValidPhoto.addEventListener('click', async function () {
        const formData = new FormData(postPhotoForm);
        const fileInput = document.getElementById('photoInput');
        const file = fileInput.files[0];
        
        if (!file) {
            errorMessage.textContent = "Veuillez ajouter une photo.";
            errorMessage.style.display = 'block';
            return;
        }

        formData.append('image', file);

        try {
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                errorMessage.textContent = `Erreur : ${errorDetails.message}`;
                errorMessage.style.display = 'block';
                return;
            }

            const newProject = await response.json();
            projects.push(newProject);

            displayProjects(projects);
            displayPhotos(projects);

            showPhoto.style.display = 'none';
            document.getElementById('galleryView').style.display = 'block';
            showModal.style.display = "none";

            fileInput.value = '';
            postPhotoForm.reset();
            errorMessage.style.display = 'none';
        } catch (error) {
            errorMessage.textContent = `Erreur : ${error.message}`;
            errorMessage.style.display = 'block';
        }
    });

    function displayPhotos(projects) {
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

        const lastRow = listGallery.lastElementChild;
        if (lastRow && lastRow.childElementCount < 5) {
            lastRow.style.justifyContent = 'flex-start';
        }
    }
});
