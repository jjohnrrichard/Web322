const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
    return new Promise((resolve, reject)=> {
        try {
            projects = projectData.map(proj => {
                let sector = sectorData.find(sec => sec.id === proj.sector_id);
                return {
                    ...proj,
                    sector: sector ? sector.sector_name : "Unknown"
                };
            });
            resolve();
        } catch (err) {
            reject("Could not initialize the project.");
        }
    });
}

function getAllProjects() {
    return new Promise((resolve, reject)=> {
        if (projects.length > 0)
            resolve(projects);
        else
            reject("No available projects.");
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject)=> {
        let found = projects.find(p => p.id === projectId);
        if (found)
            resolve(found);
        else
            reject("Project not found, select another id");
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject)=> {
        let match = projects.filter(p => 
            p.sector.toLowerCase().includes(sector.toLowerCase())
        );
        if (match.length > 0)
            resolve(match);
        else
            reject("Project not found, select another sector");
    });
}

module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector
};

//initialize().then(() => {
  //  console.log(getAllProjects());
//});

/*initialize().then(() => {
    getProjectsBySector("ind")
        .then(data => console.log(data))
        .catch(err => console.log(err));
});

initialize().then(() => {
    getProjectById(31)
   .then(data => console.log(data))
      .catch(err => console.log(err));
});*/


