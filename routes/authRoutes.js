const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { verificarToken, verificarAdministrador } = require('../middleware/authMiddleware');

const router = express.Router();

// Registro público solo para vendedores
router.post('/register-public', registerUser);

// Registro exclusivo para administradores
router.post('/register-admin', verificarToken, verificarAdministrador, registerUser);

router.post('/login', loginUser);

// Ruta protegida para cualquier usuario autenticado
router.get('/perfil', verificarToken, (req, res) => {
  res.status(200).json({ mensaje: 'Ruta protegida accedida con éxito', usuario: req.usuario });
});

// Ruta exclusiva para administradores
router.get('/admin', verificarToken, verificarAdministrador, (req, res) => {
  res.status(200).json({ mensaje: 'Bienvenido, administrador.', usuario: req.usuario });
});

module.exports = router;
