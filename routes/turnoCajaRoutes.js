const express = require('express');
const { abrir, getActivo, cerrar, getTurnos } = require('../controllers/turnoCajaController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/abrir', verificarToken, abrir);
router.post('/cerrar', verificarToken, cerrar);
router.get('/activo', verificarToken, getActivo);
router.get('/', verificarToken, verificarAdmin, getTurnos);

module.exports = router;
