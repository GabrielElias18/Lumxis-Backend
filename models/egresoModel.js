const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de tener la conexión a la BD
const Usuario = require('./userModel'); // Importar modelo de usuario

const Egreso = sequelize.define('Egreso', {
  egresoid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productoNombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  precioCompra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Usuario, key: 'usuarioid' }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'egresos',
  timestamps: false
});

module.exports = Egreso;
