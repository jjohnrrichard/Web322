/********************************************************************************
*  WEB322 – Assignment 04 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: John Richard Amparo Student ID: 121943245 Date: July 10, 2025
*  Published URL: https://web322assigmment3.vercel.app/
*
********************************************************************************/
const projectData = require("./modules/projects");
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const HTTP_PORT = process.env.PORT || 8080;



projectData.initialize().then(() => {

  // app.get("/", (req, res) => {
  //   res.send("Assignment 2: John Richard Amparo - 121943245");
  // });

  app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/views/home.html');
    res.render('home'); 
  });

  app.get('/about', (req, res) => {
    //res.sendFile(__dirname + '/views/about.html'); 
    res.render('about')
  });

  app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;

    if (sector) {
      projectData.getProjectsBySector(sector)
      .then(data => {
        if (data.length === 0) {
          res.status(404).render("404", { message: `No projects found for sector: ${sector}` });
        } else {
          res.render("projects", { projects: data });
        }
      })
      .catch(err => res.status(404).render("404", { message: `Error: ${err}` }));
  } else {
    projectData.getAllProjects()
      .then(data => {
        res.render("projects", { projects: data });
      })
      .catch(err => res.status(500).render("404", { message: `Error: ${err}` }));
  }
});
   
  // app.get("/solutions/projects/sector-demo", (req, res) => {
  //   projectData.getProjectsBySector("ind")  
  //     .then(data => res.json(data))
  //     .catch(err => res.status(404).send(err));
  // });

  app.use((req, res) => {
    //res.status(404).sendFile(__dirname + '/views/404.html');
    res.status(404).render('404', {
      message: "I'm sorry, we're unable to find what you're looking for"
    });
  });

 app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
 //module.exports = app;

}).catch(err => {
  console.log("Initialization failed:", err);
});