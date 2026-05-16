const express = require('express');
const { getNegocio, updateNegocio } = require('../controllers/negocioController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verificarToken, getNegocio);
router.put('/', verificarToken, updateNegocio);

module.exports = router;
