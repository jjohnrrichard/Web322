/********************************************************************************
*  WEB322 – Assignment 03 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: John Richard Amparo Student ID: 121943245 Date: June 20, 2025
*
********************************************************************************/
const projectData = require("./modules/projects");
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use('/images', express.static('images'));

const HTTP_PORT = process.env.PORT || 8080;



projectData.initialize().then(() => {

  // app.get("/", (req, res) => {
  //   res.send("Assignment 2: John Richard Amparo - 121943245");
  // });

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/home.html'); 
  });

  app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/views/about.html'); 
  });

  app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;
    if (sector) {
      projectData.getProjectsBySector(sector)
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
    } else {
      projectData.getAllProjects()
        .then(data => res.json(data))
        .catch(err => res.status(500).send(err));
    }
  });

  app.get('/solutions/projects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    projectData.getProjectById(id)
      .then(data => res.json(data))
      .catch(err => res.status(404).send(err));
  });

  // app.get("/solutions/projects/sector-demo", (req, res) => {
  //   projectData.getProjectsBySector("ind")  
  //     .then(data => res.json(data))
  //     .catch(err => res.status(404).send(err));
  // });

  app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/views/404.html');
  });

  app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));

}).catch(err => {
  console.log("Initialization failed:", err);
});