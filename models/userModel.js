module.exports = (sequelize, DataTypes) => {
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
    tenant_db: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true }
    }
  }, {
    tableName: 'usuarios',
    timestamps: false,
    underscored: true,
  });

  Usuario.associate = (models) => {
    // Aquí se podrían definir relaciones futuras si se requieren
    // models.Usuario.hasMany(models.Producto, { foreignKey: 'usuarioid' });
  };

  return Usuario;
};
