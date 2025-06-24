const Producto = require('../models/productModel');
const Categoria = require('../models/categoryModel'); // Modelo de Categoría

// ========================================================
// ➕ Crear un nuevo producto con imágenes
// ========================================================
const createProduct = async (req, res) => {
  try {
    // 📥 Datos recibidos del cuerpo de la solicitud
    const {
      nombre,
      descripcion,
      cantidadDisponible,
      precioCompra,
      precioVenta,
      categoriaNombre
    } = req.body;

    const usuarioId = req.usuario.usuarioId; // ID del usuario autenticado

    // 🛡️ Validaciones básicas
    if (!usuarioId) {
      return res.status(400).json({ mensaje: 'Usuario no autenticado.' });
    }

    if (!categoriaNombre) {
      return res.status(400).json({ mensaje: 'El nombre de la categoría es obligatorio.' });
    }

    // 🔍 Verificar que la categoría existe y pertenece al usuario
    const categoria = await Categoria.findOne({
      where: { nombre: categoriaNombre, usuarioid: usuarioId }
    });

    if (!categoria) {
      return res.status(400).json({ mensaje: 'La categoría no existe o no pertenece al usuario.' });
    }

    // 📸 Procesar imágenes subidas (si hay)
    const imagenes = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    // 🧱 Crear producto con categoría asociada
    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      cantidadDisponible,
      precioCompra,
      precioVenta,
      imagenes,
      categoriaNombre,
      categoriaid: categoria.categoriaid,
      usuarioid: usuarioId
    });

    res.status(201).json({
      mensaje: 'Producto creado exitosamente.',
      producto: nuevoProducto
    });

  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    res.status(500).json({ mensaje: 'Error al crear el producto.', error: error.message });
  }
};

// ========================================================
// 📄 Obtener todos los productos del usuario autenticado
// ========================================================
const getAllProducts = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioId;

    // 📥 Obtener productos de la base de datos
    const productos = await Producto.findAll({
      where: { usuarioid }
    });

    // 🌐 Agregar la URL completa a las imágenes
    const productosConImagenes = productos.map(producto => ({
      ...producto.toJSON(),
      imagenes: producto.imagenes
        ? producto.imagenes.map(img => `http://localhost:3000${img}`)
        : []
    }));

    res.status(200).json(productosConImagenes);

  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos.', error: error.message });
  }
};

// ========================================================
// 🔍 Obtener un producto por su ID
// ========================================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;

    // 🔍 Buscar producto por ID y usuario
    const producto = await Producto.findOne({
      where: { productoid: id, usuarioid: usuarioId }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado o no pertenece al usuario.' });
    }

    res.status(200).json({
      ...producto.toJSON(),
      imagenes: producto.imagenes
        ? producto.imagenes.map(img => `http://localhost:3000${img}`)
        : []
    });

  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ mensaje: 'Error al obtener el producto.', error: error.message });
  }
};

// ========================================================
// ✏️ Actualizar un producto existente
// ========================================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      cantidadDisponible,
      precioCompra,
      precioVenta,
      categoriaid,
      categoria_nombre
    } = req.body;

    const usuarioid = req.usuario.usuarioId;

    // 🔍 Buscar el producto a editar
    const producto = await Producto.findOne({
      where: { productoid: id, usuarioid }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado o no pertenece al usuario.' });
    }

    // 📌 Obtener nombre de categoría si solo se pasa el ID
    let nombreCategoria = categoria_nombre;

    if (!nombreCategoria && categoriaid) {
      const categoria = await Categoria.findByPk(categoriaid);
      if (categoria) nombreCategoria = categoria.nombre;
    }

    // 📸 Si se subieron nuevas imágenes, reemplazar; si no, conservar existentes
    const nuevasImagenes = req.files && req.files.length > 0
      ? req.files.map(file => `/uploads/${file.filename}`)
      : producto.imagenes || [];

    // ✏️ Actualizar producto
    await producto.update({
      nombre: nombre || producto.nombre,
      descripcion: descripcion || producto.descripcion,
      cantidadDisponible: cantidadDisponible !== undefined ? cantidadDisponible : producto.cantidadDisponible,
      precioCompra: precioCompra !== undefined ? precioCompra : producto.precioCompra,
      precioVenta: precioVenta !== undefined ? precioVenta : producto.precioVenta,
      categoriaid: categoriaid || producto.categoriaid,
      categoria_nombre: nombreCategoria,
      imagenes: nuevasImagenes
    });

    res.status(200).json({
      mensaje: 'Producto actualizado exitosamente.',
      producto
    });

  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el producto.', error: error.message });
  }
};

// ========================================================
// 🗑️ Eliminar un producto
// ========================================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioid = req.usuario.usuarioId;

    // 🧹 Eliminar si pertenece al usuario
    const resultado = await Producto.destroy({
      where: { productoid: id, usuarioid }
    });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Producto no encontrado o no pertenece al usuario.' });
    }

    res.status(200).json({ mensaje: 'Producto eliminado exitosamente.' });

  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el producto.', error: error.message });
  }
};

// ========================================================
// 📤 Exportar funciones
// ========================================================
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
