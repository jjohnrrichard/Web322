const sectorData = require('../data/sectorData.json');
const projectData = require('../data/projectData.json');

require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: Sequelize.STRING
}, {
  createdAt: false,
  updatedAt: false
});

const Project = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING,
  sector_id: Sequelize.INTEGER
}, {
  createdAt: false,
  updatedAt: false
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

function initialize() {
  return sequelize.sync();
}

function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

function getProjectsBySector(sectorId) {
  return Project.findAll({
    where: { sector_id: sectorId },
    include: [Sector]
  });
}

function getProjectById(id) {
  return Project.findByPk(id, { include: [Sector] });
}
function getAllSectors() {
  return Sector.findAll().then(sectors =>
    Array.from(new Map(sectors.map(s => [s.sector_name, s])).values())
  );
}
function addProject(projectData) {
  return Project.create(projectData);
}

function editProject(id, projectData) {
  return new Promise((resolve, reject) => {
    Project.update(projectData, {
      where: { id }
    })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

function deleteProject(id) {
  return new Promise((resolve, reject) => {
    Project.destroy({
      where: { id }
    })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
};

/*sequelize
  .sync()
  .then(async () => {
    try {
      await Sector.bulkCreate(sectorData);
      await Project.bulkCreate(projectData);

      await sequelize.query(`SELECT setval(pg_get_serial_sequence('"Sectors"', 'id'), (SELECT MAX(id) FROM "Sectors"))`);
      await sequelize.query(`SELECT setval(pg_get_serial_sequence('"Projects"', 'id'), (SELECT MAX(id) FROM "Projects"))`);

      console.log("-----");
      console.log("data inserted successfully");
    } catch (err) {
      console.log("-----");
      console.log(err.message);
      // Common error: FK violation if a project's sector_id doesn't exist in sectorData
    }
    process.exit();
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });*/