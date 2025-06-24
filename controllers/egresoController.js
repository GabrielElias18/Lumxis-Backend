// ======================================================
// 📁 CONTROLADOR DE EGRESOS (Entradas al inventario)
// ======================================================

const Egreso = require('../models/egresoModel');
const Producto = require('../models/productModel');

// ===============================================
// ➕ Registrar un nuevo egreso
// ===============================================
const createEgreso = async (req, res) => {
  try {
    const { productoNombre, cantidad, descripcion } = req.body;
    const usuarioid = req.usuario.usuarioId;

    // 🔍 Buscar el producto al que se le hará el egreso
    const producto = await Producto.findOne({
      where: { nombre: productoNombre, usuarioid }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // 💰 Obtener el precio de compra para calcular el total del egreso
    const precioCompra = producto.precioCompra;
    const total = cantidad * precioCompra;

    // 🏗️ Crear el egreso en la base de datos
    const nuevoEgreso = await Egreso.create({
      productoNombre,
      cantidad,
      precioCompra,
      total,
      descripcion,
      usuarioid
    });

    // 📦 Aumentar el stock del producto
    await producto.update({
      cantidadDisponible: producto.cantidadDisponible + cantidad
    });

    res.status(201).json(nuevoEgreso);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar el egreso',
      error: error.message
    });
  }
};

// ===============================================
// 📄 Obtener todos los egresos de un usuario
// ===============================================
const getEgresos = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioId;

    const egresos = await Egreso.findAll({
      where: { usuarioid },
      order: [['createdAt', 'DESC']]
    });

    res.json(egresos);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener los egresos',
      error: error.message
    });
  }
};

// ===============================================
// ✏️ Editar un egreso
// ===============================================
const updateEgreso = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, descripcion } = req.body;
    const usuarioid = req.usuario.usuarioId;

    // 🔍 Buscar el egreso actual
    const egreso = await Egreso.findOne({
      where: { egresoid: id, usuarioid }
    });

    if (!egreso) {
      return res.status(404).json({ mensaje: 'Egreso no encontrado' });
    }

    // 🔍 Buscar el producto relacionado al egreso
    const producto = await Producto.findOne({
      where: { nombre: egreso.productoNombre, usuarioid }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // 📦 Ajustar el stock con la diferencia entre la nueva cantidad y la anterior
    const diferenciaCantidad = cantidad - egreso.cantidad;
    await producto.update({
      cantidadDisponible: producto.cantidadDisponible + diferenciaCantidad
    });

    // 💰 Recalcular total
    const nuevoTotal = cantidad * producto.precioCompra;

    // ✏️ Actualizar el egreso
    await egreso.update({
      cantidad,
      total: nuevoTotal,
      descripcion
    });

    res.json(egreso);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar el egreso',
      error: error.message
    });
  }
};

// ===============================================
// 🗑️ Eliminar un egreso
// ===============================================
const deleteEgreso = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioid = req.usuario.usuarioId;

    // 🔍 Buscar el egreso a eliminar
    const egreso = await Egreso.findOne({
      where: { egresoid: id, usuarioid }
    });

    if (!egreso) {
      return res.status(404).json({ mensaje: 'Egreso no encontrado' });
    }

    // 🔍 Buscar el producto relacionado
    const producto = await Producto.findOne({
      where: { nombre: egreso.productoNombre, usuarioid }
    });

    if (producto) {
      // 📉 Revertir el aumento del stock si se elimina el egreso
      await producto.update({
        cantidadDisponible: producto.cantidadDisponible - egreso.cantidad
      });
    }

    // 🧹 Eliminar el egreso
    await egreso.destroy();

    res.json({ mensaje: 'Egreso eliminado correctamente' });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar el egreso',
      error: error.message
    });
  }
};

// ===============================================
// 📤 Exportar funciones del controlador
// ===============================================
module.exports = {
  createEgreso,
  getEgresos,
  updateEgreso,
  deleteEgreso
};
