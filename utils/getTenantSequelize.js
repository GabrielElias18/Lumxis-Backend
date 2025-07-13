const { Sequelize, DataTypes } = require('sequelize');

// Cache de conexiones
const conexiones = {};

function getTenantSequelize(dbName) {
  if (conexiones[dbName]) {
    return conexiones[dbName];
  }

  const sequelize = new Sequelize(dbName, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Puedes habilitarlo para debug
  });

  // Cargar modelos dinámicamente
  const models = {};

  models.Product = require('../models/productModel')(sequelize, DataTypes);
  models.Category = require('../models/categoryModel')(sequelize, DataTypes);
  models.Client = require('../models/clientModel')(sequelize, DataTypes);
  models.Proveedor = require('../models/proveedorModel')(sequelize, DataTypes);
  models.Egreso = require('../models/egresoModel')(sequelize, DataTypes);
  models.Venta = require('../models/ventaModel')(sequelize, DataTypes);

  // Asignar modelos al sequelize.models
  Object.keys(models).forEach((name) => {
    sequelize.models[name] = models[name];
  });

  conexiones[dbName] = sequelize;

  return sequelize;
}

module.exports = getTenantSequelize;
