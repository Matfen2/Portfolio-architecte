const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const swaggerDocs = yaml.load('swagger.yaml');

// Remplacez 'imageName' par la variable qui contient le nom de l'image avec son extension
const imageName = 'monimage.jpg'; // Par exemple, remplacez cette valeur par la variable appropriée
const imagePath = path.join(__dirname, '..', 'Backend', 'images', imageName);

try {
    fs.unlinkSync(imagePath);
    console.log('Image supprimée avec succès !');
} catch (err) {
    console.error(`Erreur lors de la suppression de l'image : ${err}`);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use('/images', express.static(path.join(__dirname, 'images')));

const db = require("./models");
const userRoutes = require('./routes/user.routes');
const categoriesRoutes = require('./routes/categories.routes');
const worksRoutes = require('./routes/works.routes');

db.sequelize.sync().then(() => console.log('db is ready'));

app.use('/api/users', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/works', worksRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = app;
