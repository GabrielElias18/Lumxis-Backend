const Categoria = require('../models/categoryModel');

// Crear una nueva categoría
const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const usuarioId = req.usuario.usuarioId; // Corregido a "usuarioId" (mayúscula)

    if (!usuarioId) {
      return res.status(400).json({ mensaje: 'Usuario no autenticado.' });
    }

    // Verificar si ya existe una categoría con el mismo nombre para este usuario
    const categoriaExistente = await Categoria.findOne({
      where: {
        nombre,
        usuarioid: usuarioId // Ajustado
      }
    });

    if (categoriaExistente) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con este nombre.' });
    }

    // Crear la nueva categoría
    const nuevaCategoria = await Categoria.create({
      nombre,
      descripcion,
      usuarioid: usuarioId // Ajustado
    });

    res.status(201).json({
      mensaje: 'Categoría creada exitosamente.',
      categoria: nuevaCategoria
    });
  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    res.status(500).json({ mensaje: 'Error al crear la categoría.', error: error.message });
  }
};

// Obtener las categorías de un usuario
const getCategoriesByUser = async (req, res) => {
  try {
    const usuarioId = req.usuario.usuarioId; // Corregido

    const categorias = await Categoria.findAll({
      where: { usuarioid: usuarioId }, // Ajustado
      order: [['createdat', 'DESC']]
    });

    res.status(200).json({ categorias });
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ mensaje: 'Error al obtener las categorías.', error: error.message });
  }
};

// Editar una categoría
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const usuarioId = req.usuario.usuarioId; // Corregido

    // Verificar si la categoría existe y pertenece al usuario
    const categoria = await Categoria.findOne({
      where: {
        categoriaid: id,
      }
    });

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada o no pertenece al usuario.' });
    }

    // Actualizar la categoría
    await categoria.update({
      nombre: nombre || categoria.nombre,
      descripcion: descripcion || categoria.descripcion
    });

    res.status(200).json({
      mensaje: 'Categoría actualizada exitosamente.',
      categoria
    });
  } catch (error) {
    console.error('❌ Error al actualizar categoría:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la categoría.', error: error.message });
  }
};

// Eliminar una categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId; // Corregido

    // Verificar si la categoría existe y pertenece al usuario
    const resultado = await Categoria.destroy({
      where: {
        categoriaid: id,
      }
    });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada o no pertenece al usuario.' });
    }

    res.status(200).json({ mensaje: 'Categoría eliminada exitosamente.' });
  } catch (error) {
    console.error('❌ Error al eliminar categoría:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la categoría.', error: error.message });
  }
};

module.exports = {
  createCategory,
  getCategoriesByUser,
  updateCategory,
  deleteCategory
};
