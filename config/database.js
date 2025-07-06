// ==================================================
// 🔗 CONEXIÓN A POSTGRESQL USANDO SEQUELIZE ORM
// ==================================================

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Creamos una nueva instancia de Sequelize con los datos de conexión
const sequelize = new Sequelize(
  process.env.DB_NAME,      
  process.env.DB_USER,      
  process.env.DB_PASSWORD,  
  {
    host: process.env.DB_HOST,     
    dialect: 'postgres',           
    logging: false,                

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    define: {
      timestamps: false,
      underscored: true
    },

    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production'
    }
  }
);

// ===========================
// 📡 PRUEBA DE CONEXIÓN
// ===========================
async function connectAndSync() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // 👇 Importamos los modelos antes de sincronizar
    require('../models/userModel');        // Asegúrate de que la ruta sea correcta
    require('../models/productModel');     // Agrega más modelos si los tienes
    require('../models/categoryModel');    // Por ejemplo, modelo de categorías

    // 📦 Sincronizamos los modelos con la base de datos
    await sequelize.sync({ alter: true }); // Usa force: true si estás en desarrollo inicial

    console.log('✅ Tablas sincronizadas con la base de datos.');
  } catch (error) {
    console.error('❌ Error al conectar o sincronizar con la base de datos:', error);
  }
}

connectAndSync();

// Exportamos la instancia de Sequelize para usarla en modelos y controladores
module.exports = sequelize;
