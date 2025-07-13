// ========================================================
// 📂 CONTROLADOR DE PRODUCTOS CON MULTI-TENANT
// ========================================================

const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// ========================================================
// 📤 Función utilitaria para subir imagen a Cloudinary
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
// ➕ Crear un nuevo producto
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

    const usuarioId = req.usuario.usuarioid;
    const { Product, Category } = req.db;

    if (!categoriaNombre && !categoriaid) {
      return res.status(400).json({ mensaje: 'Debes proporcionar el nombre o el ID de la categoría.' });
    }

    const categoria = categoriaid
      ? await Category.findOne({ where: { categoriaid, usuarioid: usuarioId } })
      : await Category.findOne({ where: { nombre: categoriaNombre, usuarioid: usuarioId } });

    if (!categoria) {
      return res.status(400).json({ mensaje: 'La categoría no existe o no pertenece al usuario.' });
    }

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

    const nuevoProducto = await Product.create({
      nombre,
      descripcion,
      cantidadDisponible: parseInt(cantidadDisponible) || 0,
      precioCompra: parseFloat(precioCompra),
      precioVenta: parseFloat(precioVenta),
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
// 📄 Obtener todos los productos del usuario
// ========================================================
const getAllProducts = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioid;
    const { Product } = req.db;

    const productos = await Product.findAll({ where: { usuarioid } });

    res.status(200).json(productos);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos.', error: error.message });
  }
};

// ========================================================
// 🔍 Obtener un producto por ID
// ========================================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioid = req.usuario.usuarioid;
    const { Product } = req.db;

    const producto = await Product.findOne({ where: { productoid: id, usuarioid } });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado o no pertenece al usuario.' });
    }

    res.status(200).json(producto);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ mensaje: 'Error al obtener el producto.', error: error.message });
  }
};

// ========================================================
// ✏️ Actualizar un producto por ID
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

    const usuarioid = req.usuario.usuarioid;
    const { Product, Category } = req.db;

    const producto = await Product.findOne({ where: { productoid: id, usuarioid } });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado o no pertenece al usuario.' });
    }

    let nombreCategoria = categoria_nombre;
    if (!nombreCategoria && categoriaid) {
      const categoria = await Category.findByPk(categoriaid);
      if (categoria) nombreCategoria = categoria.nombre;
    }

    const nuevasImagenes = req.files && req.files.length > 0
      ? await Promise.all(req.files.map(file => subirACloudinary(file.buffer)))
      : producto.imagenes || [];

    await producto.update({
      nombre: nombre || producto.nombre,
      descripcion: descripcion || producto.descripcion,
      cantidadDisponible: cantidadDisponible !== undefined ? parseInt(cantidadDisponible) : producto.cantidadDisponible,
      precioCompra: precioCompra !== undefined ? parseFloat(precioCompra) : producto.precioCompra,
      precioVenta: precioVenta !== undefined ? parseFloat(precioVenta) : producto.precioVenta,
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
// 🗑️ Eliminar producto por ID
// ========================================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioid = req.usuario.usuarioid;
    const { Product } = req.db;

    const resultado = await Product.destroy({ where: { productoid: id, usuarioid } });

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