const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
  rolid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { notEmpty: true },
  },
  negocioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'negocios', key: 'negocioid' },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'roles',
  timestamps: false,
});

const RolSeccion = require('./roleSeccionModel');
Rol.hasMany(RolSeccion, { foreignKey: 'rolid', as: 'secciones' });
RolSeccion.belongsTo(Rol, { foreignKey: 'rolid' });

module.exports = Rol;
