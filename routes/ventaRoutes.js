const express = require('express');
const {
  createVenta,
  getVentas,
  getVentaById,
  getVentaDetalle,
  updateVenta,
  deleteVenta,
} = require('../controllers/ventaController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verificarToken, createVenta);
router.get('/', verificarToken, getVentas);

// DEBE IR ANTES de /:id para que Express no confunda "detalle" con un id numérico
router.get('/:id/detalle', verificarToken, getVentaDetalle);

router.get('/:id', verificarToken, getVentaById);
router.patch('/:id', verificarToken, updateVenta);
router.delete('/:id', verificarToken, deleteVenta);

module.exports = router;
