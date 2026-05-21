const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TurnoCaja = sequelize.define('TurnoCaja', {
  turnoid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'usuarioid' },
  },
  negocioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'negocios', key: 'negocioid' },
  },
  fechaApertura: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  fechaCierre: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  montoInicial: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  montoEfectivoReal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('abierto', 'cerrado'),
    allowNull: false,
    defaultValue: 'abierto',
  },
}, {
  tableName: 'turnos_caja',
  timestamps: false,
});

const Usuario = require('./userModel');
TurnoCaja.belongsTo(Usuario, { foreignKey: 'usuarioid', as: 'usuario' });

module.exports = TurnoCaja;
