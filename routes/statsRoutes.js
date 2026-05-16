const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verificarToken } = require('../middleware/authMiddleware'); // Asegúrate de que el path sea correcto

// Ruta para obtener estadísticas generales
router.get('/dashboard', verificarToken, statsController.getDashboardStats);

module.exports = router;
