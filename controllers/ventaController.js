const Venta = require('../models/ventaModel');
const Producto = require('../models/productModel');

// ========================================================
// ➕ Registrar una venta
// ========================================================
const createVenta = async (req, res) => {
  try {
    const { productoNombre, cantidad, descripcion } = req.body;
    const usuarioid = req.usuario.usuarioId;

    // 🔍 Buscar el producto por nombre y usuario
    const producto = await Producto.findOne({ where: { nombre: productoNombre, usuarioid } });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    // 🛡️ Verificar stock disponible
    if (producto.cantidadDisponible < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    // 💰 Calcular total de la venta
    const total = cantidad * producto.precioVenta;

    // 🧾 Crear la venta
    const nuevaVenta = await Venta.create({
      productoNombre,
      cantidad,
      precioVenta: producto.precioVenta,
      total,
      descripcion,
      usuarioid
    });

    // 🧮 Actualizar stock del producto
    await producto.update({ cantidadDisponible: producto.cantidadDisponible - cantidad });

    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar la venta', error: error.message });
  }
};

// ========================================================
// 📄 Obtener todas las ventas del usuario
// ========================================================
const getVentas = async (req, res) => {
  try {
    const usuarioid = req.usuario.usuarioId;

    // 🔍 Traer ventas ordenadas por fecha descendente
    const ventas = await Venta.findAll({
      where: { usuarioid },
      order: [['createdAt', 'DESC']]
    });

    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las ventas', error: error.message });
  }
};

// ========================================================
// ✏️ Actualizar una venta
// ========================================================
const updateVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, descripcion } = req.body;
    const usuarioid = req.usuario.usuarioId;

    // 🔍 Buscar la venta por ID y usuario
    const venta = await Venta.findOne({ where: { ventaid: id, usuarioid } });
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    // 🔍 Buscar el producto relacionado
    const producto = await Producto.findOne({ where: { nombre: venta.productoNombre, usuarioid } });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // 🧮 Calcular la diferencia en cantidad
    const diferenciaCantidad = cantidad - venta.cantidad;

    // 🛡️ Validar stock suficiente si se aumenta la cantidad
    if (producto.cantidadDisponible < diferenciaCantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente para actualizar la venta' });
    }

    // 💰 Recalcular el total de la venta
    const nuevoTotal = cantidad * producto.precioVenta;

    // ✏️ Actualizar la venta
    await venta.update({
      cantidad,
      total: nuevoTotal,
      descripcion
    });

    // 🔄 Actualizar el stock del producto
    await producto.update({
      cantidadDisponible: producto.cantidadDisponible - diferenciaCantidad
    });

    res.json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la venta', error: error.message });
  }
};

// ========================================================
// 🗑️ Eliminar una venta
// ========================================================
const deleteVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioid = req.usuario.usuarioId;

    // 🔍 Buscar la venta
    const venta = await Venta.findOne({ where: { ventaid: id, usuarioid } });
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    // 🔄 Devolver el stock al producto
    const producto = await Producto.findOne({ where: { nombre: venta.productoNombre, usuarioid } });
    if (producto) {
      await producto.update({
        cantidadDisponible: producto.cantidadDisponible + venta.cantidad
      });
    }

    // 🧹 Eliminar la venta
    await venta.destroy();

    res.json({ mensaje: 'Venta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la venta', error: error.message });
  }
};

// ========================================================
// 📤 Exportar controladores
// ========================================================
module.exports = {
  createVenta,
  getVentas,
  updateVenta,
  deleteVenta
};
