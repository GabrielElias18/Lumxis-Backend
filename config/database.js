// ==================================================
// 🔗 CONEXIÓN A POSTGRESQL USANDO SEQUELIZE ORM
// ==================================================

// Importamos Sequelize, el ORM para trabajar con bases de datos SQL en Node.js
const { Sequelize } = require('sequelize');

// Cargamos las variables de entorno desde el archivo .env
require('dotenv').config();

// Creamos una nueva instancia de Sequelize con los datos de conexión
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Nombre de la base de datos
  process.env.DB_USER,      // Usuario de la base de datos
  process.env.DB_PASSWORD,  // Contraseña del usuario
  {
    host: process.env.DB_HOST,     // Dirección del servidor (por lo general 'localhost')
    dialect: 'postgres',           // Especificamos que usamos PostgreSQL
    logging: false,                // Desactiva los logs de SQL en consola (útil en producción)

    // Configuraciones del pool de conexiones
    pool: {
      max: 5,          // Máximo de conexiones al mismo tiempo
      min: 0,          // Mínimo de conexiones
      acquire: 30000,  // Tiempo máximo (ms) que Sequelize intentará obtener una conexión antes de lanzar error
      idle: 10000      // Tiempo que una conexión puede estar inactiva antes de ser liberada
    },

    // Configuraciones globales para modelos
    define: {
      timestamps: false,   // Desactiva automáticamente los campos createdAt y updatedAt
      underscored: true    // Usa snake_case en lugar de camelCase para los campos (ej: created_at en lugar de createdAt)
    },

    // Opciones específicas del dialecto (útil para entornos como Heroku que requieren SSL)
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production'  // Usa SSL solo si estamos en producción
    }
  }
);

// ===========================
// 📡 PRUEBA DE CONEXIÓN
// ===========================
// Esta función intenta autenticar la conexión a la base de datos
async function testConnection() {
  try {
    await sequelize.authenticate(); // Verifica si la conexión es válida
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
}

testConnection(); // Ejecutamos la prueba de conexión

// Exportamos la instancia de Sequelize para usarla en modelos y controladores
module.exports = sequelize;
