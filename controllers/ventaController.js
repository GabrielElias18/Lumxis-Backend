// ========================================================
// 📁 CONTROLADOR DE VENTAS (multi-tenant)
// ========================================================

// ========================================================
// ➕ Registrar una venta
// ========================================================
const createVenta = async (req, res) => {
  try {
    const { productoNombre, cantidad, descripcion } = req.body;
    const usuarioid = req.usuario.usuarioid;
    const Venta = req.db.Venta;
    const Producto = req.db.Product;

    const producto = await Producto.findOne({ where: { nombre: productoNombre, usuarioid } });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    if (producto.cantidadDisponible < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    const total = cantidad * producto.precioVenta;

    const nuevaVenta = await Venta.create({
      productoNombre,
      cantidad,
      precioVenta: producto.precioVenta,
      total,
      descripcion,
      usuarioid
    });

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
    const usuarioid = req.usuario.usuarioid;
    const Venta = req.db.Venta;

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
    const usuarioid = req.usuario.usuarioid;
    const Venta = req.db.Venta;
    const Producto = req.db.Product;

    const venta = await Venta.findOne({ where: { ventaid: id, usuarioid } });
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    const producto = await Producto.findOne({ where: { nombre: venta.productoNombre, usuarioid } });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const diferenciaCantidad = cantidad - venta.cantidad;

    if (producto.cantidadDisponible < diferenciaCantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente para actualizar la venta' });
    }

    const nuevoTotal = cantidad * producto.precioVenta;

    await venta.update({
      cantidad,
      total: nuevoTotal,
      descripcion
    });

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
    const usuarioid = req.usuario.usuarioid;
    const Venta = req.db.Venta;
    const Producto = req.db.Product;

    const venta = await Venta.findOne({ where: { ventaid: id, usuarioid } });
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    const producto = await Producto.findOne({ where: { nombre: venta.productoNombre, usuarioid } });
    if (producto) {
      await producto.update({
        cantidadDisponible: producto.cantidadDisponible + venta.cantidad
      });
    }

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
