const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de tener la configuración de Sequelize
const Categoria = require('./categoryModel');
const Usuario = require('./userModel');

const Producto = sequelize.define('Producto', {
  productoid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  cantidadDisponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  precioCompra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  imagenes: {
    type: DataTypes.ARRAY(DataTypes.TEXT), // Guarda como array de texto
    defaultValue: [],
  },
  categoriaNombre: {
    type: DataTypes.STRING(100),
  },
  categoriaid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Categoria,
      key: 'categoriaId',
    },
  },
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'usuarioId',
    },
  },
  createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'productos',
});

module.exports = Producto;
