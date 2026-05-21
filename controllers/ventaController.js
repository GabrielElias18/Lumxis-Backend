const Venta = require('../models/ventaModel');
const VentaDetalle = require('../models/ventaDetalleModel');
const VentaPago = require('../models/ventaPagoModel');
const Producto = require('../models/productModel');
const TurnoCaja = require('../models/turnoCajaModel');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// ========================================================
// ➕ Crear Venta (Soporta uno o muchos productos, pagos mixtos y descuentos)
// ========================================================
const createVenta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      clienteid,
      descripcion,
      items,
      descuentoTotal = 0,
      descuentoTipoTotal = 'fijo',
      pagos = [],
    } = req.body;
    const { usuarioid, negocioid } = req.usuario;

    const turnoActivo = await TurnoCaja.findOne({
      where: { usuarioid, negocioid, estado: 'abierto' },
    });
    if (!turnoActivo) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Debes abrir un turno de caja antes de registrar ventas.' });
    }

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
      total: 0,
      descuentoTotal: 0,
      descuentoTipoTotal: 'fijo',
      turnoid: turnoActivo.turnoid,
    }, { transaction: t });

    let totalAntes = 0;

    for (const item of productosAProcesar) {
      const { productoNombre, cantidad, descuento = 0, descuentoTipo = 'fijo' } = item;

      const producto = await Producto.findOne({
        where: { nombre: productoNombre, negocioid },
        transaction: t,
        lock: true,
      });

      if (!producto) {
        throw new Error(`Producto no encontrado: ${productoNombre}`);
      }

      if (producto.cantidadDisponible < cantidad) {
        throw new Error(`Stock insuficiente para ${productoNombre}.`);
      }

      const subtotalItem = cantidad * Number(producto.precioVenta);
      const descuentoItem = descuentoTipo === 'porcentaje'
        ? subtotalItem * (Number(descuento) / 100)
        : Number(descuento);

      if (descuentoItem < 0 || descuentoItem > subtotalItem) {
        throw new Error(`Descuento inválido para ${productoNombre}.`);
      }

      const netoItem = subtotalItem - descuentoItem;
      const tasaIva = Number(producto.tasaIva || 0);
      const montoIva = tasaIva > 0 ? netoItem * tasaIva / (100 + tasaIva) : 0;
      totalAntes += netoItem;

      await VentaDetalle.create({
        ventaid: nuevaVenta.ventaid,
        productoNombre,
        cantidad,
        precioUnitario: producto.precioVenta,
        subtotal: netoItem,
        descuento: Number(descuento),
        descuentoTipo,
        categoriaid: producto.categoriaid,
        tasaIva,
        montoIva: Number(montoIva.toFixed(2)),
      }, { transaction: t });

      await producto.update({
        cantidadDisponible: producto.cantidadDisponible - cantidad,
      }, { transaction: t });
    }

    const descuentoVenta = descuentoTipoTotal === 'porcentaje'
      ? totalAntes * (Number(descuentoTotal) / 100)
      : Number(descuentoTotal);

    if (descuentoVenta < 0 || descuentoVenta > totalAntes) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Descuento total inválido.' });
    }

    const totalFinal = totalAntes - descuentoVenta;

    if (pagos.length > 0) {
      const sumPagos = pagos.reduce((acc, p) => acc + Number(p.monto), 0);
      if (sumPagos < totalFinal) {
        await t.rollback();
        return res.status(400).json({
          mensaje: `Pago insuficiente. Faltan $${(totalFinal - sumPagos).toFixed(2)}`,
        });
      }

      for (const pago of pagos) {
        await VentaPago.create({
          ventaid: nuevaVenta.ventaid,
          metodo: pago.metodo,
          monto: Number(pago.monto),
        }, { transaction: t });
      }
    }

    await nuevaVenta.update({
      total: totalFinal,
      descuentoTotal: Number(descuentoTotal),
      descuentoTipoTotal,
    }, { transaction: t });

    await t.commit();

    const ventaCompleta = await Venta.findByPk(nuevaVenta.ventaid, {
      include: [
        { model: VentaDetalle, as: 'detalles' },
        { model: VentaPago, as: 'pagos' },
        { model: require('../models/clientModel'), as: 'cliente', attributes: ['nombreCliente'] },
      ],
    });

    res.status(201).json(ventaCompleta);
  } catch (error) {
    await t.rollback();
    const userFacing = ['Stock insuficiente', 'no encontrado', 'inválido'];
    if (userFacing.some((m) => error.message.includes(m))) {
      return res.status(400).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje: 'Error al registrar la venta' });
  }
};

// ========================================================
// 🔍 Obtener todas las ventas del NEGOCIO
// ========================================================
const getVentas = async (req, res) => {
  try {
    const { negocioid } = req.usuario;
    const { from, to } = req.query;

    const where = { negocioid };
    if (from && to) {
      where.createdAt = {
        [Op.between]: [
          new Date(from + 'T00:00:00.000Z'),
          new Date(to + 'T23:59:59.999Z')
        ]
      };
    }

    const ventas = await Venta.findAll({
      where,
      include: [
        { model: VentaDetalle, as: 'detalles' },
        { model: require('../models/clientModel'), as: 'cliente', attributes: ['nombreCliente'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las ventas' });
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
    res.status(500).json({ mensaje: 'Error al obtener la venta' });
  }
};

// ========================================================
// 🔍 Detalle completo de venta (con pagos)
// ========================================================
const getVentaDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { negocioid } = req.usuario;

    const venta = await Venta.findOne({
      where: { ventaid: id, negocioid },
      include: [
        { model: VentaDetalle, as: 'detalles' },
        { model: VentaPago, as: 'pagos' },
        { model: require('../models/clientModel'), as: 'cliente', attributes: ['nombreCliente'] },
      ],
    });

    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el detalle de la venta' });
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
    res.status(500).json({ mensaje: 'Error al actualizar la venta' });
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
    res.status(500).json({ mensaje: 'Error al eliminar la venta' });
  }
};

module.exports = {
  createVenta,
  getVentas,
  getVentaById,
  getVentaDetalle,
  updateVenta,
  deleteVenta,
};
