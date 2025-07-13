// ==========================================================
// 🔧 Este archivo sincroniza el modelo Usuario con la BD
// ==========================================================

const sequelize = require('./config/database'); // conexión principal
const defineUsuarioModel = require('./models/userModel');
const { DataTypes } = require('sequelize');

// ⚙️ Instanciamos el modelo Usuario
const Usuario = defineUsuarioModel(sequelize, DataTypes);

// 🔄 Sincronizar modelo con la base de datos (crear tabla si no existe)
const syncUsuarioTable = async () => {
  try {
    await sequelize.sync({ alter: true }); // Usa alter para evitar borrar datos
    console.log('✅ Tabla "usuarios" sincronizada correctamente.');
  } catch (error) {
    console.error('❌ Error al sincronizar la tabla "usuarios":', error);
  }
};

module.exports = syncUsuarioTable;
