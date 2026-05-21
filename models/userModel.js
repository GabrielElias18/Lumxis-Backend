const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  usuarioid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  primer_nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 50] }
  },
  segundo_nombre: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: { len: [0, 50] }
  },
  primer_apellido: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 50] }
  },
  segundo_apellido: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: { len: [0, 50] }
  },
  correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true, notEmpty: true }
  },
  telefono: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: { is: /^\+?[1-9]\d{1,14}$/ }
  },
  contraseña: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true, len: [6, 255] }
  },
  rol: { 
    type: DataTypes.ENUM('vendedor', 'administrador'),
    allowNull: false,
    defaultValue: 'vendedor' 
  },
  negocioid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'negocios',
      key: 'negocioid'
    }
  },
  rolid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'roles',
      key: 'rolid'
    }
  },
}, {
  tableName: 'usuarios',
  timestamps: false,
  underscored: true,
});

const Negocio = require('./negocioModel');
Usuario.belongsTo(Negocio, { foreignKey: 'negocioid', as: 'negocio' });

const Rol = require('./rolModel');
Usuario.belongsTo(Rol, { foreignKey: 'rolid', as: 'rolCustom' });

module.exports = Usuario;
