module.exports = (sequelize, DataTypes) => {
  const Egreso = sequelize.define('Egreso', {
    egresoid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    productoNombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    precioCompra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    usuarioid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'egresos',
    timestamps: false,
    underscored: true
  });

  Egreso.associate = (models) => {
    Egreso.belongsTo(models.Usuario, {
      foreignKey: 'usuarioid',
      as: 'usuario'
    });
  };

  return Egreso;
};
