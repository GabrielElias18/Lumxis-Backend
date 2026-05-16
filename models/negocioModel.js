const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Negocio = sequelize.define('Negocio', {
  negocioid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true }
  },
  nit: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  moneda: {
    type: DataTypes.STRING(10),
    defaultValue: 'COP',
  },
  createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'negocios',
  timestamps: false,
  underscored: true,
});

module.exports = Negocio;
