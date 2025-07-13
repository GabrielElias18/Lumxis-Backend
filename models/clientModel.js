module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
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
        model: 'usuarios',
        key: 'usuarioid'
      }
    }
  }, {
    timestamps: false,
    tableName: 'clientes',
    underscored: true
  });

  Cliente.associate = (models) => {
    Cliente.belongsTo(models.Usuario, {
      foreignKey: 'usuarioid',
      as: 'usuario'
    });
  };

  return Cliente;
};
