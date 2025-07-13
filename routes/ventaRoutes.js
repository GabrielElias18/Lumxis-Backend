// ======================================================
// 💰 RUTAS PARA GESTIÓN DE VENTAS (INGRESOS)
// ======================================================

const express = require('express');
const {
  createVenta,
  getVentas,
  updateVenta,
  deleteVenta
} = require('../controllers/ventaController');

const { verificarToken } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware'); // 👈 AÑADIR ESTO

const router = express.Router();

// Asegúrate de usar ambos middlewares: auth + tenant
router.post('/', verificarToken, tenantMiddleware, createVenta);
router.get('/', verificarToken, tenantMiddleware, getVentas);
router.put('/:id', verificarToken, tenantMiddleware, updateVenta);
router.delete('/:id', verificarToken, tenantMiddleware, deleteVenta);

module.exports = router;
