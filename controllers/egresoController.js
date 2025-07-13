// ======================================================
// 📁 CONTROLADOR DE EGRESOS (Entradas al inventario)
// ======================================================

// ===============================================
// ➕ Registrar un nuevo egreso
// ===============================================
const createEgreso = async (req, res) => {
  try {
    const { productoNombre, cantidad, descripcion } = req.body;
    const usuarioid = req.usuario.usuarioid;

    const Egreso = req.db.Egreso;
    const Producto = req.db.Product;

    const producto = await Producto.findOne({
      where: { nombre: productoNombre, usuarioid }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const precioCompra = producto.precioCompra;
    const total = cantidad * precioCompra;

    const nuevoEgreso = await Egreso.create({
      productoNombre,
      cantidad,
      precioCompra,
      total,
      descripcion,
      usuarioid
    });

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
    const usuarioid = req.usuario.usuarioid;
    const { Egreso } = req.db;

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
    const usuarioid = req.usuario.usuarioid;

    const Egreso = req.db.Egreso;
    const Producto = req.db.Product;

    const egreso = await Egreso.findOne({
      where: { egresoid: id, usuarioid }
    });

    if (!egreso) {
      return res.status(404).json({ mensaje: 'Egreso no encontrado' });
    }

    const producto = await Producto.findOne({
      where: { nombre: egreso.productoNombre, usuarioid }
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const diferenciaCantidad = cantidad - egreso.cantidad;
    await producto.update({
      cantidadDisponible: producto.cantidadDisponible + diferenciaCantidad
    });

    const nuevoTotal = cantidad * producto.precioCompra;

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
    const usuarioid = req.usuario.usuarioid;

    const Egreso = req.db.Egreso;
    const Producto = req.db.Product;

    const egreso = await Egreso.findOne({
      where: { egresoid: id, usuarioid }
    });

    if (!egreso) {
      return res.status(404).json({ mensaje: 'Egreso no encontrado' });
    }

    const producto = await Producto.findOne({
      where: { nombre: egreso.productoNombre, usuarioid }
    });

    if (producto) {
      await producto.update({
        cantidadDisponible: producto.cantidadDisponible - egreso.cantidad
      });
    }

    await egreso.destroy();

    res.json({ mensaje: 'Egreso eliminado correctamente' });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar el egreso',
      error: error.message
    });
  }
};

module.exports = {
  createEgreso,
  getEgresos,
  updateEgreso,
  deleteEgreso
};
