const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./userModel');

const Categoria = sequelize.define('Categoria', {
  categoriaid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
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
  negocioid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'negocios',
      key: 'negocioid'
    }
  },
  createdat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'categorias',
  timestamps: false,
  underscored: true
});

// Definir la relación con Usuario
Categoria.belongsTo(Usuario, {
  foreignKey: 'usuarioid',
  as: 'usuario'
});

module.exports = Categoria;