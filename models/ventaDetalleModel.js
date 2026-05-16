const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VentaDetalle = sequelize.define('VentaDetalle', {
  detalleid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ventaid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ventas',
      key: 'ventaid'
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
  tableName: 'venta_detalles',
  timestamps: false
});

// Asociaciones
VentaDetalle.belongsTo(require('./categoryModel'), { foreignKey: 'categoriaid', as: 'categoria' });

module.exports = VentaDetalle;
