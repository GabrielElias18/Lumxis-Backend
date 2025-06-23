const express = require('express');
const { createVenta, getVentas, updateVenta, deleteVenta } = require('../controllers/ventaController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// 📌 Registrar una venta
router.post('/', verificarToken, createVenta);

// 📌 Obtener todas las ventas del usuario
router.get('/', verificarToken, getVentas);

// 📌 Editar una venta
router.put('/:id', verificarToken, updateVenta);

// 📌 Eliminar una venta
router.delete('/:id', verificarToken, deleteVenta);

module.exports = router;
