const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./userModel');

const Egreso = sequelize.define('Egreso', {
  egresoid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  descripcion: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'usuarioid' }
  },
  negocioid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'negocios', key: 'negocioid' }
  },
  proveedorid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'proveedor', key: 'proveedorid' }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'egresos',
  timestamps: false
});

// Asociaciones
Egreso.belongsTo(Usuario, { foreignKey: 'usuarioid' });
Egreso.belongsTo(require('./proveedorModel'), { foreignKey: 'proveedorid', as: 'proveedor' });

// Relación con Detalle
const EgresoDetalle = require('./egresoDetalleModel');
Egreso.hasMany(EgresoDetalle, { foreignKey: 'egresoid', as: 'detalles' });
EgresoDetalle.belongsTo(Egreso, { foreignKey: 'egresoid' });

module.exports = Egreso;
