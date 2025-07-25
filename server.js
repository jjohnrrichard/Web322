/********************************************************************************
*  WEB322 – Assignment 05 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: John Richard Amparo Student ID: 121943245 Date: July 23, 2025
*  Published URL: https://web322-gyry.vercel.app/
*
********************************************************************************/
const express = require('express');
const app = express();
const projectData = require("./modules/projects");

app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const HTTP_PORT = process.env.PORT || 8080;

projectData.initialize().then(() => {
  //app.get('/', (req, res) => {
    //res.render('home');
  //});

app.get('/', async (req, res) => {
  try {
    const projects = await projectData.getAllProjects();
    const latestProjects = projects.slice(-3).reverse(); // Show the latest 3
    res.render('home', { projects: latestProjects });
  } catch (err) {
    res.status(500).render('404', { message: 'Failed to load homepage projects.' });
  }
});


  app.get('/about', (req, res) => {
    res.render('about');
  });

  app.get('/solutions/projects', async (req, res) => {
    try {
      const sector = req.query.sector;
      const data = sector
        ? await projectData.getProjectsBySector(sector)
        : await projectData.getAllProjects();

      if (data.length === 0) {
        return res.status(404).render("404", { message: `No projects found.` });
      }

      res.render("projects", { projects: data });
    } catch (err) {
      res.status(500).render("404", { message: `Error: ${err}` });
    }
  });

  app.get('/solutions/addProject', async (req, res) => {
    const sectors = await projectData.getAllSectors();
    res.render('addProject', { sectors });
  });

  app.post('/solutions/addProject', async (req, res) => {
    try {
      await projectData.addProject(req.body);
      res.redirect('/solutions/projects');
    } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
  });

  app.get('/solutions/editProject/:id', async (req, res) => {
  try {
    const project = await projectData.getProjectById(req.params.id);
    const sectors = await projectData.getAllSectors();

    if (!project) throw 'Project not found.';

    res.render('editProject', { project, sectors });
  } catch (err) {
    res.status(404).render('404', { message: err });
  }
});

  app.post('/solutions/editProject', async (req, res) => {
    try {
      await projectData.editProject(req.body.id, req.body);
      res.redirect('/solutions/projects');
    } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
  });

  app.get('/solutions/deleteProject/:id', async (req, res) => {
    try {
      await projectData.deleteProject(req.params.id);
      res.redirect('/solutions/projects');
    } catch (err) {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
   }
  });

  app.use((req, res) => {
    res.status(404).render('404', {
      message: "I'm sorry, we're unable to find what you're looking for"
    });
  });

  app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));

}).catch(err => {
  console.log("Initialization failed:", err);
});