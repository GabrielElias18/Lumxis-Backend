const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de tener la configuración de Sequelize
const Usuario = require('./userModel');

const Cliente = sequelize.define('Cliente',{
   clienteid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombreCliente: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nombre_cliente'
  },

  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  correo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  direccion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
  usuarioid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'usuarioId',
    },
  }

}, {
    timestamps: false,
    tableName: 'clientes'
})

module.exports = Cliente;