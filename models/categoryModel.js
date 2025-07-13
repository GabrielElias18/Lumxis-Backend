module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    categoriaid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
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
    tableName: 'categorias',
    timestamps: false,
    underscored: true
  });

  Categoria.associate = (models) => {
    Categoria.belongsTo(models.Usuario, {
      foreignKey: 'usuarioid',
      as: 'usuario'
    });
  };

  return Categoria;
};
