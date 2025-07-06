const Producto = require('../models/productModel');
const Categoria = require('../models/categoryModel');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// ========================================================
// Función utilitaria para subir imagen a Cloudinary desde buffer
// ========================================================
const subirACloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((err, result) => {
      if (result) resolve(result.secure_url);
      else reject(err);
    });

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// ========================================================
// ➕ Crear un nuevo producto con imágenes
// ========================================================
const createProduct = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      cantidadDisponible,
      precioCompra,
      precioVenta,
      categoriaNombre,
      categoriaid
    } = req.body;

    const usuarioId = req.usuario.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({ mensaje: 'Usuario no autenticado.' });
    }

    if (!categoriaNombre && !categoriaid) {
      return res.status(400).json({ mensaje: 'Debes proporcionar el nombre o el ID de la categoría.' });
    }

    const categoria = categoriaid
      ? await Categoria.findOne({ where: { categoriaid, usuarioid: usuarioId } })
      : await Categoria.findOne({ where: { nombre: categoriaNombre, usuarioid: usuarioId } });

    if (!categoria) {
      return res.status(400).json({ mensaje: 'La categoría no existe o no pertenece al usuario.' });
    }

    // 📸 Subida de imágenes sin duplicados
    const imagenes = [];
    if (req.files && Array.isArray(req.files)) {
      const buffersUnicos = new Set();
      for (const file of req.files) {
        const hash = file.buffer.toString('base64');
        if (!buffersUnicos.has(hash)) {
          buffersUnicos.add(hash);
          const url = await subirACloudinary(file.buffer);
          imagenes.push(url);
        }
      }
    }

    // 🧱 Crear producto
    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      cantidad_disponible: parseInt(cantidadDisponible) || 0,
      precio_compra: parseFloat(precioCompra),
      precio_venta: parseFloat(precioVenta),
      imagenes,
      categoria_nombre: categoria.nombre,
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
const getAllProducts = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioId;

    const productos = await Producto.findAll({
      where: { usuarioid }
    });

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

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.usuarioId;

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

    const producto = await Producto.findOne({
      where: { productoid: id, usuarioid }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado o no pertenece al usuario.' });
    }

    let nombreCategoria = categoria_nombre;

    if (!nombreCategoria && categoriaid) {
      const categoria = await Categoria.findByPk(categoriaid);
      if (categoria) nombreCategoria = categoria.nombre;
    }

    const nuevasImagenes = req.files && req.files.length > 0
      ? await Promise.all(req.files.map(file => subirACloudinary(file.buffer)))
      : producto.imagenes || [];

    await producto.update({
      nombre: nombre || producto.nombre,
      descripcion: descripcion || producto.descripcion,
      cantidad_disponible: cantidadDisponible !== undefined ? parseInt(cantidadDisponible) : producto.cantidad_disponible,
      precio_compra: precioCompra !== undefined ? parseFloat(precioCompra) : producto.precio_compra,
      precio_venta: precioVenta !== undefined ? parseFloat(precioVenta) : producto.precio_venta,
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

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioid = req.usuario.usuarioId;

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
