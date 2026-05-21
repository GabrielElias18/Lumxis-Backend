const express = require('express');
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/usuariosController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verificarToken, verificarAdmin, getAllUsers);
router.post('/', verificarToken, verificarAdmin, createUser);
router.put('/:id', verificarToken, verificarAdmin, updateUser);
router.delete('/:id', verificarToken, verificarAdmin, deleteUser);

module.exports = router;
