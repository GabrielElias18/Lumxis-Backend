// ======================================================
// 💰 RUTAS PARA GESTIÓN DE VENTAS (INGRESOS)
// ======================================================

const express = require('express');

// Importamos funciones del controlador de ventas
const {
  createVenta,
  getVentas,
  updateVenta,
  deleteVenta
} = require('../controllers/ventaController');

// Middleware para verificar autenticación por token
const { verificarToken } = require('../middleware/authMiddleware');

// Creamos una instancia de Router
const router = express.Router();

// ===============================================
// ➕ Registrar una nueva venta
// ===============================================
// Ruta: POST /api/ventas/
router.post('/', verificarToken, createVenta);

// ===============================================
// 📄 Obtener todas las ventas del usuario autenticado
// ===============================================
// Ruta: GET /api/ventas/
router.get('/', verificarToken, getVentas);

// ===============================================
// ✏️ Editar una venta por su ID
// ===============================================
// Ruta: PUT /api/ventas/:id
router.put('/:id', verificarToken, updateVenta);

// ===============================================
// 🗑️ Eliminar una venta por su ID
// ===============================================
// Ruta: DELETE /api/ventas/:id
router.delete('/:id', verificarToken, deleteVenta);

// Exportamos el router para utilizarlo en el archivo principal
module.exports = router;
