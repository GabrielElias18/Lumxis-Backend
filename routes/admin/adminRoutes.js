const express = require('express');
const { getAllUsers, createUser, updateUser, deleteUser } = require('../../controllers/admin/AdminController');
const { verificarToken, verificarAdministrador } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/usuarios', verificarToken, verificarAdministrador, getAllUsers); // Obtener todos los usuarios
router.post('/usuarios', verificarToken, verificarAdministrador, createUser); // Crear usuario
router.put('/usuarios/:id', verificarToken, verificarAdministrador, updateUser); // Editar usuario
router.delete('/usuarios/:id', verificarToken, verificarAdministrador, deleteUser); // Eliminar usuario

module.exports = router;
