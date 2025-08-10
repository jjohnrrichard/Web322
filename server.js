/********************************************************************************
*  WEB322 – Assignment 06 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: John Richard Amparo Student ID: 121943245 Date: August 9, 2025
*  Published URL: https://web322-gyry.vercel.app/
*
********************************************************************************/
require('dotenv').config();
const clientSessions = require('client-sessions');
const authData = require('./modules/auth-service');

const express = require('express');
const app = express();
const path = require('path');
const projectData = require("./modules/projects");

app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: 'session',
  secret: process.env.SESSION_SECRET || 'climateChangeSecretSessionKey',
  duration: 24 * 60 * 60 * 1000, 
  activeDuration: 1000 * 60 * 5      
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const HTTP_PORT = process.env.PORT || 8080;

projectData.initialize()
  .then(authData.initialize)
  .then(() => {

    app.get('/', async (req, res) => {
      try {
        const projects = await projectData.getAllProjects();
        const latestProjects = projects.slice(-3).reverse(); 
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

    app.get('/solutions/project/:id', async (req, res) => {
      try {
        const project = await projectData.getProjectById(req.params.id);

        if (project) {
          res.render('project', { project });
        } else {
          res.status(404).render('404', { message: 'Project not found' });
        }
      } catch (err) {
        res.status(500).render('500', { message: 'Server error: ' + err });
      }
    });

    app.get('/solutions/addProject', ensureLogin, async (req, res) => {
      const sectors = await projectData.getAllSectors();
      res.render('addProject', { sectors });
    });

    app.post('/solutions/addProject', ensureLogin, async (req, res) => {
      try {
        await projectData.addProject(req.body);
        res.redirect('/solutions/projects');
      } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    });

    app.get('/solutions/editProject/:id', ensureLogin, async (req, res) => {
      try {
        const project = await projectData.getProjectById(req.params.id);
        const sectors = await projectData.getAllSectors();

        if (!project) throw 'Project not found.';

        res.render('editProject', { project, sectors });
      } catch (err) {
        res.status(404).render('404', { message: err });
      }
    });

    app.post('/solutions/editProject', ensureLogin, async (req, res) => {
      try {
        await projectData.editProject(req.body.id, req.body);
        res.redirect('/solutions/projects');
      } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    });

    app.get('/solutions/deleteProject/:id', ensureLogin, async (req, res) => {
      try {
        await projectData.deleteProject(req.params.id);
        res.redirect('/solutions/projects');
      } catch (err) {
        res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
      }
    });

    app.get('/login', (req, res) => {
      res.render('login', { errorMessage: '', userName: '' });
    });

    app.get('/register', (req, res) => {
      res.render('register', { errorMessage: '', successMessage: '', userName: '' });
    });

    app.post('/register', (req, res) => {
      authData.registerUser(req.body)
        .then(() => {
          res.render('register', { errorMessage: '', successMessage: 'User created', userName: '' });
        })
        .catch((err) => {
          res.render('register', { errorMessage: err, successMessage: '', userName: req.body.userName || '' });
        });
    });

    app.post('/login', (req, res) => {
      req.body.userAgent = req.get('User-Agent');
      authData.checkUser(req.body)
        .then((user) => {
          req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
          };
          res.redirect('/solutions/projects');
        })
        .catch((err) => {
          res.render('login', { errorMessage: err, userName: req.body.userName || '' });
        });
    });

    app.get('/logout', (req, res) => {
      req.session.reset();
      res.redirect('/');
    });

    app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory', { loginHistory: req.session.user.loginHistory });
});

    app.use((req, res) => {
      res.status(404).render('404', {
        message: "I'm sorry, we're unable to find what you're looking for"
      });
    });

    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));

  })
  .catch((err) => {
    console.log('unable to start server: ' + err);
  });