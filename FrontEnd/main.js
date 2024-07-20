document.addEventListener('DOMContentLoaded', () => {
    const token = "testApi2024"; // Utilisez le token que vous avez fourni
    const apiURL = 'http://localhost:5678/api/works';
    
    // Elements Gallery
    const gallery = document.querySelector('.gallery');
    const categoryButtonsContainer = document.getElementById('category-buttons');
    const listGallery = document.getElementById('listGallery');

    // Elements Modals
    const openModal = document.querySelector('.open-modal');
    const showModal = document.getElementById('photoModal');
    const showPhoto = document.getElementById('addPhotoView');
    const btnPhoto = document.getElementById('btnAddPhotoView');
    const closeShow = document.getElementById('btnCloseModal');
    const closeShow2 = document.getElementById('btnCloseModal2');
    const backToGallery = document.getElementById('btnBackToGallery');
    const postPhotoForm = document.getElementById('postPhoto');
    const imageInput = document.getElementById('photoInput');
    const btnValidPhoto = document.getElementById('btnValidPhoto');
    
    let projects = [];

    // MODAL
    //Part 1 : Ouvrir le Modal 
    openModal.addEventListener('click', function () {
        showModal.style.display = "flex";
    });

    btnPhoto.addEventListener('click', function () {
        document.getElementById('galleryView').style.display = 'none';
        showPhoto.style.display = "block";
    });

    //Part 2 : Fermer le modal via le bouton "btnClose"
    closeShow.addEventListener('click', function () {
        showModal.style.display = "none";
        document.getElementById('galleryView').style.display = 'block';
        showPhoto.style.display = "none";
    });

    closeShow2.addEventListener('click', function () {
        showPhoto.style.display = "none";
        document.getElementById('galleryView').style.display = 'block';
    });
    
    //Part 3 : Fermer le modal en dehors des boutons "btnClose"
    function closeModalOnOutsideClick(event) {
        if (event.target === showModal) {
            showModal.style.display = "none";
            document.getElementById('galleryView').style.display = 'block';
            showPhoto.style.display = "none";
        }
    }

    window.addEventListener('click', closeModalOnOutsideClick);

    // Part 4 : Revenir au 1er Modal à partir du 2ème Modal
    backToGallery.addEventListener('click', function () {
        showPhoto.style.display = 'none';
        document.getElementById('galleryView').style.display = 'block';
    });

    // Gallery
    // Part 1 : Récupérer les infos de la base de données
    async function fetchProjects() {
        try {
            const response = await fetch(apiURL);
            const data = await response.json();
            projects = data;

            // Technique Array.Map() permet de récupérer les élements spécifiques de la base de données
            const categorySet = new Set(projects.map(project => project.category.name));

            // Création d'un tableau basé uniquement sur les catégories
            const categories = Array.from(categorySet);

            // Appels des fonctions
            createCategoryButtons(categories);
            displayProjects(projects);
            displayPhotos(projects);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets :', error);
        }
    }

    fetchProjects();

    // Fonctions permettant d'ajouter chaque élement (forEach) de works dans la section gallery
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

    // Part 2 : Filter les catégories des works
    // Fonction qui créer des boutons de chaque catégorie
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
            button.textContent = category;
            button.addEventListener('click', () => filterProjectsByCategory(category));
            categoryButtonsContainer.appendChild(button);
        });
    }

    // Fonction permettant de filter les éléments catégories des works à chaque boutons
    function filterProjectsByCategory(categoryName) {
        const buttons = document.querySelectorAll('.btn-filter');
        buttons.forEach(button => button.classList.remove('active'));

        // La technique Array.find() permet de récupérer le premier éléments du tableau 
        const activeButton = categoryName === null ? buttons[0] : Array.from(buttons).find(button => button.textContent === categoryName);
        activeButton.classList.add('active');

        // La technique Array.find() permet de créer le tableau avec des éléments spécifiques
        const filteredProjects = categoryName === null ? projects : projects.filter(project => project.category.name === categoryName);

        displayProjects(filteredProjects);
    }

    // CONTENU DU MODAL
    // Part 1 : Création du contenu dans le modal (#photoModal)
    function createPhotoElement(project) {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container';
        photoContainer.setAttribute('id', `photo-${project.id}`);

        // Création des images
        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        img.className = 'photoArchitecture';
        photoContainer.appendChild(img);

        // Création des boutons corbeilles à chaque photo
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
        // Pour chaque work
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

    // Part 2 : Supprimer les élements dans le modal (#photoModal)
    async function deletePhoto(photoId) {
        try {
            // Requete DELETE
            const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

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
        } catch (error) {
            console.error('Erreur lors de la suppression de la photo:', error);
        }
    }

    // Part 3 : Ajouter les éléments dans le modal (#photoModal) et dans la page index.html depuis le modal (#addPhoto)
    postPhotoForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const title = document.getElementById('title').value.trim();
        const category = document.getElementById('category').value.trim();
        const imageInput = document.getElementById('photoInput');

        const file = imageInput.files[0];

        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("category", category);

        try {
            const response = await fetch(apiURL, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const newProject = await response.json();
                projects.push(newProject);

                addProjectToGallery(newProject);

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

    function addProjectToGallery(project) {
        const projectElement = createProjectElement(project);
        gallery.appendChild(projectElement);

        const photoElement = createPhotoElement(project);
        listGallery.appendChild(photoElement);
    }

    document.getElementById('getPhoto').addEventListener('click', function () {
         imageInput.addEventListener('click', function () {
        const fileName = this.files[0].name;
        document.querySelector('.upload-text').textContent = fileName;
    });
    });  
});
