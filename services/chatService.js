const Venta = require('../models/ventaModel');
const VentaDetalle = require('../models/ventaDetalleModel');
const Egreso = require('../models/egresoModel');
const EgresoDetalle = require('../models/egresoDetalleModel');
const Producto = require('../models/productModel');
const Categoria = require('../models/categoryModel');
const Cliente = require('../models/clientModel');
const Proveedor = require('../models/proveedorModel');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

const executeTool = async (toolName, args, negocioid, usuarioid) => {
  switch (toolName) {

    case 'get_ventas': {
      const where = { negocioid };
      if (args.fechaDesde && args.fechaHasta) {
        where.createdAt = {
          [Op.between]: [
            new Date(args.fechaDesde + 'T00:00:00.000Z'),
            new Date(args.fechaHasta + 'T23:59:59.999Z')
          ]
        };
      }
      const ventas = await Venta.findAll({
        where,
        include: [
          { model: VentaDetalle, as: 'detalles' },
          { model: Cliente, as: 'cliente', attributes: ['nombreCliente'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: Math.min(args.limit || 10, 50)
      });
      return ventas.map(v => ({
        id: v.ventaid,
        fecha: v.createdAt,
        total: Number(v.total),
        cliente: v.cliente?.nombreCliente || 'General',
        descripcion: v.descripcion || '',
        productos: v.detalles?.map(d => `${d.productoNombre} x${d.cantidad}`) || []
      }));
    }

    case 'get_egresos': {
      const where = { negocioid };
      if (args.fechaDesde && args.fechaHasta) {
        where.createdAt = {
          [Op.between]: [
            new Date(args.fechaDesde + 'T00:00:00.000Z'),
            new Date(args.fechaHasta + 'T23:59:59.999Z')
          ]
        };
      }
      const egresos = await Egreso.findAll({
        where,
        include: [
          { model: EgresoDetalle, as: 'detalles' },
          { model: Proveedor, as: 'proveedor', attributes: ['nombreProveedor'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: Math.min(args.limit || 10, 50)
      });
      return egresos.map(e => ({
        id: e.egresoid,
        fecha: e.createdAt,
        total: Number(e.total),
        proveedor: e.proveedor?.nombreProveedor || 'General',
        descripcion: e.descripcion || '',
        productos: e.detalles?.map(d => `${d.productoNombre} x${d.cantidad}`) || []
      }));
    }

    case 'get_productos': {
      const where = { negocioid };
      if (args.categoriaId) where.categoriaid = args.categoriaId;
      if (args.nombre) where.nombre = { [Op.iLike]: `%${args.nombre}%` };
      if (args.stockBajoUmbral !== undefined) {
        where.cantidadDisponible = { [Op.lte]: args.stockBajoUmbral };
      }
      const productos = await Producto.findAll({ where, order: [['nombre', 'ASC']] });
      return productos.map(p => ({
        id: p.productoid,
        nombre: p.nombre,
        stock: p.cantidadDisponible,
        precioCompra: Number(p.precioCompra),
        precioVenta: Number(p.precioVenta),
        categoria: p.categoriaNombre || ''
      }));
    }

    case 'get_clientes': {
      const where = { negocioid };
      if (args.nombre) where.nombreCliente = { [Op.iLike]: `%${args.nombre}%` };
      const clientes = await Cliente.findAll({ where, order: [['nombre_cliente', 'ASC']] });
      return clientes.map(c => ({
        id: c.clienteid,
        nombre: c.nombreCliente,
        correo: c.correo || '',
        telefono: c.telefono || ''
      }));
    }

    case 'get_proveedores': {
      const proveedores = await Proveedor.findAll({ where: { negocioid } });
      return proveedores.map(p => ({
        id: p.proveedorid,
        nombre: p.nombreProveedor,
        correo: p.correo || ''
      }));
    }

    case 'get_stats': {
      const year = args.year || new Date().getFullYear();
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      const [ventas, egresos] = await Promise.all([
        Venta.findAll({ where: { negocioid, createdAt: { [Op.between]: [start, end] } } }),
        Egreso.findAll({ where: { negocioid, createdAt: { [Op.between]: [start, end] } } })
      ]);
      const totalIngresos = ventas.reduce((s, v) => s + Number(v.total), 0);
      const totalEgresos = egresos.reduce((s, e) => s + Number(e.total), 0);
      return {
        año: year,
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos,
        totalVentas: ventas.length,
        totalEgresosCount: egresos.length,
        margenPorcentaje: totalIngresos > 0
          ? (((totalIngresos - totalEgresos) / totalIngresos) * 100).toFixed(1)
          : '0.0'
      };
    }

    case 'create_venta': {
      const t = await sequelize.transaction();
      try {
        const nuevaVenta = await Venta.create({
          usuarioid, negocioid,
          clienteid: args.clienteid || null,
          descripcion: args.descripcion || '',
          total: 0
        }, { transaction: t });

        let total = 0;
        for (const item of args.items) {
          const producto = await Producto.findOne({
            where: { nombre: item.productoNombre, negocioid },
            transaction: t, lock: true
          });
          if (!producto) throw new Error(`Producto no encontrado: ${item.productoNombre}`);
          if (producto.cantidadDisponible < item.cantidad) {
            throw new Error(`Stock insuficiente para ${item.productoNombre} (disponible: ${producto.cantidadDisponible})`);
          }
          const subtotal = item.cantidad * producto.precioVenta;
          total += subtotal;
          await VentaDetalle.create({
            ventaid: nuevaVenta.ventaid,
            productoNombre: item.productoNombre,
            cantidad: item.cantidad,
            precioUnitario: producto.precioVenta,
            subtotal,
            categoriaid: producto.categoriaid
          }, { transaction: t });
          await producto.update(
            { cantidadDisponible: producto.cantidadDisponible - item.cantidad },
            { transaction: t }
          );
        }

        await nuevaVenta.update({ total }, { transaction: t });
        await t.commit();
        return { ventaid: nuevaVenta.ventaid, total, mensaje: `Venta registrada correctamente. Total: $${total.toLocaleString('es-CO')}` };
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }

    case 'create_egreso': {
      const t = await sequelize.transaction();
      try {
        const nuevoEgreso = await Egreso.create({
          usuarioid, negocioid,
          proveedorid: args.proveedorid || null,
          descripcion: args.descripcion || '',
          total: 0
        }, { transaction: t });

        let total = 0;
        for (const item of args.items) {
          const producto = await Producto.findOne({
            where: { nombre: item.productoNombre, negocioid },
            transaction: t, lock: true
          });
          if (!producto) throw new Error(`Producto no encontrado: ${item.productoNombre}`);
          const subtotal = item.cantidad * producto.precioCompra;
          total += subtotal;
          await EgresoDetalle.create({
            egresoid: nuevoEgreso.egresoid,
            productoNombre: item.productoNombre,
            cantidad: item.cantidad,
            precioUnitario: producto.precioCompra,
            subtotal,
            categoriaid: producto.categoriaid
          }, { transaction: t });
          await producto.update(
            { cantidadDisponible: producto.cantidadDisponible + item.cantidad },
            { transaction: t }
          );
        }

        await nuevoEgreso.update({ total }, { transaction: t });
        await t.commit();
        return { egresoid: nuevoEgreso.egresoid, total, mensaje: `Egreso registrado correctamente. Total: $${total.toLocaleString('es-CO')}` };
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }

    case 'create_producto': {
      const categoria = await Categoria.findOne({
        where: { nombre: args.categoriaNombre, negocioid }
      });
      if (!categoria) throw new Error(`Categoría no encontrada: "${args.categoriaNombre}"`);

      const producto = await Producto.create({
        nombre: args.nombre,
        descripcion: args.descripcion || '',
        cantidadDisponible: args.cantidadDisponible || 0,
        precioCompra: args.precioCompra,
        precioVenta: args.precioVenta,
        imagenes: [],
        categoriaNombre: args.categoriaNombre,
        categoriaid: categoria.categoriaid,
        usuarioid,
        negocioid
      });
      return { productoid: producto.productoid, nombre: producto.nombre, mensaje: `Producto "${args.nombre}" creado correctamente` };
    }

    case 'create_cliente': {
      const existente = await Cliente.findOne({ where: { nombreCliente: args.nombreCliente, negocioid } });
      if (existente) throw new Error(`Ya existe un cliente con el nombre "${args.nombreCliente}"`);
      const cliente = await Cliente.create({
        nombreCliente: args.nombreCliente,
        correo: args.correo || null,
        telefono: args.telefono || null,
        usuarioid,
        negocioid
      });
      return { clienteid: cliente.clienteid, nombreCliente: cliente.nombreCliente, mensaje: `Cliente "${args.nombreCliente}" registrado correctamente` };
    }

    case 'create_categoria': {
      const existente = await Categoria.findOne({ where: { nombre: args.nombre, negocioid } });
      if (existente) throw new Error(`Ya existe una categoría con el nombre "${args.nombre}"`);
      const categoria = await Categoria.create({
        nombre: args.nombre,
        descripcion: args.descripcion || '',
        usuarioid,
        negocioid
      });
      return { categoriaid: categoria.categoriaid, nombre: categoria.nombre, mensaje: `Categoría "${args.nombre}" creada correctamente` };
    }

    case 'update_producto': {
      const producto = await Producto.findOne({ where: { productoid: args.productoid, negocioid } });
      if (!producto) throw new Error('Producto no encontrado');
      const updates = {};
      if (args.precioCompra !== undefined) updates.precioCompra = args.precioCompra;
      if (args.precioVenta !== undefined) updates.precioVenta = args.precioVenta;
      if (args.cantidadDisponible !== undefined) updates.cantidadDisponible = args.cantidadDisponible;
      await producto.update(updates);
      return { mensaje: `Producto "${producto.nombre}" actualizado correctamente` };
    }

    case 'delete_producto': {
      const resultado = await Producto.destroy({ where: { productoid: args.productoid, negocioid } });
      if (!resultado) throw new Error('Producto no encontrado');
      return { mensaje: 'Producto eliminado correctamente' };
    }

    case 'delete_venta': {
      const t = await sequelize.transaction();
      try {
        const venta = await Venta.findOne({
          where: { ventaid: args.ventaid, negocioid },
          include: [{ model: VentaDetalle, as: 'detalles' }],
          transaction: t
        });
        if (!venta) throw new Error('Venta no encontrada');
        for (const detalle of venta.detalles) {
          const producto = await Producto.findOne({
            where: { nombre: detalle.productoNombre, negocioid }, transaction: t
          });
          if (producto) {
            await producto.update(
              { cantidadDisponible: producto.cantidadDisponible + detalle.cantidad },
              { transaction: t }
            );
          }
        }
        await venta.destroy({ transaction: t });
        await t.commit();
        return { mensaje: `Venta #${args.ventaid} eliminada y stock revertido` };
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }

    case 'delete_egreso': {
      const t = await sequelize.transaction();
      try {
        const egreso = await Egreso.findOne({
          where: { egresoid: args.egresoid, negocioid },
          include: [{ model: EgresoDetalle, as: 'detalles' }],
          transaction: t
        });
        if (!egreso) throw new Error('Egreso no encontrado');
        for (const detalle of egreso.detalles) {
          const producto = await Producto.findOne({
            where: { nombre: detalle.productoNombre, negocioid }, transaction: t
          });
          if (producto) {
            await producto.update(
              { cantidadDisponible: producto.cantidadDisponible - detalle.cantidad },
              { transaction: t }
            );
          }
        }
        await egreso.destroy({ transaction: t });
        await t.commit();
        return { mensaje: `Egreso #${args.egresoid} eliminado y stock revertido` };
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }

    case 'delete_cliente': {
      const resultado = await Cliente.destroy({ where: { clienteid: args.clienteid, negocioid } });
      if (!resultado) throw new Error('Cliente no encontrado');
      return { mensaje: 'Cliente eliminado correctamente' };
    }

    case 'get_categorias': {
      const where = { negocioid };
      if (args.nombre) where.nombre = { [Op.iLike]: `%${args.nombre}%` };
      const categorias = await Categoria.findAll({ where, order: [['nombre', 'ASC']] });
      return categorias.map(c => ({
        id: c.categoriaid,
        nombre: c.nombre,
        descripcion: c.descripcion || ''
      }));
    }

    case 'delete_categoria': {
      const resultado = await Categoria.destroy({ where: { categoriaid: args.categoriaid, negocioid } });
      if (!resultado) throw new Error('Categoría no encontrada');
      return { mensaje: 'Categoría eliminada correctamente' };
    }

    default:
      throw new Error(`Herramienta desconocida: ${toolName}`);
  }
};

module.exports = { executeTool };
