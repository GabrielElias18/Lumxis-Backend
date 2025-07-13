// ======================================================
// 📤 RUTAS PARA GESTIÓN DE EGRESOS DE INVENTARIO
// ======================================================

const express = require('express');

// Controladores de egresos
const {
  createEgreso,
  getEgresos,
  updateEgreso,
  deleteEgreso
} = require('../controllers/egresoController');

// Middlewares
const { verificarToken } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware'); // 👈 Necesario para multi-tenant

// Instancia del router
const router = express.Router();

router.post('/', verificarToken, tenantMiddleware, createEgreso);

router.get('/', verificarToken, tenantMiddleware, getEgresos);

router.put('/:id', verificarToken, tenantMiddleware, updateEgreso);

router.delete('/:id', verificarToken, tenantMiddleware, deleteEgreso);

// Exportar router
module.exports = router;
