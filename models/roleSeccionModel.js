const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolSeccion = sequelize.define('RolSeccion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rolid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'roles', key: 'rolid' },
    onDelete: 'CASCADE',
  },
  seccion: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'role_secciones',
  timestamps: false,
});

module.exports = RolSeccion;
