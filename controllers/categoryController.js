// ======================================================
// 📁 CONTROLADOR DE CATEGORÍAS
// ======================================================

const Categoria = require('../models/categoryModel');
const sequelize = require('../config/database');

// ===============================================
// ➕ Crear una nueva categoría
// ===============================================
const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const { usuarioid, negocioid } = req.usuario;

    // 🔍 Verificar si ya existe una categoría con el mismo nombre para este NEGOCIO
    const categoriaExistente = await Categoria.findOne({
      where: { nombre, negocioid: negocioid }
    });

    if (categoriaExistente) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con este nombre.' });
    }

    const nuevaCategoria = await Categoria.create({
      nombre,
      descripcion,
      usuarioid,
      negocioid
    });

    res.status(201).json({ mensaje: 'Categoría creada exitosamente.', categoria: nuevaCategoria });

  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    res.status(500).json({ mensaje: 'Error al crear la categoría.' });
  }
};

// ===============================================
// 📄 Obtener todas las categorías del NEGOCIO
// ===============================================
const getCategoriesByUser = async (req, res) => {
  try {
    const { negocioid } = req.usuario;

    const categorias = await Categoria.findAll({
      where: { negocioid },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM productos AS p
              WHERE p.categoriaid = "Categoria".categoriaid
            )`),
            'totalProductos'
          ]
        ]
      },
      order: [['createdat', 'DESC']]
    });

    res.status(200).json(categorias); // Simplificado para devolver el array directamente

  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ mensaje: 'Error al obtener las categorías.' });
  }
};

// ===============================================
// ✏️ Editar una categoría
// ===============================================
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.findOne({
      where: { categoriaid: id, negocioid }
    });

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
    }

    await categoria.update({
      nombre: nombre || categoria.nombre,
      descripcion: descripcion || categoria.descripcion
    });

    res.status(200).json({ mensaje: 'Categoría actualizada exitosamente.', categoria });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la categoría.' });
  }
};

// ===============================================
// 🗑️ Eliminar una categoría
// ===============================================
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const resultado = await Categoria.destroy({
      where: { categoriaid: id, negocioid }
    });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
    }

    res.status(200).json({ mensaje: 'Categoría eliminada exitosamente.' });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la categoría.' });
  }
};

module.exports = {
  createCategory,
  getCategoriesByUser,
  updateCategory,
  deleteCategory
};
