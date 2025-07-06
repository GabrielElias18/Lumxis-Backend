// ================================================
// 📦 MODELO DE PRODUCTO CON RELACIONES Y CLOUDINARY
// ================================================

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
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
  cantidad_disponible: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  precio_compra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  imagenes: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  categoria_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  categoriaid: { // 👈 importante: en minúscula
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'categoriaid'
    }
  },
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'usuarioid'
    }
  },
  createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'productos',
  timestamps: false,
  underscored: true
});

// Relaciones
Producto.belongsTo(Categoria, { foreignKey: 'categoriaid', as: 'categoria' });
Producto.belongsTo(Usuario, { foreignKey: 'usuarioid', as: 'usuario' });

module.exports = Producto;
