const getTenantSequelize = require('../utils/getTenantSequelize');

// 👉 importa los modelos
const defineCategoryModel = require('../models/categoryModel');
const defineProductModel = require('../models/productModel');
const defineClientModel = require('../models/clientModel');
const defineProveedorModel = require('../models/proveedorModel');
const defineVentaModel = require('../models/ventaModel');
const defineEgresoModel = require('../models/egresoModel');


const tenantMiddleware = async (req, res, next) => {
  try {
    const usuario = req.usuario; // 👈 asegúrate de usar el mismo nombre que en authMiddleware

    if (!usuario || !usuario.tenant_db) {
      return res.status(400).json({ error: 'Tenant no especificado' });
    }

    const sequelize = getTenantSequelize(usuario.tenant_db);


    await sequelize.authenticate();

    // 👉 define los modelos usando esa conexión
    req.db = {
      sequelize,
      Category: defineCategoryModel(sequelize, require('sequelize').DataTypes),
      Product: defineProductModel(sequelize, require('sequelize').DataTypes),
      Client: defineClientModel(sequelize, require('sequelize').DataTypes),
      Proveedor: defineProveedorModel(sequelize, require('sequelize').DataTypes),
      Venta: defineVentaModel(sequelize, require('sequelize').DataTypes),
      Egreso: defineEgresoModel(sequelize, require('sequelize').DataTypes),
      // añade aquí los demás modelos
    };

    next();
  } catch (error) {
    console.error('❌ Error en tenantMiddleware:', error);
    res.status(500).json({ error: 'Error al establecer conexión con tenant' });
  }
};

module.exports = tenantMiddleware;
