const Venta = require('../models/ventaModel');
const VentaDetalle = require('../models/ventaDetalleModel');
const Egreso = require('../models/egresoModel');
const Categoria = require('../models/categoryModel');
const { Op, fn, col } = require('sequelize');

/**
 * Obtiene las estadísticas detalladas para el dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const { negocioid } = req.usuario;
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startYear = new Date(`${targetYear}-01-01`);
    const endYear = new Date(`${targetYear}-12-31 23:59:59`);

    // 1. KPIs Generales (Anuales filtrados por NEGOCIO)
    const ventasAnio = await Venta.findAll({
      where: {
        negocioid,
        createdAt: { [Op.between]: [startYear, endYear] }
      }
    });

    const egresosAnio = await Egreso.findAll({
      where: {
        negocioid,
        createdAt: { [Op.between]: [startYear, endYear] }
      }
    });

    const totalIngresos = ventasAnio.reduce((sum, v) => sum + Number(v.total), 0);
    const totalEgresos = egresosAnio.reduce((sum, e) => sum + Number(e.total), 0);
    const balance = totalIngresos - totalEgresos;
    const totalVentasCount = ventasAnio.length;

    // 2. Flujo Mensual
    const monthlyFlow = Array.from({ length: 12 }, (_, i) => ({
      name: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
      Ingresos: 0,
      Gastos: 0
    }));

    ventasAnio.forEach(v => {
      const month = new Date(v.createdAt).getMonth();
      monthlyFlow[month].Ingresos += Number(v.total);
    });

    egresosAnio.forEach(e => {
      const month = new Date(e.createdAt).getMonth();
      monthlyFlow[month].Gastos += Number(e.total);
    });

    // 3. Top Productos (Basado en VentaDetalle y filtrado por Negocio en el Join)
    const topProductsRaw = await VentaDetalle.findAll({
      attributes: [
        'productoNombre',
        [fn('SUM', col('cantidad')), 'totalVendida']
      ],
      include: [{
        model: Venta,
        as: 'venta',
        attributes: [],
        where: {
          negocioid,
          createdAt: { [Op.between]: [startYear, endYear] }
        }
      }],
      group: ['productoNombre'],
      order: [[fn('SUM', col('cantidad')), 'DESC']],
      limit: 8
    });

    const topProducts = topProductsRaw.map(p => ({
      name: p.productoNombre,
      value: parseInt(p.getDataValue('totalVendida'))
    }));

    // 4. Distribución por Categoría
    const categoryDistRaw = await VentaDetalle.findAll({
      attributes: [
        [fn('SUM', col('subtotal')), 'totalVentas']
      ],
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['nombre']
        },
        {
          model: Venta,
          as: 'venta',
          attributes: [],
          where: {
            negocioid,
            createdAt: { [Op.between]: [startYear, endYear] }
          }
        }
      ],
      group: ['categoria.categoriaid', 'categoria.nombre'],
      order: [[fn('SUM', col('subtotal')), 'DESC']]
    });

    const categoryData = categoryDistRaw.map(c => ({
      name: c.categoria ? c.categoria.nombre : 'Sin Categoría',
      value: parseFloat(c.getDataValue('totalVentas'))
    }));

    res.json({
      kpis: {
        totalIngresos,
        totalEgresos,
        balance,
        totalVentasCount
      },
      monthlyFlow,
      topProducts,
      categoryData
    });

  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ mensaje: 'Error al generar estadísticas' });
  }
};

module.exports = {
  getDashboardStats
};
