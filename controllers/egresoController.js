const Egreso = require('../models/egresoModel');
const Producto = require('../models/productModel');

// 📌 Registrar un egreso
const createEgreso = async (req, res) => {
  try {
    const { productoNombre, cantidad, descripcion } = req.body;
    const usuarioid = req.usuario.usuarioId; // Usuario autenticado

    // Buscar el producto por nombre y usuarioid
    const producto = await Producto.findOne({ where: { nombre: productoNombre, usuarioid } });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Obtener el precio de compra desde el producto
    const precioCompra = producto.precioCompra;

    // Calcular el total del egreso
    const total = cantidad * precioCompra;

    // Crear el egreso en la base de datos
    const nuevoEgreso = await Egreso.create({
      productoNombre,
      cantidad,
      precioCompra,
      total,
      descripcion,
      usuarioid
    });

    // Actualizar el stock del producto (incrementar la cantidad disponible)
    await producto.update({ cantidadDisponible: producto.cantidadDisponible + cantidad });

    res.status(201).json(nuevoEgreso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el egreso', error: error.message });
  }
};

// 📌 Obtener todos los egresos de un usuario
const getEgresos = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioId;
    
    const egresos = await Egreso.findAll({
      where: { usuarioid },
      order: [['createdAt', 'DESC']]
    });

    res.json(egresos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los egresos', error: error.message });
  }
};

// 📌 Editar un egreso
const updateEgreso = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, descripcion } = req.body;
    const usuarioid = req.usuario.usuarioId;

    // Buscar el egreso por ID y usuario
    const egreso = await Egreso.findOne({ where: { egresoid: id, usuarioid } });
    if (!egreso) {
      return res.status(404).json({ mensaje: 'Egreso no encontrado' });
    }

    // Buscar el producto asociado al egreso
    const producto = await Producto.findOne({ where: { nombre: egreso.productoNombre, usuarioid } });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Ajustar el stock
    const diferenciaCantidad = cantidad - egreso.cantidad;
    await producto.update({ cantidadDisponible: producto.cantidadDisponible + diferenciaCantidad });

    // Recalcular total
    const nuevoTotal = cantidad * producto.precioCompra;

    // Actualizar el egreso
    await egreso.update({ cantidad, total: nuevoTotal, descripcion });

    res.json(egreso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el egreso', error: error.message });
  }
};

// 📌 Eliminar un egreso
const deleteEgreso = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioid = req.usuario.usuarioId;

    // Buscar el egreso por ID y usuario
    const egreso = await Egreso.findOne({ where: { egresoid: id, usuarioid } });
    if (!egreso) {
      return res.status(404).json({ mensaje: 'Egreso no encontrado' });
    }

    // Buscar el producto asociado al egreso
    const producto = await Producto.findOne({ where: { nombre: egreso.productoNombre, usuarioid } });
    if (producto) {
      // Revertir el stock
      await producto.update({ cantidadDisponible: producto.cantidadDisponible - egreso.cantidad });
    }

    // Eliminar el egreso
    await egreso.destroy();

    res.json({ mensaje: 'Egreso eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el egreso', error: error.message });
  }
};

module.exports = { createEgreso, getEgresos, updateEgreso, deleteEgreso };