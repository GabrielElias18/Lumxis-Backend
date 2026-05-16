const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EgresoDetalle = sequelize.define('EgresoDetalle', {
  detalleid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  egresoid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'egresos',
      key: 'egresoid'
    },
    onDelete: 'CASCADE'
  },
  productoNombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  categoriaid: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'egreso_detalles',
  timestamps: false
});

// Asociaciones
EgresoDetalle.belongsTo(require('./categoryModel'), { foreignKey: 'categoriaid', as: 'categoria' });

module.exports = EgresoDetalle;
