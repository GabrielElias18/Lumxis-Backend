const express = require('express');
const {
  createVenta,
  getVentas,
  getVentaById,
  updateVenta,
  deleteVenta
} = require('../controllers/ventaController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Registrar venta (soporta uno o muchos items)
router.post('/', verificarToken, createVenta);

// Obtener todas las ventas
router.get('/', verificarToken, getVentas);

// Obtener una venta por ID
router.get('/:id', verificarToken, getVentaById);

// Actualizar venta (PATCH)
router.patch('/:id', verificarToken, updateVenta);

// Eliminar venta
router.delete('/:id', verificarToken, deleteVenta);

module.exports = router;
