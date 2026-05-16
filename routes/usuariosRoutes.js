const express = require('express');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/usuariosController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verificarToken, getAllUsers);
router.put('/:id', verificarToken, updateUser);
router.delete('/:id', verificarToken, deleteUser);

module.exports = router;
