const Venta = require('../models/ventaModel');
const Egreso = require('../models/egresoModel');
const Producto = require('../models/productModel');
const sequelize = require('../config/database');

const fixCategories = async () => {
  try {
    console.log('🔄 Iniciando vinculación de categorías para registros antiguos...');
    
    // Obtener todas las ventas sin categoriaid
    const ventasSinCat = await Venta.findAll({ where: { categoriaid: null } });
    console.log(`📊 Encontradas ${ventasSinCat.length} ventas sin categoría.`);

    for (const venta of ventasSinCat) {
      const producto = await Producto.findOne({ 
        where: { nombre: venta.productoNombre, usuarioid: venta.usuarioid } 
      });
      if (producto) {
        await venta.update({ categoriaid: producto.categoriaid });
        console.log(`✅ Venta ${venta.ventaid} vinculada a categoría ${producto.categoriaid}`);
      }
    }

    // Obtener todos los egresos sin categoriaid
    const egresosSinCat = await Egreso.findAll({ where: { categoriaid: null } });
    console.log(`📊 Encontrados ${egresosSinCat.length} egresos sin categoría.`);

    for (const egreso of egresosSinCat) {
      const producto = await Producto.findOne({ 
        where: { nombre: egreso.productoNombre, usuarioid: egreso.usuarioid } 
      });
      if (producto) {
        await egreso.update({ categoriaid: producto.categoriaid });
        console.log(`✅ Egreso ${egreso.egresoid} vinculado a categoría ${producto.categoriaid}`);
      }
    }

    console.log('✨ Proceso finalizado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
};

fixCategories();
