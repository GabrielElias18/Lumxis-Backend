module.exports = (sequelize, DataTypes) => {
  const Proveedor = sequelize.define('Proveedor', {
    proveedorid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    razonSocial: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'razon_social'
    },
    nombreProveedor: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nombre_proveedor'
    },
    nit: {
      type: DataTypes.STRING(20),
      allowNull: false
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
    banco: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    numeroCuenta: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'numero_cuenta'
    },
    tipoCuenta: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'tipo_cuenta'
    },
    categoriaSuministro: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      field: 'categoria_suministro'
    },
    estado: {
      type: DataTypes.STRING(20),
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
    timestamps: true,
    tableName: 'proveedor',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Proveedor.associate = (models) => {
    Proveedor.belongsTo(models.Usuario, { foreignKey: 'usuarioid', as: 'usuario' });
  };

  return Proveedor;
};
