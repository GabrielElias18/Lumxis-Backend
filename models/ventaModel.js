module.exports = (sequelize, DataTypes) => {
  const Venta = sequelize.define('Venta', {
    ventaid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productoNombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    precioVenta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    usuarioid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ventas',
    timestamps: false
  });

  Venta.associate = (models) => {
    Venta.belongsTo(models.Usuario, { foreignKey: 'usuarioid', as: 'usuario' });
  };

  return Venta;
};
