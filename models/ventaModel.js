const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de tener la configuración de Sequelize
const Usuario = require('./userModel'); // Importa el modelo de Usuario si lo tienes

const Venta = sequelize.define('Venta', {
  ventaid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productoNombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1 // Asegura que la cantidad sea mayor a 0
    }
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'usuarioid'
    },
    onDelete: 'CASCADE'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ventas',
  timestamps: false // Ya tenemos createdAt manualmente
});

// Asociación con Usuario
Venta.belongsTo(Usuario, { foreignKey: 'usuarioid' });

module.exports = Venta;
