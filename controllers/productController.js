const Producto = require('../models/productModel');
const Categoria = require('../models/categoryModel');
const { processAndUploadImage } = require('../utils/cloudinary');

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
      categoriaNombre
    } = req.body;

    const { usuarioid, negocioid } = req.usuario;

    if (!categoriaNombre) {
      return res.status(400).json({ mensaje: 'El nombre de la categoría es obligatorio.' });
    }

    // 🔍 Verificar que la categoría existe y pertenece al NEGOCIO
    const categoria = await Categoria.findOne({
      where: { nombre: categoriaNombre, negocioid: negocioid }
    });

    if (!categoria) {
      return res.status(400).json({ mensaje: 'La categoría no existe o no pertenece a tu negocio.' });
    }

    // 📸 Imágenes
    let imagenes = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => processAndUploadImage(file.buffer));
      const results = await Promise.all(uploadPromises);
      imagenes = results.map(result => result.secure_url);
    }

    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      cantidadDisponible,
      precioCompra,
      precioVenta,
      imagenes,
      categoriaNombre,
      categoriaid: categoria.categoriaid,
      usuarioid,
      negocioid
    });

    res.status(201).json({ mensaje: 'Producto creado exitosamente.', producto: nuevoProducto });

  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    res.status(500).json({ mensaje: 'Error al crear el producto.' });
  }
};

// ========================================================
// 📄 Obtener todos los productos del NEGOCIO
// ========================================================
const getAllProducts = async (req, res) => {
  try {
    const { negocioid } = req.usuario;

    const productos = await Producto.findAll({
      where: { negocioid }
    });

    const productosConImagenes = productos.map(producto => ({
      ...producto.toJSON(),
      imagenes: producto.imagenes || []
    }));

    res.status(200).json(productosConImagenes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los productos.' });
  }
};

// ========================================================
// 🔍 Obtener un producto por su ID (Filtrado por Negocio)
// ========================================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const producto = await Producto.findOne({
      where: { productoid: id, negocioid }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el producto.' });
  }
};

// ========================================================
// ✏️ Actualizar un producto existente
// ========================================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;
    const {
      nombre,
      descripcion,
      cantidadDisponible,
      precioCompra,
      precioVenta,
      categoriaid,
      categoriaNombre
    } = req.body;

    const producto = await Producto.findOne({
      where: { productoid: id, negocioid }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    let nuevasImagenes = producto.imagenes || [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => processAndUploadImage(file.buffer));
      const results = await Promise.all(uploadPromises);
      nuevasImagenes = results.map(result => result.secure_url);
    }

    await producto.update({
      nombre: nombre || producto.nombre,
      descripcion: descripcion || producto.descripcion,
      cantidadDisponible: cantidadDisponible !== undefined ? cantidadDisponible : producto.cantidadDisponible,
      precioCompra: precioCompra !== undefined ? precioCompra : producto.precioCompra,
      precioVenta: precioVenta !== undefined ? precioVenta : producto.precioVenta,
      categoriaid: categoriaid || producto.categoriaid,
      categoriaNombre: categoriaNombre || producto.categoriaNombre,
      imagenes: nuevasImagenes
    });

    res.status(200).json({ mensaje: 'Producto actualizado.', producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar.' });
  }
};

// ========================================================
// 🗑️ Eliminar un producto
// ========================================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const resultado = await Producto.destroy({
      where: { productoid: id, negocioid }
    });

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    }

    res.status(200).json({ mensaje: 'Producto eliminado.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar.' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
