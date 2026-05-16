const Venta = require('../models/ventaModel');
const VentaDetalle = require('../models/ventaDetalleModel');
const Producto = require('../models/productModel');
const sequelize = require('../config/database');

// ========================================================
// ➕ Crear Venta (Soporta uno o muchos productos)
// ========================================================
const createVenta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { clienteid, descripcion, items } = req.body;
    const { usuarioid, negocioid } = req.usuario;

    let productosAProcesar = Array.isArray(items) ? items : [];
    if (productosAProcesar.length === 0) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Debe incluir al menos un producto' });
    }

    const nuevaVenta = await Venta.create({
      usuarioid,
      negocioid,
      clienteid: clienteid || null,
      descripcion: descripcion || '',
      total: 0 
    }, { transaction: t });

    let totalVenta = 0;

    for (const item of productosAProcesar) {
      const { productoNombre, cantidad } = item;

      const producto = await Producto.findOne({
        where: { nombre: productoNombre, negocioid },
        transaction: t,
        lock: true
      });

      if (!producto) {
        throw new Error(`Producto no encontrado: ${productoNombre}`);
      }

      if (producto.cantidadDisponible < cantidad) {
        throw new Error(`Stock insuficiente para ${productoNombre}.`);
      }

      const subtotal = cantidad * producto.precioVenta;
      totalVenta += subtotal;

      await VentaDetalle.create({
        ventaid: nuevaVenta.ventaid,
        productoNombre,
        cantidad,
        precioUnitario: producto.precioVenta,
        subtotal,
        categoriaid: producto.categoriaid
      }, { transaction: t });

      await producto.update({
        cantidadDisponible: producto.cantidadDisponible - cantidad
      }, { transaction: t });
    }

    await nuevaVenta.update({ total: totalVenta }, { transaction: t });
    await t.commit();

    const ventaCompleta = await Venta.findByPk(nuevaVenta.ventaid, {
      include: [
        { model: VentaDetalle, as: 'detalles' }, 
        { model: require('../models/clientModel'), as: 'cliente', attributes: ['nombreCliente'] }
      ]
    });

    res.status(201).json(ventaCompleta);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al registrar la venta', error: error.message });
  }
};

// ========================================================
// 🔍 Obtener todas las ventas del NEGOCIO
// ========================================================
const getVentas = async (req, res) => {
  try {
    const { negocioid } = req.usuario;
    const ventas = await Venta.findAll({
      where: { negocioid },
      include: [
        { model: VentaDetalle, as: 'detalles' },
        { model: require('../models/clientModel'), as: 'cliente', attributes: ['nombreCliente'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las ventas', error: error.message });
  }
};

// ========================================================
// 🔍 Obtener una venta por ID
// ========================================================
const getVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const venta = await Venta.findOne({
      where: { ventaid: id, negocioid },
      include: [
        { model: VentaDetalle, as: 'detalles' },
        { model: require('../models/clientModel'), as: 'cliente', attributes: ['nombreCliente'] }
      ]
    });

    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la venta', error: error.message });
  }
};

// ========================================================
// ✏️ Actualizar Venta (PATCH)
// ========================================================
const updateVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;
    const { descripcion, clienteid } = req.body;

    const venta = await Venta.findOne({ where: { ventaid: id, negocioid } });
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    await venta.update({
      descripcion: descripcion !== undefined ? descripcion : venta.descripcion,
      clienteid: clienteid !== undefined ? clienteid : venta.clienteid
    });

    res.json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la venta', error: error.message });
  }
};

// ========================================================
// 🗑️ Eliminar Venta (Revierte Stock)
// ========================================================
const deleteVenta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const venta = await Venta.findOne({
      where: { ventaid: id, negocioid },
      include: [{ model: VentaDetalle, as: 'detalles' }],
      transaction: t
    });

    if (!venta) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    for (const detalle of venta.detalles) {
      const producto = await Producto.findOne({
        where: { nombre: detalle.productoNombre, negocioid },
        transaction: t
      });
      if (producto) {
        await producto.update({
          cantidadDisponible: producto.cantidadDisponible + detalle.cantidad
        }, { transaction: t });
      }
    }

    await venta.destroy({ transaction: t });
    await t.commit();
    res.json({ mensaje: 'Venta eliminada y stock revertido' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al eliminar la venta', error: error.message });
  }
};

module.exports = {
  createVenta,
  getVentas,
  getVentaById,
  updateVenta,
  deleteVenta
};
