const express = require('express');
const { getRoles, createRol, updateRol, deleteRol } = require('../controllers/rolesController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verificarToken, verificarAdmin, getRoles);
router.post('/', verificarToken, verificarAdmin, createRol);
router.put('/:id', verificarToken, verificarAdmin, updateRol);
router.delete('/:id', verificarToken, verificarAdmin, deleteRol);

module.exports = router;
