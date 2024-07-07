document.addEventListener('DOMContentLoaded', () => {
    const apiURL = 'http://localhost:5678/api/works';
    const gallery = document.querySelector('.gallery');
    const categoryButtonsContainer = document.getElementById('category-buttons');

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
        const activeButton = categoryId === null ? buttons[0] : Array.from(buttons).find(button => button.textContent === categories.find(category => category.id === categoryId).name);
        activeButton.classList.add('active');

        const filteredProjects = categoryId === null ? projects : projects.filter(project => project.categoryId === categoryId);
        displayProjects(filteredProjects);
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
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des projets :', error);
        });
});
