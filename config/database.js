// ==================================================
// 🔗 CONEXIÓN A POSTGRESQL USANDO SEQUELIZE ORM
// ==================================================

const { Sequelize } = require('sequelize');
require('dotenv').config();

// 🛠 Configuración de Sequelize
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

// ✅ Exportamos la instancia para usarla en los modelos
module.exports = sequelize;
