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
    const backToGallery = document.getElementById('btnBackToGallery');

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

    backToGallery.addEventListener('click', function () {
        showPhoto.style.display = 'none';
        document.getElementById('galleryView').style.display = 'block';
    });

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

    function displayProjects(projects) {
        gallery.innerHTML = '';
        projects.forEach(project => {
            const projectElement = createProjectElement(project);
            gallery.appendChild(projectElement);
        });
    }

    function createCategoryButtons(categories) {
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
            button.addEventListener('click', () => filterProjectsByCategory(category.id));
            categoryButtonsContainer.appendChild(button);
        });
    }

    function filterProjectsByCategory(categoryId) {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(button => button.classList.remove('active'));
        const activeButton = categoryId === null 
            ? buttons[0] 
            : Array.from(buttons).find(button => button.textContent === categories.find(category => category.id === categoryId).name);
        activeButton.classList.add('active');

        const filteredProjects = categoryId === null ? projects : projects.filter(project => project.categoryId === categoryId);
        displayProjects(filteredProjects);
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

    function deletePhoto(photoId) {
        // Ajouter la logique pour supprimer la photo via l'API
        console.log('Suppression de la photo avec ID:', photoId);
    }

    let projects = [];
    let categories = [];

    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            projects = data;
            categories = [...new Map(projects.map(project => [project.category.id, project.category])).values()];

            createCategoryButtons(categories);
            displayProjects(projects);
            displayPhotos(projects);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des projets :', error);
        });

    // Changer de modal
    document.getElementById('btnAddPhotoView').addEventListener('click', function() {
        document.getElementById('galleryView').style.display = 'none';
        document.getElementById('addPhotoView').style.display = 'block';
    });

    // Choisir une photo
    document.getElementById('getPhoto').addEventListener('click', function() {
        document.getElementById('photoInput').click();
    });

    document.getElementById('photoInput').addEventListener('change', function() {
        const fileName = this.files[0].name;
        document.querySelector('.upload-text').textContent = fileName;
    });
});
