const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./userModel');

const Venta = sequelize.define('Venta', {
  ventaid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'usuarioid'
    },
    onDelete: 'CASCADE'
  },
  negocioid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'negocios',
      key: 'negocioid'
    }
  },
  clienteid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'clienteid'
    }
  },
  descuentoTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  descuentoTipoTotal: {
    type: DataTypes.ENUM('porcentaje', 'fijo'),
    allowNull: false,
    defaultValue: 'fijo',
  },
  turnoid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'turnos_caja', key: 'turnoid' },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ventas',
  timestamps: false
});

// Asociaciones
Venta.belongsTo(Usuario, { foreignKey: 'usuarioid' });
Venta.belongsTo(require('./clientModel'), { foreignKey: 'clienteid', as: 'cliente' });

// Relación con Detalle
const VentaDetalle = require('./ventaDetalleModel');
Venta.hasMany(VentaDetalle, { foreignKey: 'ventaid', as: 'detalles' });
VentaDetalle.belongsTo(Venta, { foreignKey: 'ventaid', as: 'venta' });

// Relación con VentaPago
const VentaPago = require('./ventaPagoModel');
Venta.hasMany(VentaPago, { foreignKey: 'ventaid', as: 'pagos' });
VentaPago.belongsTo(Venta, { foreignKey: 'ventaid', as: 'venta' });

module.exports = Venta;
