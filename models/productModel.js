module.exports = (sequelize, DataTypes) => {
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
    cantidadDisponible: {
      field: 'cantidad_disponible',
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    precioCompra: {
      field: 'precio_compra',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    precioVenta: {
      field: 'precio_venta',
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
    categoriaid: {
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

  Producto.associate = (models) => {
    Producto.belongsTo(models.Categoria, { foreignKey: 'categoriaid', as: 'categoria' });
    Producto.belongsTo(models.Usuario, { foreignKey: 'usuarioid', as: 'usuario' });
  };

  return Producto;
};
